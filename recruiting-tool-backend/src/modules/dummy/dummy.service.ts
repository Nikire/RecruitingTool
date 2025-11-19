import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
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
  jobPositions: Array<{
    title: string;
    description: string;
    status: string;
    companyIndex: number;
    createdByUserIndex: number;
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
  }>;
  candidateNotes: Array<{
    content: string;
    candidateIndex: number;
    authorUserIndex: number;
  }>;
}

@Injectable()
export class DummyService implements OnApplicationBootstrap {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    console.log('DummyService initialized');

    // Check if dummy data already exists
    const existingCompanies = await this.databaseService.company.count();
    if (existingCompanies > 0) {
      console.log('Dummy data already exists, skipping creation');
      return;
    }

    console.log('Creating dummy data from JSON...');
    await this.createDummyData();
    console.log('Dummy data created successfully!');
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

    // Create companies
    console.log('Creating companies...');
    for (const company of data.companies) {
      const created = await this.databaseService.company.create({
        data: {
          name: company.name,
          description: company.description,
        },
      });
      createdCompanies.push(created);
      console.log(`Created company: ${created.name}`);
    }

    // Update admin user to belong to first company
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (adminEmail) {
      await this.databaseService.user.update({
        where: { email: adminEmail },
        data: { companyId: createdCompanies[0].id },
      });
      console.log(`Updated admin user to belong to ${createdCompanies[0].name}`);
    }

    // Create users
    console.log('Creating users...');
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
      console.log(`Created user: ${created.name} for ${createdCompanies[user.companyIndex].name}`);
    }

    // Create job positions with stages
    console.log('Creating job positions...');
    for (const jobPosition of data.jobPositions) {
      const created = await this.databaseService.jobPosition.create({
        data: {
          title: jobPosition.title,
          description: jobPosition.description,
          status: jobPosition.status as any,
          companyId: createdCompanies[jobPosition.companyIndex].id,
          createdById: createdUsers[jobPosition.createdByUserIndex].id,
        },
      });
      createdJobPositions.push(created);
      console.log(`Created job position: ${created.title} for ${createdCompanies[jobPosition.companyIndex].name}`);

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
      console.log(`  Created ${stages.length} stages for ${created.title}`);
    }

    // Create candidates
    console.log('Creating candidates...');
    for (const candidate of data.candidates) {
      const created = await this.databaseService.candidate.create({
        data: {
          name: candidate.name,
          email: candidate.email,
        },
      });
      createdCandidates.push(created);
      console.log(`Created candidate: ${created.name}`);
    }

    // Create hiring processes
    console.log('Creating hiring processes...');
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

      console.log(`Created hiring process: ${hiringProcess.title} with ${hiringProcessStages.length} stages`);
    }

    // Create candidate notes
    console.log('Creating candidate notes...');
    for (const note of data.candidateNotes) {
      await this.databaseService.candidateNote.create({
        data: {
          content: note.content,
          candidateId: createdCandidates[note.candidateIndex].id,
          authorId: createdUsers[note.authorUserIndex].id,
        },
      });
      console.log(`Created note for candidate: ${createdCandidates[note.candidateIndex].name} by ${createdUsers[note.authorUserIndex].name}`);
    }

    console.log('All dummy data created successfully!');
  }
}
