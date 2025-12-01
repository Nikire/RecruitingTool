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

    // Check if dummy data already exists
    const existingCompanies = await this.databaseService.company.count();
    if (existingCompanies > 0) {
      this.logger.log('Dummy data already exists, skipping creation');
      return;
    }

    this.logger.log('Creating dummy data from JSON...');
    await this.createDummyData();
    this.logger.log('Dummy data created successfully!');
  }

  async createDummyData() {
    // Read JSON file at runtime
    const jsonPath = path.join(__dirname, 'data', 'dummy-data.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data: DummyDataStructure = JSON.parse(jsonContent);
    const createdCompanies = [];
    const createdUsers = [];
    const createdJobPositions = [];
    const createdCandidates = [];
    const createdFileUploads = [];
    const createdHiringProcessStages = [];
    const createdInterviews = [];

    // Create companies
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

    // Update admin user to belong to first company
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (adminEmail) {
      const adminUser = await this.databaseService.user.findFirst({
        where: { email: adminEmail },
      });
      if (adminUser) {
        await this.databaseService.user.update({
          where: { id: adminUser.id },
          data: { companyId: createdCompanies[0].id },
        });
        this.logger.log(`Updated admin user to belong to ${createdCompanies[0].name}`);
      }
    }

    // Create users
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

    // Create profiles
    this.logger.log('Creating user profiles...');
    for (const profile of data.profiles) {
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

    // Create job positions with stages
    this.logger.log('Creating job positions...');
    for (const jobPosition of data.jobPositions) {
      const created = await this.databaseService.jobPosition.create({
        data: {
          title: jobPosition.title,
          description: jobPosition.description,
          status: jobPosition.status as any,
          customQuestions: jobPosition.customQuestions ? jobPosition.customQuestions : [],
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

    // Create candidates
    this.logger.log('Creating candidates...');
    for (const candidate of data.candidates) {
      const created = await this.databaseService.candidate.create({
        data: {
          name: candidate.name,
          email: candidate.email,
          source: candidate.source as any,
          sourceDetails: candidate.sourceDetails,
          sourceUrl: candidate.sourceUrl,
        },
      });
      createdCandidates.push(created);
      this.logger.log(`Created candidate: ${created.name} (source: ${candidate.source || 'DIRECT_APPLY'})`);
    }

    // Create hiring processes
    this.logger.log('Creating hiring processes...');
    for (let i = 0; i < createdCandidates.length; i++) {
      const candidate = createdCandidates[i];
      const candidateData = data.candidates[i];
      const jobPosition = createdJobPositions[candidateData.jobPositionIndex];
      const company = createdCompanies[candidateData.companyIndex];

      const hiringProcess = await this.databaseService.hiringProcess.create({
        data: {
          title: `${jobPosition.title} - ${candidate.name}`,
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
          companyId: company.id,
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

      const hiringProcessStages = templateStages.map((stage, index) => ({
        title: stage.title,
        type: stage.type,
        description: stage.description,
        estimatedTime: stage.estimatedTime,
        position: index,
        status: index === 0 ? StageStatus.CURRENT : StageStatus.OPEN,
        hiringProcessId: hiringProcess.id,
      }));

      // Create stages individually to track them for interviews
      for (const stageData of hiringProcessStages) {
        const createdStage = await this.databaseService.stage.create({
          data: stageData,
        });
        createdHiringProcessStages.push(createdStage);
      }

      this.logger.log(`Created hiring process: ${hiringProcess.title} with ${hiringProcessStages.length} stages`);
    }

    // Create candidate notes
    this.logger.log('Creating candidate notes...');
    for (const note of data.candidateNotes) {
      await this.databaseService.candidateNote.create({
        data: {
          content: note.content,
          candidateId: createdCandidates[note.candidateIndex].id,
          authorId: createdUsers[note.authorUserIndex].id,
        },
      });
      this.logger.log(`Created note for candidate: ${createdCandidates[note.candidateIndex].name} by ${createdUsers[note.authorUserIndex].name}`);
    }

    // Create email templates
    this.logger.log('Creating email templates...');
    for (const template of data.emailTemplates) {
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

    // Create file uploads
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
          uploadedById: file.uploadedByUserIndex !== undefined ? createdUsers[file.uploadedByUserIndex].id : null,
          candidateId: file.candidateIndex !== undefined ? createdCandidates[file.candidateIndex].id : null,
        },
      });
      createdFileUploads.push(created);
      this.logger.log(`Created file upload: ${file.originalName} (public: ${file.uploadedByPublic})`);
    }

    // Create applications
    this.logger.log('Creating applications...');
    for (const application of data.applications) {
      await this.databaseService.application.create({
        data: {
          jobPositionId: createdJobPositions[application.jobPositionIndex].id,
          applicantName: application.applicantName,
          applicantEmail: application.applicantEmail,
          applicantPhone: application.applicantPhone,
          resumeFileId: application.resumeFileIndex !== undefined ? createdFileUploads[application.resumeFileIndex].id : null,
          coverLetter: application.coverLetter,
          customAnswers: application.customAnswers || {},
          status: application.status as any,
          appliedAt: new Date(application.appliedAt),
          reviewedAt: application.reviewedAt ? new Date(application.reviewedAt) : null,
          reviewedById: application.reviewedByUserIndex !== undefined ? createdUsers[application.reviewedByUserIndex].id : null,
          notes: application.notes,
        },
      });
      this.logger.log(`Created application: ${application.applicantName} for ${createdJobPositions[application.jobPositionIndex].title} (status: ${application.status})`);
    }

    // Create interviews
    this.logger.log('Creating interviews...');
    for (const interview of data.interviews) {
      const candidate = createdCandidates[interview.candidateIndex];

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

      const created = await this.databaseService.interview.create({
        data: {
          stageId: stage.id,
          scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate) : null,
          scheduledTime: interview.scheduledTime,
          duration: interview.duration,
          status: interview.status as any,
          meetingLink: interview.meetingLink,
          location: interview.location,
          notes: interview.notes,
          scheduledById: createdUsers[interview.scheduledByUserIndex].id,
        },
      });
      createdInterviews.push(created);
      this.logger.log(`Created interview for ${candidate.name} at stage ${stage.title} (status: ${interview.status})`);
    }

    // Create interview interviewers
    this.logger.log('Creating interview interviewers...');
    for (const interviewInterviewer of data.interviewInterviewers) {
      const interview = createdInterviews[interviewInterviewer.interviewIndex];
      const user = createdUsers[interviewInterviewer.userIndex];

      await this.databaseService.interviewInterviewer.create({
        data: {
          interviewId: interview.id,
          userId: user.id,
          role: interviewInterviewer.role,
        },
      });
      this.logger.log(`Added interviewer ${user.name} to interview (role: ${interviewInterviewer.role || 'Interviewer'})`);
    }

    // Create candidate activities
    this.logger.log('Creating candidate activities...');
    for (const activity of data.candidateActivities) {
      const candidate = createdCandidates[activity.candidateIndex];

      await this.databaseService.candidateActivity.create({
        data: {
          candidateId: candidate.id,
          type: activity.type as any,
          description: activity.description,
          metadata: activity.metadata || null,
          userId: activity.userIndex !== undefined ? createdUsers[activity.userIndex].id : null,
          createdAt: new Date(activity.createdAt),
        },
      });
      this.logger.log(`Created activity for ${candidate.name}: ${activity.type} at ${activity.createdAt}`);
    }

    // Create stage notes
    this.logger.log('Creating stage notes...');
    for (const note of data.stageNotes) {
      const candidate = createdCandidates[note.candidateIndex];

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

    // Create stage time logs
    this.logger.log('Creating stage time logs...');
    for (const timeLog of data.stageTimeLogs) {
      const candidate = createdCandidates[timeLog.candidateIndex];

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

      await this.databaseService.stageTimeLog.create({
        data: {
          stageId: stage.id,
          candidateId: candidate.id,
          enteredAt: new Date(timeLog.enteredAt),
          exitedAt: timeLog.exitedAt ? new Date(timeLog.exitedAt) : null,
          duration: timeLog.duration,
        },
      });
      this.logger.log(`Created time log for ${candidate.name} at stage ${stage.title} (duration: ${timeLog.duration || 'ongoing'})`);
    }

    // Create email logs
    this.logger.log('Creating email logs...');
    for (const emailLog of data.emailLogs) {
      await this.databaseService.emailLog.create({
        data: {
          recipientEmail: emailLog.recipientEmail,
          recipientName: emailLog.recipientName,
          subject: emailLog.subject,
          template: emailLog.template,
          emailType: emailLog.emailType,
          relatedEntity: emailLog.relatedEntity,
          relatedEntityId: emailLog.relatedEntityId,
          sentAt: new Date(emailLog.sentAt),
        },
      });
      this.logger.log(`Created email log: ${emailLog.emailType} to ${emailLog.recipientName}`);
    }

    // Create HR schedules
    this.logger.log('Creating HR schedules...');
    for (const schedule of data.hrSchedules) {
      const user = createdUsers[schedule.userIndex];

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

    // Create scorecard templates with categories and criteria
    this.logger.log('Creating scorecard templates...');
    for (const template of data.scorecardTemplates) {
      const createdTemplate = await this.databaseService.scorecardTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          companyId: template.companyIndex !== undefined ? createdCompanies[template.companyIndex].id : null,
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

    // Create candidate scores
    this.logger.log('Creating candidate scores...');
    for (const score of data.candidateScores) {
      const candidate = createdCandidates[score.candidateIndex];
      const jobPosition = createdJobPositions[score.jobPositionIndex];

      await this.databaseService.candidateScore.create({
        data: {
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
          overallScore: score.overallScore,
          skillsScore: score.skillsScore,
          experienceScore: score.experienceScore,
          educationScore: score.educationScore,
          analysis: score.analysis || null,
          scoredAt: new Date(score.scoredAt),
        },
      });
      this.logger.log(`Created score for ${candidate.name} on ${jobPosition.title}: ${score.overallScore}/100`);
    }

    // Create AI quotas
    this.logger.log('Creating AI quotas...');
    for (const quota of data.aiQuotas) {
      const company = createdCompanies[quota.companyIndex];

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

    // Create AI usage logs
    this.logger.log('Creating AI usage logs...');
    for (const log of data.aiUsageLogs) {
      const company = createdCompanies[log.companyIndex];
      const user = createdUsers[log.userIndex];

      await this.databaseService.aIUsageLog.create({
        data: {
          companyId: company.id,
          userId: user.id,
          operation: log.operation as any,
          tokensUsed: log.tokensUsed,
          cost: log.cost,
          createdAt: new Date(log.createdAt),
        },
      });
      this.logger.log(`Created AI usage log: ${user.name} - ${log.operation} (${log.tokensUsed || 0} tokens)`);
    }

    this.logger.log('All dummy data created successfully!');
  }
}
