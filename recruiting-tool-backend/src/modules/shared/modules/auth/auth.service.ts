import { BadRequestException, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { LoginDto, RegisteredUserDto, RefreshTokenDto, TokenPairDto, LinkedAccountsResponseDto } from './dto/auth.dto';
import * as bycrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto, UserWithPasswordResponseDto } from 'src/modules/users/dto/users.dto';
import { UserMapper } from 'src/modules/users/entities/users.entities';
import { UserActivityService } from 'src/modules/users/services/user-activity.service';
import { DatabaseService } from '../database/database.service';
import * as crypto from 'crypto';
import { EmailService } from 'src/modules/email/email.service';

@Injectable()
export class AuthService {
  // Access token: 15 minutes
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

  // Refresh token: 7 days
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userActivityService: UserActivityService,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async register({ name, email, password, roles, companyUid, companyName }: CreateUserDto): Promise<RegisteredUserDto> {
    const foundUser = await this.usersService.findByEmail(email);
    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    // Check if user is registering as COMPANY_OWNER
    const isCompanyOwner = roles && roles.includes('COMPANY_OWNER' as any);

    let finalCompanyUid = companyUid;

    // If COMPANY_OWNER role is selected, auto-create a company
    if (isCompanyOwner && !companyUid) {
      // Use provided company name, or extract from email domain as fallback
      let finalCompanyName = companyName;

      if (!finalCompanyName) {
        const emailDomain = email.split('@')[1];
        const domainName = emailDomain ? emailDomain.split('.')[0] : 'My Company';
        finalCompanyName = domainName.charAt(0).toUpperCase() + domainName.slice(1) + ' Inc';
      }

      // Create the company
      const newCompany = await this.databaseService.company.create({
        data: {
          name: finalCompanyName,
          description: `Company created for ${name}`,
        },
      });

      finalCompanyUid = newCompany.uid;
    }

    const user = await this.usersService.create({
      name,
      email,
      password,
      roles,
      companyUid: finalCompanyUid,
    });

    // Generate email verification token and send verification email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // Store verification token on user record — look up by uid since UserResponseDto has uid but not id
    await this.databaseService.user.update({
      where: { uid: user.uid },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: new Date(),
      },
    });

    // Send verification email (non-blocking - don't fail registration if email fails)
    try {
      await this.emailService.sendVerificationEmail(email, verificationLink);
    } catch {
      // Do not reveal email sending failures to the caller
    }

