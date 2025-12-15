import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../shared/modules/database/database.service';
import { HROnboardingStatusDto, CompleteHROnboardingDto, HROnboardingCompleteResponseDto } from '../dto/onboarding.dto';
import { RolesType } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Check HR user onboarding status
   * Determines what step the HR user needs to complete next
   */
  async getHROnboardingStatus(userId: number): Promise<HROnboardingStatusDto> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has HR role
    const isHR = user.roles.includes(RolesType.HR);
    const isCompanyOwner = user.roles.includes(RolesType.COMPANY_OWNER);

    // If user is COMPANY_OWNER, they should use the company owner onboarding flow
    if (isCompanyOwner) {
      throw new BadRequestException('Company owners should use the company owner onboarding flow');
    }

    // Check if user is connected to a company
    const hasCompany = !!user.companyId;

    // Check if user was invited (has an accepted invitation)
    const acceptedInvitation = await this.databaseService.companyInvitation.findFirst({
      where: {
        email: user.email,
        status: 'ACCEPTED',
      },
      include: {
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });

    const wasInvited = !!acceptedInvitation;
    const invitedByName = acceptedInvitation?.invitedBy?.name;

    // Check if profile is complete (basic fields filled)
    const isProfileComplete = !!(user.position && user.department && user.phoneNumber && user.timezone);

    // Determine if onboarding is complete
    const isOnboardingComplete = hasCompany && isProfileComplete && isHR;

    // Determine next step
    let nextStep: 'complete_profile' | 'dashboard';
    if (!isProfileComplete) {
      nextStep = 'complete_profile';
    } else {
      nextStep = 'dashboard';
    }

    return {
      isOnboardingComplete,
      isProfileComplete,
      hasCompany,
      wasInvited,
      invitedByName,
      nextStep,
    };
  }

  /**
   * Complete HR user onboarding by updating profile information
   */
  async completeHROnboarding(userId: number, data: CompleteHROnboardingDto): Promise<HROnboardingCompleteResponseDto> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has HR role
    const isHR = user.roles.includes(RolesType.HR);
    if (!isHR) {
      throw new BadRequestException('This endpoint is only for HR users');
    }

    // Check if user is connected to a company
    if (!user.companyId) {
      throw new BadRequestException('User must be connected to a company to complete onboarding');
    }

    // Update user profile with onboarding data
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        position: data.position || user.position,
        department: data.department || user.department,
        phoneNumber: data.phoneNumber || user.phoneNumber,
        timezone: data.timezone || user.timezone,
        bio: data.bio || user.bio,
      },
    });

    return {
      message: 'Onboarding completed successfully',
      isOnboardingComplete: true,
      redirectTo: '/hr/dashboard',
    };
  }
}
