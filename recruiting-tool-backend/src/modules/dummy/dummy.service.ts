import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RolesType, StageStatus, StageType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface DummyDataStructure {
  companies: Array<{ name: string; description: string }>;
  users: Array<{
    name: string;
    email: string;
    password: string;
    roles: RolesType[];
    companyIndex: number;
    profilePicture?: string;
    phoneNumber?: string;
    position?: string;
    department?: string;
    bio?: string;
    linkedinUrl?: string;
    timezone?: string;
  }>;
  profiles: Array<{
    userIndex: number;
    bio?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    preferences?: Record<string, any>;
  }>;
  jobPositions: Array<{
    title: string;
    description: string;
    status: string;
    companyIndex: number;
    createdByUserIndex: number;
    customQuestions?: Array<{
      id: string;
      type: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'CHECKBOX';
      text: string;
      required: boolean;
      options?: string[];
    }>;
    jobCategory?: string;
    jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
    workLocation?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    salaryPeriod?: 'HOURLY' | 'MONTHLY' | 'YEARLY';
    benefits?: string[];
    requirements?: string[];
    responsibilities?: string[];
    experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
    educationLevel?: string;
    skills?: string[];
    applicationDeadline?: string;
    isUrgent?: boolean;
    isFeatured?: boolean;
    city?: string;
    state?: string;
    country?: string;
    showSalary?: boolean;
    tags?: string[];
    isHighlighted?: boolean;
    viewCount?: number;
    applicationCount?: number;
    stages: Array<{
      title: string;
      type: StageType;
      description: string;
      estimatedTime: number;
    }>;
  }>;
  candidates: Array<{
    name: string;
    email: string;
    jobPositionIndex: number;
    companyIndex: number;
    source?: string;
    sourceDetails?: string;
    sourceUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }>;
  candidateNotes: Array<{
    content: string;
    candidateIndex: number;
    authorUserIndex: number;
  }>;
  emailTemplates: Array<{
    name: string;
    subject: string;
    body: string;
    companyIndex: number;
    createdByUserIndex: number;
    isDefault: boolean;
  }>;
  fileUploads: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    s3Key: string;
    uploadedByPublic: boolean;
    uploadedByUserIndex?: number;
    candidateIndex?: number;
  }>;
  applications: Array<{
    jobPositionIndex: number;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    resumeFileIndex?: number;
    coverLetter?: string;
    customAnswers?: Record<string, any>;
    status: string;
    appliedAt: string;
    reviewedAt?: string;
    reviewedByUserIndex?: number;
    notes?: string;
  }>;
  interviews: Array<{
    candidateIndex: number;
    stagePosition: number;
    scheduledDate?: string;
    scheduledTime?: string;
    duration?: number;
    status: string;
    meetingLink?: string;
    location?: string;
    notes?: string;
    scheduledByUserIndex: number;
  }>;
  interviewInterviewers: Array<{
    interviewIndex: number;
    userIndex: number;
    role?: string;
  }>;
  candidateActivities: Array<{
    candidateIndex: number;
    type: string;
    description: string;
    metadata?: Record<string, any>;
    userIndex?: number;
    createdAt: string;
  }>;
  stageNotes: Array<{
    candidateIndex: number;
    stagePosition: number;
    content: string;
    authorUserIndex: number;
    createdAt: string;
  }>;
  stageTimeLogs: Array<{
    candidateIndex: number;
    stagePosition: number;
    enteredAt: string;
    exitedAt?: string;
    duration?: number;
  }>;
  emailLogs: Array<{
    recipientEmail: string;
    recipientName: string;
    subject: string;
    template: string;
    emailType: string;
    relatedEntity?: string;
    relatedEntityId?: string;
    sentAt: string;
  }>;
  hrSchedules: Array<{
    userIndex: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    specificDate?: string;
    isAvailable: boolean;
  }>;
  scorecardTemplates: Array<{
    name: string;
    description?: string;
    companyIndex?: number;
    isActive: boolean;
    categories: Array<{
      name: string;
      weight: number;
      order: number;
      criteria: Array<{
        name: string;
        description?: string;
        maxScore: number;
        order: number;
      }>;
    }>;
  }>;
  candidateScores: Array<{
    candidateIndex: number;
    jobPositionIndex: number;
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    analysis?: Record<string, any>;
    scoredAt: string;
  }>;
  aiQuotas: Array<{
    companyIndex: number;
    quotaType: string;
    limit: number;
    used: number;
    resetDate: string;
  }>;
  aiUsageLogs: Array<{
    companyIndex: number;
    userIndex: number;
    operation: string;
    tokensUsed?: number;
    cost?: number;
    createdAt: string;
  }>;
}