    const { token, refreshToken } = await this.login({ email, password });
    return {
      user,
      token,
      refreshToken,
    };
  }

  async login({ email, password }: LoginDto): Promise<RegisteredUserDto> {
    const foundUser = await this.usersService.findByEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('Email is wrong');
    }

    // Check if user is active
    if (!foundUser.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const isPasswordValid = await bycrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong');
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(foundUser.id, foundUser.email, foundUser.roles, foundUser.companyId);

    // Update last login time
    await this.usersService.updateLastLogin(foundUser.id);

    // Log the login activity
    await this.userActivityService.logActivity(foundUser.id, {
      action: 'LOGIN',
      metadata: { loginMethod: 'email' },
    });

    return {
      user: { ...UserMapper(foundUser) },
      token: accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<UserWithPasswordResponseDto> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);

      // Fetch fresh user data from database instead of using stale token data
      const freshUser = await this.usersService.findByEmail(decoded.email);

      if (!freshUser) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is active
      if (!freshUser.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      return freshUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  private async generateTokens(userId: number, email: string, roles: any[], companyId: number | null): Promise<{ accessToken: string; refreshToken: string }> {
    // Create minimal JWT payload for access token
    const payload = {
      sub: userId,
      id: userId,
      email,
      roles,
      companyId,
    };

    // Generate short-lived access token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    // Generate cryptographically secure refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Store refresh token in database
    await this.databaseService.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using a valid refresh token
   * Implements token rotation for security
   */
  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<TokenPairDto> {
    const { refreshToken } = refreshTokenDto;

    // Find the refresh token in the database
    const storedToken = await this.databaseService.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Validate token exists
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token has been revoked
    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Check if token has expired
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      storedToken.userId,
      storedToken.user.email,
      storedToken.user.roles,
      storedToken.user.companyId,
    );

    // Revoke old refresh token and mark it as replaced (token rotation)
    await this.databaseService.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedBy: newRefreshToken,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Revoke a specific refresh token (logout)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const storedToken = await this.databaseService.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      // Token doesn't exist, silently succeed
      return;
    }

    // Mark token as revoked
    await this.databaseService.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   * Useful for password changes or security events
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.databaseService.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null, // Only revoke active tokens
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Clean up expired and revoked tokens
   * Should be called periodically by a cron job
   */
  async cleanupExpiredTokens(): Promise<number> {
    // Delete tokens older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.databaseService.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired tokens
          { revokedAt: { lt: thirtyDaysAgo } }, // Revoked tokens older than 30 days
        ],
      },
    });

    return result.count;
  }

  /**
   * Mark user onboarding as complete
   */
  async completeOnboarding(userId: number): Promise<void> {
    await this.databaseService.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  }

  /**
   * Handle Auth0 social login callback
   * Links or creates user account based on Auth0 profile
   */
  async handleAuth0Callback(auth0User: { auth0Id: string; email: string; name: string; provider: string; emailVerified?: boolean }): Promise<RegisteredUserDto> {
    // Check if user already exists by auth0Id
    let user = await this.databaseService.user.findUnique({
      where: { auth0Id: auth0User.auth0Id },
    });

    // If not found by auth0Id, check by email
    if (!user && auth0User.email) {
      user = await this.databaseService.user.findFirst({
        where: {
          email: auth0User.email,
          companyId: null, // Only match users without company (prevents cross-company linking)
        },
      });

      // If found by email, link Auth0 identity
      if (user) {
        user = await this.databaseService.user.update({
          where: { id: user.id },
          data: {
            auth0Id: auth0User.auth0Id,
            provider: auth0User.provider,
          },
        });
      }
    }

    // If still no user, create new account
    if (!user) {
      user = await this.databaseService.user.create({
        data: {
          email: auth0User.email,
          name: auth0User.name,
          auth0Id: auth0User.auth0Id,
          provider: auth0User.provider,
          password: null, // No password for social login users
          roles: ['USER' as any],
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.roles, user.companyId);

    // Update last login time
    await this.usersService.updateLastLogin(user.id);

    // Log the login activity
    await this.userActivityService.logActivity(user.id, {
      action: 'LOGIN',
      metadata: { loginMethod: auth0User.provider },
    });

    return {
      user: { ...UserMapper(user) },
      token: accessToken,
      refreshToken,
    };
  }

  /**
   * Link a social account (Auth0) to the current user
   * Prevents linking if auth0Id already belongs to another user
   */
  async linkSocialAccount(
    userId: number,
    auth0User: {
      auth0Id: string;
      email: string;
      name: string;
      provider: string;
      emailVerified?: boolean;
    },
  ): Promise<{ message: string }> {
    // Get current user
    const currentUser = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if this auth0Id is already linked to another user
    const existingUser = await this.databaseService.user.findUnique({
      where: { auth0Id: auth0User.auth0Id },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('This social account is already linked to another user');
    }

    // If user already has this auth0Id, nothing to do
    if (currentUser.auth0Id === auth0User.auth0Id) {
      throw new BadRequestException('This social account is already linked to your account');
    }

    // If user already has a different auth0Id, prevent linking
    if (currentUser.auth0Id && currentUser.auth0Id !== auth0User.auth0Id) {
      throw new BadRequestException('You already have a different social account linked. Please unlink it first.');
    }

    // Link the social account
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        auth0Id: auth0User.auth0Id,
        provider: auth0User.provider,
      },
    });

    // Log the activity
    await this.userActivityService.logActivity(userId, {
      action: 'LINK_SOCIAL_ACCOUNT',
      metadata: { provider: auth0User.provider },
    });

    return { message: 'Social account linked successfully' };
  }

  /**
   * Unlink social account from the current user
   * Prevents unlinking if it's the only authentication method
   */
  async unlinkSocialAccount(userId: number): Promise<{ message: string }> {
    // Get current user
    const currentUser = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has a local password
    const hasLocalPassword = !!currentUser.password;
    const hasSocialAccount = !!currentUser.auth0Id;

    // Prevent unlinking if it's the only auth method
    if (!hasLocalPassword && hasSocialAccount) {
      throw new ForbiddenException('Cannot unlink social account. You must set a password first to have an alternative login method.');
    }

    // If no social account is linked, nothing to do
    if (!currentUser.auth0Id) {
      throw new BadRequestException('No social account is currently linked');
    }

    // Unlink the social account
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        auth0Id: null,
        provider: 'local',
      },
    });

    // Log the activity
    await this.userActivityService.logActivity(userId, {
      action: 'UNLINK_SOCIAL_ACCOUNT',
      metadata: { provider: currentUser.provider },
    });

    return { message: 'Social account unlinked successfully' };
  }

  /**
   * Initiate the forgot password flow
   * Always returns success regardless of whether the email exists (security best practice)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const successResponse = { message: 'If that email exists, a reset link was sent' };

    // Find user by email — do not reveal whether the email exists
    const user = await this.databaseService.user.findFirst({
      where: { email },
    });

    if (!user) {
      return successResponse;
    }

    // Delete any existing unused reset tokens for this user
    await this.databaseService.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store the SHA-256 hash of the token — never store the raw token
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.databaseService.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send the reset email with the raw token in the link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(email, resetLink);
    } catch {
      // Do not reveal email sending failures to the caller
    }

    return successResponse;
  }

  /**
   * Reset password using a valid reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Hash the incoming token to look it up in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find matching token that is unused and not expired
    const resetToken = await this.databaseService.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password with bcrypt (cost factor 10)
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update the user's password
    await this.databaseService.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await this.databaseService.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all refresh tokens for this user (security measure)
    await this.revokeAllUserTokens(resetToken.userId);

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify user email using the token sent during registration
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.databaseService.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and clear the token
    await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend the email verification link for the authenticated user
   * Rate limited to once every 2 minutes
   */
  async resendVerification(userId: number): Promise<{ message: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Rate limit: do not allow resending if last email was sent less than 2 minutes ago
    if (user.emailVerificationSentAt) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (user.emailVerificationSentAt > twoMinutesAgo) {
        throw new BadRequestException('Please wait before requesting another email');
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: new Date(),
      },
    });

    try {
      await this.emailService.sendVerificationEmail(user.email, verificationLink);
    } catch {
      // Do not reveal email sending failures to the caller
    }

    return { message: 'Verification email sent' };
  }

  /**
   * Get list of linked accounts for the current user
   */
  async getLinkedAccounts(userId: number): Promise<LinkedAccountsResponseDto> {
    // Get current user
    const currentUser = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Determine available providers
    const availableProviders = ['google', 'github']; // Can be expanded

    const linkedAccounts = availableProviders.map((provider) => {
      const isLinked = currentUser.auth0Id && currentUser.provider === provider;
      return {
        provider,
        isLinked,
        email: isLinked ? currentUser.email : undefined,
      };
    });

    return {
      linkedAccounts,
      hasLocalPassword: !!currentUser.password,
    };
  }
}
