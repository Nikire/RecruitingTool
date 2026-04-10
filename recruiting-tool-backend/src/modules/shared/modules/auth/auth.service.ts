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
import { EmailTemplateType } from '@prisma/client';

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

    // If registering as COMPANY_OWNER, auto-create default email templates for the new company
    if (isCompanyOwner && finalCompanyUid) {
      try {
        const newCompanyRecord = await this.databaseService.company.findUnique({
          where: { uid: finalCompanyUid },
        });
        const newUserRecord = await this.databaseService.user.findUnique({
          where: { uid: user.uid },
          select: { id: true },
        });
        if (newCompanyRecord && newUserRecord) {
          await this.createDefaultEmailTemplates(newCompanyRecord.id, newUserRecord.id);
        }
      } catch {
        // Non-blocking — do not fail registration if template creation fails
      }
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
    if (foundUser.isActive === false) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Social-only accounts have no password — direct them to use social login
    if (!foundUser.password) {
      throw new UnauthorizedException('This account was created with social login. Please sign in with Google or LinkedIn.');
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

      // Fetch fresh user data from database using sub (userId) from token
      // Email may be null for social-only accounts, so look up by id
      const freshUser = await this.databaseService.user.findUnique({
        where: { id: decoded.sub },
        include: { company: true },
      });

      if (!freshUser) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is active
      if (freshUser.isActive === false) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      return freshUser as any;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  private async generateTokens(userId: number, email: string | null, roles: any[], companyId: number | null): Promise<{ accessToken: string; refreshToken: string }> {
    // Create minimal JWT payload for access token
    const payload = {
      sub: userId,
      id: userId,
      email: email ?? null,
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
    if (storedToken.user.isActive === false) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      storedToken.userId,
      storedToken.user.email ?? null,
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

    // If not found by auth0Id, check by email (case-insensitive)
    if (!user && auth0User.email) {
      user = await this.databaseService.user.findFirst({
        where: {
          email: { equals: auth0User.email, mode: 'insensitive' },
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
      const userName = auth0User.name || auth0User.email?.split('@')[0] || 'User';

      user = await this.databaseService.user.create({
        data: {
          email: auth0User.email || null, // Email may be absent for some social providers
          name: userName,
          auth0Id: auth0User.auth0Id,
          provider: auth0User.provider,
          password: null, // No password for social login users
          roles: ['USER' as any],
        },
      });
    }

    // Check if user is active
    if (user.isActive === false) {
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

    // Social-only accounts have no email — nothing to verify
    if (!user.email) {
      throw new BadRequestException('No email address associated with this account');
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
      await this.emailService.sendVerificationEmail(user.email!, verificationLink);
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
    const availableProviders = ['google'];

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

  /**
   * Request an email address change — sends a 6-digit code to the new email
   */
  async requestEmailChange(userId: number, newEmail: string): Promise<{ message: string }> {
    // Check new email is not already in use by another account
    const existing = await this.databaseService.user.findFirst({
      where: { email: newEmail },
    });
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }

    // Generate 6-digit numeric code
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store SHA-256 hash of the code
    const tokenHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store on user record
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        emailChangeToken: tokenHash,
        emailChangeExpiresAt: expiresAt,
      },
    });

    // Send verification code to new email
    const subject = 'Email Change Verification Code';
    const text = `Your verification code is: ${rawCode}. This code expires in 1 hour. If you did not request this, please ignore this email or contact support.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Email Change Verification</h2>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1976d2;">${rawCode}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email or contact support.</p>
      </div>
    `;

    try {
      await this.emailService['sendEmail'](newEmail, subject, text, html, 'EMAIL_CHANGE');
    } catch {
      // Non-blocking — do not fail if email sending fails
    }

    return { message: 'Verification code sent to your new email address' };
  }

  /**
   * Confirm email address change using the 6-digit code
   */
  async confirmEmailChange(userId: number, code: string): Promise<{ message: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.pendingEmail || !user.emailChangeToken || !user.emailChangeExpiresAt) {
      throw new BadRequestException('No pending email change request found');
    }

    // Check expiry
    if (new Date() > user.emailChangeExpiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    // Hash the submitted code and compare
    const submittedHash = crypto.createHash('sha256').update(code).digest('hex');
    if (submittedHash !== user.emailChangeToken) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update email and clear pending fields
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpiresAt: null,
      },
    });

    // Invalidate all refresh tokens (security measure)
    await this.revokeAllUserTokens(userId);

    return { message: 'Email updated successfully' };
  }

  /**
   * Request a password change — sends a 6-digit code to the user's current email
   */
  async requestPasswordChange(userId: number): Promise<{ message: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.email) {
      throw new BadRequestException('No email address associated with this account. Please add an email first.');
    }

    // Delete any existing unused password change tokens for this user
    await this.databaseService.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate 6-digit numeric code
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store SHA-256 hash of the code
    const tokenHash = crypto.createHash('sha256').update(rawCode).digest('hex');

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

    // Send verification code to current email
    const subject = 'Password Change Verification Code';
    const text = `Your password change code is: ${rawCode}. This code expires in 1 hour. If you did not request this, please ignore this email or contact support.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Change Verification</h2>
        <p>Your password change code is:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1976d2;">${rawCode}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email or contact support.</p>
      </div>
    `;

    try {
      await this.emailService['sendEmail'](user.email, subject, text, html, 'PASSWORD_CHANGE');
    } catch {
      // Non-blocking — do not fail if email sending fails
    }

    return { message: 'Verification code sent to your email address' };
  }

  /**
   * Confirm password change using the 6-digit code and new password
   */
  async confirmPasswordChange(userId: number, code: string, newPassword: string): Promise<{ message: string }> {
    // Find the most recent unused token for this user
    const resetToken = await this.databaseService.passwordResetToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetToken) {
      throw new BadRequestException('No valid verification code found. Please request a new code.');
    }

    // Hash the submitted code and compare
    const submittedHash = crypto.createHash('sha256').update(code).digest('hex');
    if (submittedHash !== resetToken.tokenHash) {
      throw new BadRequestException('Invalid verification code');
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    // Update the user's password
    await this.databaseService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await this.databaseService.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all refresh tokens (security measure)
    await this.revokeAllUserTokens(userId);

    return { message: 'Password updated successfully' };
  }

  /**
   * Create default email templates for a newly registered company
   * Called automatically when a COMPANY_OWNER registers
   */
  private async createDefaultEmailTemplates(companyId: number, createdById: number): Promise<void> {
    const defaults: Array<{ type: EmailTemplateType; name: string; subject: string; body: string }> = [
      {
        type: EmailTemplateType.APPLICATION_RECEIVED,
        name: 'Application Received',
        subject: 'We received your application for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at {{companyName}}. We have received your application and our team will review it shortly.</p>
<p>We will be in touch with you soon.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_UNDER_REVIEW,
        name: 'Application Under Review',
        subject: 'Your application for {{jobTitle}} is under review',
        body: `<p>Dear {{candidateName}},</p>
<p>We wanted to let you know that your application for the <strong>{{jobTitle}}</strong> position is currently being reviewed by our hiring team.</p>
<p>We appreciate your patience and will update you as soon as we have news.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_REJECTED,
        name: 'Application Not Selected',
        subject: 'Update on your application for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}} and for the time you invested in the application process.</p>
<p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. We encourage you to apply for future openings that align with your background.</p>
<p>We wish you the best in your job search.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_SHORTLISTED,
        name: 'Application Shortlisted',
        subject: 'Congratulations! You have been shortlisted for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We are pleased to inform you that your application for the <strong>{{jobTitle}}</strong> position has been shortlisted. You are among the top candidates we are considering.</p>
<p>Our team will be in contact with you shortly to discuss the next steps.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.INTERVIEW_INVITATION,
        name: 'Interview Invitation',
        subject: 'Interview Invitation for {{jobTitle}} at {{companyName}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We would like to invite you for an interview for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
<p><strong>Date:</strong> {{interviewDate}}<br/><strong>Time:</strong> {{interviewTime}}</p>
<p>Please confirm your availability by replying to this email. If you have any questions, do not hesitate to reach out.</p>
<p>We look forward to meeting you.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.INTERVIEW_REMINDER,
        name: 'Interview Reminder',
        subject: 'Reminder: Your interview for {{jobTitle}} is coming up',
        body: `<p>Dear {{candidateName}},</p>
<p>This is a friendly reminder that your interview for the <strong>{{jobTitle}}</strong> position at {{companyName}} is scheduled for:</p>
<p><strong>Date:</strong> {{interviewDate}}<br/><strong>Time:</strong> {{interviewTime}}</p>
<p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.OFFER_LETTER,
        name: 'Offer Letter',
        subject: 'Job Offer: {{jobTitle}} at {{companyName}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at {{companyName}}. We were impressed by your skills and experience, and we believe you will be a valuable addition to our team.</p>
<p>Please review the attached offer details and let us know if you have any questions. We look forward to welcoming you to the team.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.CUSTOM,
        name: 'Custom Template',
        subject: '{{subject}}',
        body: `<p>Dear {{candidateName}},</p>
<p>{{message}}</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
    ];

    await this.databaseService.emailTemplate.createMany({
      data: defaults.map((template) => ({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        companyId,
        createdById,
        isDefault: true,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Add an email address to a social-only account (user has no email yet)
   */
  async addEmail(userId: number, email: string): Promise<{ message: string }> {
    // Check if email is already in use by another account
    const existing = await this.databaseService.user.findFirst({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }

    // Update the user's email
    await this.databaseService.user.update({
      where: { id: userId },
      data: { email },
    });

    // Send verification email (non-blocking)
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
      await this.emailService.sendVerificationEmail(email, verificationLink);
    } catch {
      // non-blocking — do not fail if email sending fails
    }

    return { message: 'Email added successfully. Please check your inbox to verify it.' };
  }
}
