import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User, RolesType } from '@prisma/client';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackResponseDto } from './dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Auth([RolesType.USER, RolesType.HR, RolesType.HR_MANAGER, RolesType.COMPANY_OWNER, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully',
    type: FeedbackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User or company not found' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() currentUser: User,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(createFeedbackDto, currentUser.uid);
  }

  @Get()
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all feedback for company (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of feedback submissions',
    type: [FeedbackResponseDto],
  })
  async findAll(@CurrentUser() currentUser: User): Promise<FeedbackResponseDto[]> {
    // Assuming currentUser has companyUid populated
    const user = await this.feedbackService['databaseService'].user.findUnique({
      where: { uid: currentUser.uid },
      include: { company: { select: { uid: true } } },
    });

    if (!user?.company) {
      throw new Error('User does not belong to a company');
    }

    return this.feedbackService.findAll(user.company.uid);
  }

  @Get('my-feedback')
  @Auth([RolesType.USER, RolesType.HR, RolesType.HR_MANAGER, RolesType.COMPANY_OWNER, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own feedback submissions' })
  @ApiResponse({
    status: 200,
    description: 'List of user feedback submissions',
    type: [FeedbackResponseDto],
  })
  async findUserFeedback(@CurrentUser() currentUser: User): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.findUserFeedback(currentUser.uid);
  }
}