@Injectable()
export class DummyService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DummyService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('DummyService initialized');

    // Idempotent seeding - check and create only missing data
    await this.createDummyData();
  }

  /**
   * Generate a random date within the past N months
   * Used to create realistic temporal patterns for analytics
   * @param monthsAgo - How many months in the past to generate dates (e.g., 6 for past 6 months)
   * @returns Random date between monthsAgo and now
   */
  private getRandomPastDate(monthsAgo: number): Date {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setMonth(now.getMonth() - monthsAgo);

    const timeDiff = now.getTime() - pastDate.getTime();
    const randomTime = Math.random() * timeDiff;

    return new Date(pastDate.getTime() + randomTime);
  }

  /**
   * Generate a date progression for hiring stages
   * Creates realistic time gaps between stage progressions
   * @param startDate - When the candidate entered the hiring process
   * @param stageIndex - Current stage position (0, 1, 2, etc.)
   * @param totalStages - Total number of stages
   * @returns Date for this stage, progressing from startDate
   */
  private getStageProgressionDate(startDate: Date, stageIndex: number, totalStages: number): Date {
    // Average days between stages: 3-7 days
    const daysPerStage = 3 + Math.random() * 4;
    const daysElapsed = stageIndex * daysPerStage;

    const progressionDate = new Date(startDate);
    progressionDate.setDate(progressionDate.getDate() + daysElapsed);

    // Don't create future dates
    const now = new Date();
    return progressionDate > now ? now : progressionDate;
  }

  /**
   * Determine if candidate should progress through stages or drop off
   * Creates realistic hiring funnel (gradual candidate drop-off)
   * @param stageIndex - Current stage position
   * @param totalStages - Total number of stages
   * @returns true if candidate should continue to this stage
   */
  private shouldCandidateProgressToStage(stageIndex: number, totalStages: number): boolean {
    // Realistic hiring funnel drop-off rates:
    // Initial screening: 100% make it
    // Technical interview: 70% make it
    // Final interview: 50% make it
    // Offer stage: 30% make it

    const progressionRates = [1.0, 0.7, 0.5, 0.3];
    const rate = progressionRates[stageIndex] || 0.3;

    return Math.random() < rate;
  }

  async createDummyData() {
    // Read JSON file at runtime
    const jsonPath = path.join(__dirname, 'data', 'dummy-data.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data: DummyDataStructure = JSON.parse(jsonContent);

    // Arrays to store created or existing entities
    let createdCompanies = [];
    let createdUsers = [];
    let createdJobPositions = [];
    let createdCandidates = [];
    let createdFileUploads = [];
    let createdHiringProcessStages = [];
    let createdInterviews = [];

    // Create companies (idempotent - check first)
    const existingCompaniesCount = await this.databaseService.company.count();
    if (existingCompaniesCount === 0) {
      this.logger.log('Creating companies...');
      for (const company of data.companies) {
        const created = await this.databaseService.company.create({
          data: {
            name: company.name,
            description: company.description,
          },
        });
        createdCompanies.push(created);
        this.logger.log(`Created company: ${created.name}`);
      }
    } else {
      // Companies exist - retrieve them in order
      createdCompanies = await this.databaseService.company.findMany({
        orderBy: { id: 'asc' },
      });
    }

    // Update admin user to belong to first company (only if companies were just created)
    if (existingCompaniesCount === 0) {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      if (adminEmail) {
        const adminUser = await this.databaseService.user.findFirst({
          where: { email: adminEmail },
        });
        if (adminUser && createdCompanies.length > 0) {
          await this.databaseService.user.update({
            where: { id: adminUser.id },
            data: { companyId: createdCompanies[0].id },
          });
          this.logger.log(`Updated admin user to belong to ${createdCompanies[0].name}`);
        }
      }
    }

    // Create users (idempotent - check first)
    const existingUsersCount = await this.databaseService.user.count({
      where: {
        email: {
          in: data.users.map(u => u.email),
        },
      },
    });

    if (existingUsersCount === 0) {
      this.logger.log('Creating users...');
      for (const user of data.users) {
        const created = await this.databaseService.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: await bcrypt.hash(user.password, 10),
            roles: user.roles,
            companyId: createdCompanies[user.companyIndex].id,
            profilePicture: user.profilePicture,
            phoneNumber: user.phoneNumber,
            position: user.position,
            department: user.department,
            bio: user.bio,
            linkedinUrl: user.linkedinUrl,
            timezone: user.timezone,
          },
        });
        createdUsers.push(created);
        this.logger.log(`Created user: ${created.name} for ${createdCompanies[user.companyIndex].name}`);
      }
    } else {
      // Users exist - retrieve them by email in the same order as data
      for (const user of data.users) {
        const existingUser = await this.databaseService.user.findFirst({
          where: {
            email: user.email,
            companyId: createdCompanies[user.companyIndex].id,
          },
        });
        if (existingUser) {
          createdUsers.push(existingUser);
        }
      }
    }

    // Create profiles (idempotent - check first)
    const existingProfilesCount = await this.databaseService.profile.count({
      where: {
        userId: {
          in: createdUsers.map(u => u.id),
        },
      },
    });

    if (existingProfilesCount === 0) {
      this.logger.log('Creating user profiles...');
      for (const profile of data.profiles) {
        if (createdUsers[profile.userIndex]) {
          await this.databaseService.profile.create({
            data: {
              bio: profile.bio,
              phone: profile.phone,
              location: profile.location,
              timezone: profile.timezone,
              preferences: profile.preferences || {},
              userId: createdUsers[profile.userIndex].id,
            },
          });
          this.logger.log(`Created profile for user: ${createdUsers[profile.userIndex].name}`);
        }
      }
    }

    // Create job positions with stages (idempotent - check first)
    const existingJobPositionsCount = await this.databaseService.jobPosition.count({
      where: {
        companyId: {
          in: createdCompanies.map(c => c.id),
        },
      },
    });

    if (existingJobPositionsCount === 0) {
      this.logger.log('Creating job positions...');
      for (const jobPosition of data.jobPositions) {
        if (createdCompanies[jobPosition.companyIndex] && createdUsers[jobPosition.createdByUserIndex]) {
          const created = await this.databaseService.jobPosition.create({
            data: {
              title: jobPosition.title,
              description: jobPosition.description,
              status: jobPosition.status as any,
              customQuestions: jobPosition.customQuestions ? jobPosition.customQuestions : [],
              jobCategory: jobPosition.jobCategory,
              jobType: jobPosition.jobType as any,
              workLocation: jobPosition.workLocation as any,
              salaryMin: jobPosition.salaryMin,
              salaryMax: jobPosition.salaryMax,
              salaryCurrency: jobPosition.salaryCurrency || 'USD',
              salaryPeriod: jobPosition.salaryPeriod as any,
              benefits: jobPosition.benefits || [],
              requirements: jobPosition.requirements || [],
              responsibilities: jobPosition.responsibilities || [],
              experienceLevel: jobPosition.experienceLevel as any,
              educationLevel: jobPosition.educationLevel,
              skills: jobPosition.skills || [],
              applicationDeadline: jobPosition.applicationDeadline ? new Date(jobPosition.applicationDeadline) : null,
              isUrgent: jobPosition.isUrgent || false,
              isFeatured: jobPosition.isFeatured || false,
              companyId: createdCompanies[jobPosition.companyIndex].id,
              createdById: createdUsers[jobPosition.createdByUserIndex].id,
            },
          });
          createdJobPositions.push(created);
          this.logger.log(`Created job position: ${created.title} for ${createdCompanies[jobPosition.companyIndex].name}`);

          // Create stages for this job position
          const stages = jobPosition.stages.map((stage, index) => ({
            title: stage.title,
            type: stage.type,
            description: stage.description,
            estimatedTime: stage.estimatedTime,
            position: index,
            status: index === 0 ? StageStatus.CURRENT : StageStatus.OPEN,
            jobPositionId: created.id,
          }));

          await this.databaseService.stage.createMany({
            data: stages,
          });
          this.logger.log(`  Created ${stages.length} stages for ${created.title}`);
        }
      }
    } else {
      // Job positions exist - retrieve them in order
      createdJobPositions = await this.databaseService.jobPosition.findMany({
        where: {
          companyId: {
            in: createdCompanies.map(c => c.id),
          },
        },
        orderBy: { id: 'asc' },
      });
    }

    // Create candidates with temporal spread (past 6 months)
    // This creates realistic time-series data for analytics
    const existingCandidatesCount = await this.databaseService.candidate.count({
      where: {
        email: {
          in: data.candidates.map(c => c.email),
        },
      },
    });

    if (existingCandidatesCount === 0) {
      this.logger.log('Creating candidates with temporal patterns...');
      for (const candidate of data.candidates) {
        // Create candidates over the past 6 months (not all at once)
        const candidateCreatedAt = this.getRandomPastDate(6);

        const created = await this.databaseService.candidate.create({
          data: {
            name: candidate.name,
            email: candidate.email,
            source: candidate.source as any,
            sourceDetails: candidate.sourceDetails,
            sourceUrl: candidate.sourceUrl,
            utmSource: candidate.utmSource,
            utmMedium: candidate.utmMedium,
            utmCampaign: candidate.utmCampaign,
            createdAt: candidateCreatedAt, // Temporal pattern
          },
        });
        createdCandidates.push(created);
        this.logger.log(`Created candidate: ${created.name} (source: ${candidate.source || 'DIRECT_APPLY'}, created: ${candidateCreatedAt.toISOString().split('T')[0]})`);
      }
    } else {
      // Candidates exist - retrieve them by email in the same order as data
      for (const candidate of data.candidates) {
        const existingCandidate = await this.databaseService.candidate.findFirst({
          where: { email: candidate.email },
        });
        if (existingCandidate) {
          createdCandidates.push(existingCandidate);
        }
      }
    }

    // Create hiring processes with realistic funnel progression
    // Creates analytics-friendly data showing candidate drop-off through stages
    const existingHiringProcessesCount = await this.databaseService.hiringProcess.count({
      where: {
        candidateId: {
          in: createdCandidates.map(c => c.id),
        },
      },
    });

    if (existingHiringProcessesCount === 0) {
      this.logger.log('Creating hiring processes with funnel patterns...');
      for (let i = 0; i < createdCandidates.length; i++) {
        const candidate = createdCandidates[i];
        const candidateData = data.candidates[i];
        const jobPosition = createdJobPositions[candidateData.jobPositionIndex];
        const company = createdCompanies[candidateData.companyIndex];

        if (!candidate || !jobPosition || !company) {
          continue; // Skip if any required entity is missing
        }

        // Use candidate's creation date as hiring process start date
        const hiringProcessStartDate = candidate.createdAt;

      const hiringProcess = await this.databaseService.hiringProcess.create({
        data: {
          title: `${jobPosition.title} - ${candidate.name}`,
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
          companyId: company.id,
          createdAt: hiringProcessStartDate,
        },
      });

      // Copy stages from job position to hiring process
      const templateStages = await this.databaseService.stage.findMany({
        where: {
          jobPositionId: jobPosition.id,
          hiringProcessId: null,
        },
        orderBy: { position: 'asc' },
      });

      // Determine how far this candidate progresses (realistic hiring funnel)
      let currentStageIndex = 0;
      for (let stageIndex = 0; stageIndex < templateStages.length; stageIndex++) {
        if (this.shouldCandidateProgressToStage(stageIndex, templateStages.length)) {
          currentStageIndex = stageIndex;
        } else {
          break; // Candidate dropped off at this stage
        }
      }

      // Create stages with realistic status progression
      for (let stageIndex = 0; stageIndex < templateStages.length; stageIndex++) {
        const templateStage = templateStages[stageIndex];

        // Determine stage status based on progression
        let stageStatus: StageStatus;
        if (stageIndex < currentStageIndex) {
          stageStatus = StageStatus.DONE; // Already completed
        } else if (stageIndex === currentStageIndex) {
          stageStatus = StageStatus.CURRENT; // Currently here
        } else {
          stageStatus = StageStatus.OPEN; // Not reached yet
        }

        // Calculate creation date with progression
        const stageCreatedAt = this.getStageProgressionDate(
          hiringProcessStartDate,
          stageIndex,
          templateStages.length,
        );

        const createdStage = await this.databaseService.stage.create({
          data: {
            title: templateStage.title,
            type: templateStage.type,
            description: templateStage.description,
            estimatedTime: templateStage.estimatedTime,
            position: stageIndex,
            status: stageStatus,
            hiringProcessId: hiringProcess.id,
            createdAt: stageCreatedAt,
          },
        });
        createdHiringProcessStages.push(createdStage);
      }

        this.logger.log(
          `Created hiring process: ${hiringProcess.title} (current stage: ${currentStageIndex + 1}/${templateStages.length}, start date: ${hiringProcessStartDate.toISOString().split('T')[0]})`,
        );
      }
    } else {
      // Hiring processes exist - retrieve stages
      createdHiringProcessStages = await this.databaseService.stage.findMany({
        where: {
          hiringProcessId: {
            not: null,
          },
        },
        orderBy: { id: 'asc' },
      });
    }

    // Create candidate notes (idempotent - check first)
    const existingCandidateNotesCount = await this.databaseService.candidateNote.count();
    if (existingCandidateNotesCount === 0) {
      this.logger.log('Creating candidate notes...');
      for (const note of data.candidateNotes) {
        if (createdCandidates[note.candidateIndex] && createdUsers[note.authorUserIndex]) {
          await this.databaseService.candidateNote.create({
            data: {
              content: note.content,
              candidateId: createdCandidates[note.candidateIndex].id,
              authorId: createdUsers[note.authorUserIndex].id,
            },
          });
          this.logger.log(`Created note for candidate: ${createdCandidates[note.candidateIndex].name} by ${createdUsers[note.authorUserIndex].name}`);
        }
      }
    }

    // Create email templates (idempotent - check first)
    const existingEmailTemplatesCount = await this.databaseService.emailTemplate.count();
    if (existingEmailTemplatesCount === 0) {
      this.logger.log('Creating email templates...');
      for (const template of data.emailTemplates) {
        if (createdCompanies[template.companyIndex] && createdUsers[template.createdByUserIndex]) {
          await this.databaseService.emailTemplate.create({
            data: {
              name: template.name,
              subject: template.subject,
              body: template.body,
              companyId: createdCompanies[template.companyIndex].id,
              createdById: createdUsers[template.createdByUserIndex].id,
              isDefault: template.isDefault,
            },
          });
          this.logger.log(`Created email template: ${template.name} for ${createdCompanies[template.companyIndex].name}`);
        }
      }
    }

    // Create file uploads (idempotent - check first)
    const existingFileUploadsCount = await this.databaseService.fileUpload.count();
    if (existingFileUploadsCount === 0) {
      this.logger.log('Creating file uploads...');
      for (const file of data.fileUploads) {
        const created = await this.databaseService.fileUpload.create({
          data: {
            filename: file.filename,
            originalName: file.originalName,
            mimetype: file.mimetype,
            size: file.size,
            s3Key: file.s3Key,
            uploadedByPublic: file.uploadedByPublic,
            uploadedById: file.uploadedByUserIndex !== undefined ? createdUsers[file.uploadedByUserIndex]?.id : null,
            candidateId: file.candidateIndex !== undefined ? createdCandidates[file.candidateIndex]?.id : null,
          },
        });
        createdFileUploads.push(created);
        this.logger.log(`Created file upload: ${file.originalName} (public: ${file.uploadedByPublic})`);
      }
    } else {
      // File uploads exist - retrieve them in order
      createdFileUploads = await this.databaseService.fileUpload.findMany({
        orderBy: { id: 'asc' },
      });
    }

    // Create applications with temporal patterns and varied statuses
    // Realistic status distribution for analytics (not all PENDING)
    const existingApplicationsCount = await this.databaseService.application.count();
    if (existingApplicationsCount === 0) {
      this.logger.log('Creating applications with temporal patterns and varied statuses...');
      const applicationStatuses = ['PENDING', 'REVIEWED', 'REJECTED', 'ACCEPTED'];
      const statusWeights = [0.3, 0.35, 0.25, 0.1]; // 30% pending, 35% reviewed, 25% rejected, 10% accepted

      for (const application of data.applications) {
        if (!createdJobPositions[application.jobPositionIndex]) {
          continue;
        }

        // Applications spread over past 6 months
        const appliedAt = this.getRandomPastDate(6);

        // Determine application status based on weighted distribution
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedStatus = 'PENDING';

        for (let i = 0; i < applicationStatuses.length; i++) {
          cumulativeWeight += statusWeights[i];
          if (randomValue < cumulativeWeight) {
            selectedStatus = applicationStatuses[i];
            break;
          }
        }

        // If reviewed, rejected, or accepted, add review date (1-7 days after application)
        let reviewedAt: Date | null = null;
        let reviewedById: number | null = null;

        if (selectedStatus !== 'PENDING' && application.reviewedByUserIndex !== undefined) {
          reviewedAt = new Date(appliedAt);
          reviewedAt.setDate(reviewedAt.getDate() + 1 + Math.floor(Math.random() * 6));
          reviewedById = createdUsers[application.reviewedByUserIndex]?.id;
        }

        await this.databaseService.application.create({
          data: {
            jobPositionId: createdJobPositions[application.jobPositionIndex].id,
            applicantName: application.applicantName,
            applicantEmail: application.applicantEmail,
            applicantPhone: application.applicantPhone,
            resumeFileId: application.resumeFileIndex !== undefined ? createdFileUploads[application.resumeFileIndex]?.id : null,
            coverLetter: application.coverLetter,
            customAnswers: application.customAnswers || {},
            status: selectedStatus as any,
            appliedAt: appliedAt,
            reviewedAt: reviewedAt,
            reviewedById: reviewedById,
            notes: application.notes,
            createdAt: appliedAt,
          },
        });
        this.logger.log(
          `Created application: ${application.applicantName} for ${createdJobPositions[application.jobPositionIndex].title} (status: ${selectedStatus}, applied: ${appliedAt.toISOString().split('T')[0]})`,
        );
      }
    }

    // Create interviews with realistic scheduling patterns
    // Interviews scheduled based on stage progression dates
    const existingInterviewsCount = await this.databaseService.interview.count();
    if (existingInterviewsCount === 0) {
      this.logger.log('Creating interviews with temporal progression...');
      const interviewStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      const interviewStatusWeights = [0.2, 0.6, 0.1, 0.1]; // 20% scheduled, 60% completed, 10% cancelled, 10% no-show

      for (const interview of data.interviews) {
        const candidate = createdCandidates[interview.candidateIndex];
        if (!candidate || !createdUsers[interview.scheduledByUserIndex]) {
          continue;
        }

      // Find the hiring process for this candidate
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { candidateId: candidate.id },
      });

      if (!hiringProcess) {
        this.logger.warn(`No hiring process found for candidate ${candidate.name}, skipping interview`);
        continue;
      }

      // Find the stage at the specified position for this hiring process
      const stage = await this.databaseService.stage.findFirst({
        where: {
          hiringProcessId: hiringProcess.id,
          position: interview.stagePosition,
        },
      });

      if (!stage) {
        this.logger.warn(`No stage found at position ${interview.stagePosition} for candidate ${candidate.name}, skipping interview`);
        continue;
      }

      // Only create interviews for DONE or CURRENT stages (not future stages)
      if (stage.status === StageStatus.OPEN) {
        continue; // Skip interviews for stages not yet reached
      }

      // Interview scheduled 1-3 days after stage entry
      const stageEnteredDate = stage.createdAt;
      const interviewDate = new Date(stageEnteredDate);
      interviewDate.setDate(interviewDate.getDate() + 1 + Math.floor(Math.random() * 2));

      // Determine interview status based on weighted distribution
      const randomValue = Math.random();
      let cumulativeWeight = 0;
      let selectedStatus = 'SCHEDULED';

      for (let i = 0; i < interviewStatuses.length; i++) {
        cumulativeWeight += interviewStatusWeights[i];
        if (randomValue < cumulativeWeight) {
          selectedStatus = interviewStatuses[i];
          break;
        }
      }

      // If stage is DONE, interview must be COMPLETED
      if (stage.status === StageStatus.DONE) {
        selectedStatus = 'COMPLETED';
      }

      const created = await this.databaseService.interview.create({
        data: {
          stageId: stage.id,
          scheduledDate: interviewDate,
          scheduledTime: interview.scheduledTime || '10:00',
          duration: interview.duration || 60,
          status: selectedStatus as any,
          meetingLink: interview.meetingLink,
          location: interview.location,
          notes: interview.notes,
          scheduledById: createdUsers[interview.scheduledByUserIndex].id,
          createdAt: stageEnteredDate,
        },
      });
        createdInterviews.push(created);
        this.logger.log(
          `Created interview for ${candidate.name} at stage ${stage.title} (status: ${selectedStatus}, date: ${interviewDate.toISOString().split('T')[0]})`,
        );
      }
    } else {
      // Interviews exist - retrieve them in order
      createdInterviews = await this.databaseService.interview.findMany({
        orderBy: { id: 'asc' },
      });
    }

    // Create interview interviewers (idempotent - check first)
    const existingInterviewInterviewersCount = await this.databaseService.interviewInterviewer.count();
    if (existingInterviewInterviewersCount === 0) {
      this.logger.log('Creating interview interviewers...');
      for (const interviewInterviewer of data.interviewInterviewers) {
        const interview = createdInterviews[interviewInterviewer.interviewIndex];
        const user = createdUsers[interviewInterviewer.userIndex];

        if (interview && user) {
          await this.databaseService.interviewInterviewer.create({
            data: {
              interviewId: interview.id,
              userId: user.id,
              role: interviewInterviewer.role,
            },
          });
          this.logger.log(`Added interviewer ${user.name} to interview (role: ${interviewInterviewer.role || 'Interviewer'})`);
        }
      }
    }

    // Create candidate activities with temporal progression (idempotent - check first)
    // Activities aligned with candidate and hiring process dates
    const existingCandidateActivitiesCount = await this.databaseService.candidateActivity.count();
    if (existingCandidateActivitiesCount === 0) {
      this.logger.log('Creating candidate activities with temporal progression...');
      for (const activity of data.candidateActivities) {
        const candidate = createdCandidates[activity.candidateIndex];
        if (!candidate) continue;

        // Activity dates based on candidate creation date + random offset
        const candidateCreatedDate = candidate.createdAt;
        const activityDate = new Date(candidateCreatedDate);
        activityDate.setDate(activityDate.getDate() + Math.floor(Math.random() * 30)); // Activities within 30 days of candidate creation

        await this.databaseService.candidateActivity.create({
          data: {
            candidateId: candidate.id,
            type: activity.type as any,
            description: activity.description,
            metadata: activity.metadata || null,
            userId: activity.userIndex !== undefined ? createdUsers[activity.userIndex]?.id : null,
            createdAt: activityDate,
          },
        });
        this.logger.log(
          `Created activity for ${candidate.name}: ${activity.type} at ${activityDate.toISOString().split('T')[0]}`,
        );
      }
    }

    // Create stage notes (idempotent - check first)
    const existingStageNotesCount = await this.databaseService.stageNote.count();
    if (existingStageNotesCount === 0) {
      this.logger.log('Creating stage notes...');
      for (const note of data.stageNotes) {
        const candidate = createdCandidates[note.candidateIndex];
        if (!candidate || !createdUsers[note.authorUserIndex]) continue;

        // Find the hiring process for this candidate
        const hiringProcess = await this.databaseService.hiringProcess.findFirst({
          where: { candidateId: candidate.id },
        });

        if (!hiringProcess) {
          this.logger.warn(`No hiring process found for candidate ${candidate.name}, skipping stage note`);
          continue;
        }

        // Find the stage at the specified position
        const stage = await this.databaseService.stage.findFirst({
          where: {
            hiringProcessId: hiringProcess.id,
            position: note.stagePosition,
          },
        });

        if (!stage) {
          this.logger.warn(`No stage found at position ${note.stagePosition} for candidate ${candidate.name}, skipping stage note`);
          continue;
        }

        await this.databaseService.stageNote.create({
          data: {
            content: note.content,
            stageId: stage.id,
            authorId: createdUsers[note.authorUserIndex].id,
            createdAt: new Date(note.createdAt),
          },
        });
        this.logger.log(`Created stage note for ${candidate.name} at stage ${stage.title}`);
      }
    }

    // Create stage time logs with realistic time-in-stage tracking (idempotent - check first)
    // Time logs show how long candidates spend in each stage
    const existingStageTimeLogsCount = await this.databaseService.stageTimeLog.count();
    if (existingStageTimeLogsCount === 0) {
      this.logger.log('Creating stage time logs with realistic durations...');
      for (const timeLog of data.stageTimeLogs) {
        const candidate = createdCandidates[timeLog.candidateIndex];
        if (!candidate) continue;

        // Find the hiring process for this candidate
        const hiringProcess = await this.databaseService.hiringProcess.findFirst({
          where: { candidateId: candidate.id },
        });

        if (!hiringProcess) {
          this.logger.warn(`No hiring process found for candidate ${candidate.name}, skipping time log`);
          continue;
        }

        // Find the stage at the specified position
        const stage = await this.databaseService.stage.findFirst({
          where: {
            hiringProcessId: hiringProcess.id,
            position: timeLog.stagePosition,
          },
        });

        if (!stage) {
          this.logger.warn(`No stage found at position ${timeLog.stagePosition} for candidate ${candidate.name}, skipping time log`);
          continue;
        }

        // Entry time = stage creation time
        const enteredAt = stage.createdAt;

        // Exit time = null for CURRENT stages, calculated for DONE stages
        let exitedAt: Date | null = null;
        let duration: number | null = null;

        if (stage.status === StageStatus.DONE) {
          // Completed stages: 2-10 days in stage
          const daysInStage = 2 + Math.floor(Math.random() * 8);
          exitedAt = new Date(enteredAt);
          exitedAt.setDate(exitedAt.getDate() + daysInStage);

          // Duration in hours
          duration = daysInStage * 24;
        }

        await this.databaseService.stageTimeLog.create({
          data: {
            stageId: stage.id,
            candidateId: candidate.id,
            enteredAt: enteredAt,
            exitedAt: exitedAt,
            duration: duration,
          },
        });
        this.logger.log(
          `Created time log for ${candidate.name} at stage ${stage.title} (duration: ${duration ? duration + ' hours' : 'ongoing'})`,
        );
      }
    }

    // Create email logs with temporal patterns (emails sent over past 6 months) (idempotent - check first)
    const existingEmailLogsCount = await this.databaseService.emailLog.count();
    if (existingEmailLogsCount === 0) {
      this.logger.log('Creating email logs with temporal patterns...');
      for (const emailLog of data.emailLogs) {
        // Emails sent randomly over the past 6 months
        const sentAt = this.getRandomPastDate(6);

        await this.databaseService.emailLog.create({
          data: {
            recipientEmail: emailLog.recipientEmail,
            recipientName: emailLog.recipientName,
            subject: emailLog.subject,
            template: emailLog.template,
            emailType: emailLog.emailType,
            relatedEntity: emailLog.relatedEntity,
            relatedEntityId: emailLog.relatedEntityId,
            sentAt: sentAt,
            createdAt: sentAt,
          },
        });
        this.logger.log(
          `Created email log: ${emailLog.emailType} to ${emailLog.recipientName} (sent: ${sentAt.toISOString().split('T')[0]})`,
        );
      }
    }

    // Create HR schedules (idempotent - check first)
    const existingHRSchedulesCount = await this.databaseService.hRSchedule.count();
    if (existingHRSchedulesCount === 0) {
      this.logger.log('Creating HR schedules...');
      for (const schedule of data.hrSchedules) {
        const user = createdUsers[schedule.userIndex];
        if (!user) continue;

        await this.databaseService.hRSchedule.create({
          data: {
            userId: user.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isRecurring: schedule.isRecurring,
            specificDate: schedule.specificDate ? new Date(schedule.specificDate) : null,
            isAvailable: schedule.isAvailable,
          },
        });
        this.logger.log(`Created schedule for ${user.name}: ${schedule.isRecurring ? 'Recurring' : 'One-time'} ${schedule.isAvailable ? 'Available' : 'Unavailable'} on ${schedule.specificDate || `Day ${schedule.dayOfWeek}`} ${schedule.startTime}-${schedule.endTime}`);
      }
    }

    // Create scorecard templates with categories and criteria (idempotent - check first)
    const existingScorecardTemplatesCount = await this.databaseService.scorecardTemplate.count();
    if (existingScorecardTemplatesCount === 0) {
      this.logger.log('Creating scorecard templates...');
      for (const template of data.scorecardTemplates) {
        const createdTemplate = await this.databaseService.scorecardTemplate.create({
          data: {
            name: template.name,
            description: template.description,
            companyId: template.companyIndex !== undefined ? createdCompanies[template.companyIndex]?.id : null,
            isActive: template.isActive,
          },
        });
        this.logger.log(`Created scorecard template: ${template.name}`);

        // Create categories for this template
        for (const category of template.categories) {
          const createdCategory = await this.databaseService.scorecardCategory.create({
            data: {
              templateId: createdTemplate.id,
              name: category.name,
              weight: category.weight,
              order: category.order,
            },
          });
          this.logger.log(`  Created category: ${category.name} (weight: ${category.weight})`);

          // Create criteria for this category
          for (const criterion of category.criteria) {
            await this.databaseService.scorecardCriterion.create({
              data: {
                categoryId: createdCategory.id,
                name: criterion.name,
                description: criterion.description,
                maxScore: criterion.maxScore,
                order: criterion.order,
              },
            });
            this.logger.log(`    Created criterion: ${criterion.name} (max score: ${criterion.maxScore})`);
          }
        }
      }
    }

    // Create candidate scores with temporal patterns (AI scoring over time) (idempotent - check first)
    const existingCandidateScoresCount = await this.databaseService.candidateScore.count();
    if (existingCandidateScoresCount === 0) {
      this.logger.log('Creating candidate scores with temporal patterns...');
      for (const score of data.candidateScores) {
        const candidate = createdCandidates[score.candidateIndex];
        const jobPosition = createdJobPositions[score.jobPositionIndex];

        if (!candidate || !jobPosition) continue;

        // Scoring happens 1-3 days after candidate creation
        const scoredAt = new Date(candidate.createdAt);
        scoredAt.setDate(scoredAt.getDate() + 1 + Math.floor(Math.random() * 2));

        await this.databaseService.candidateScore.create({
          data: {
            candidateId: candidate.id,
            jobPositionId: jobPosition.id,
            overallScore: score.overallScore,
            skillsScore: score.skillsScore,
            experienceScore: score.experienceScore,
            educationScore: score.educationScore,
            analysis: score.analysis || null,
            scoredAt: scoredAt,
            createdAt: scoredAt,
          },
        });
        this.logger.log(
          `Created score for ${candidate.name} on ${jobPosition.title}: ${score.overallScore}/100 (scored: ${scoredAt.toISOString().split('T')[0]})`,
        );
      }
    }

    // Create AI quotas (idempotent - check first)
    const existingAIQuotasCount = await this.databaseService.aIQuota.count();
    if (existingAIQuotasCount === 0) {
      this.logger.log('Creating AI quotas...');
      for (const quota of data.aiQuotas) {
        const company = createdCompanies[quota.companyIndex];
        if (!company) continue;

        await this.databaseService.aIQuota.create({
          data: {
            companyId: company.id,
            quotaType: quota.quotaType as any,
            limit: quota.limit,
            used: quota.used,
            resetDate: new Date(quota.resetDate),
          },
        });
        this.logger.log(`Created AI quota for ${company.name}: ${quota.quotaType} (${quota.used}/${quota.limit})`);
      }
    }

    // Create AI usage logs with temporal patterns (AI usage over time) (idempotent - check first)
    const existingAIUsageLogsCount = await this.databaseService.aIUsageLog.count();
    if (existingAIUsageLogsCount === 0) {
      this.logger.log('Creating AI usage logs with temporal patterns...');
      for (const log of data.aiUsageLogs) {
        const company = createdCompanies[log.companyIndex];
        const user = createdUsers[log.userIndex];

        if (!company || !user) continue;

        // AI usage spread over past 6 months
        const usageDate = this.getRandomPastDate(6);

        await this.databaseService.aIUsageLog.create({
          data: {
            companyId: company.id,
            userId: user.id,
            operation: log.operation as any,
            tokensUsed: log.tokensUsed,
            cost: log.cost,
            createdAt: usageDate,
          },
        });
        this.logger.log(
          `Created AI usage log: ${user.name} - ${log.operation} (${log.tokensUsed || 0} tokens, date: ${usageDate.toISOString().split('T')[0]})`,
        );
      }
    }

    this.logger.log('Dummy data seeding completed!');
  }
}
