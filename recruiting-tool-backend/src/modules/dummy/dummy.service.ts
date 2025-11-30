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

      await this.databaseService.stage.createMany({
        data: hiringProcessStages,
      });

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

    this.logger.log('All dummy data created successfully!');
  }
}
