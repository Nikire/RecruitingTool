import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HiringProcessService } from '../hiring-process/hiring-process.service';
import { CandidateService } from '../hiring-process/modules/candidate/candidate.service';
import { JobPositionService } from '../job-position/job-position.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { CreateJobPositionDto } from '../job-position/dto/job-position.dto';
import { CreateCandidateDto } from '../hiring-process/modules/candidate/dto/candidate.dto';
import { CreateStageDto } from '../hiring-process/modules/stages/dto/stages.dto';
import { StagesService } from '../hiring-process/modules/stages/stages.service';
import { StageType } from '@prisma/client';
import { CreateHiringProcessDto } from '../hiring-process/dto/hiring-process.dto';

@Injectable()
export class DummyService implements OnApplicationBootstrap {
  constructor(
    private readonly jobPositionService: JobPositionService,
    private readonly stagesService: StagesService,
    private readonly candidateService: CandidateService,
    private readonly hiringProcessService: HiringProcessService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  async onApplicationBootstrap() {
    console.log('DummyService initialized');
    const adminUser = await this.usersService.findByEmail(this.configService.get<string>('ADMIN_EMAIL'));
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    const existingAdminJobPositions = await this.jobPositionService.find({ createdBy: { uid: adminUser.uid } });

    if (existingAdminJobPositions.length > 0) {
      console.log('Dummy data already exists, skipping creation');
      return;
    }

    const dummyCandidate: CreateCandidateDto = {
      email: 'dummy.candidate@example.com',
      name: 'Dummy Candidate',
    };

    const createdCandidate = await this.candidateService.create(dummyCandidate);

    console.log('Created dummy candidate with UID:', createdCandidate.uid);

    const dummyJobPosition: CreateJobPositionDto = {
      title: 'Software Engineer',
    };

    const createdJobPosition = await this.jobPositionService.create(adminUser.uid, dummyJobPosition);

    console.log('Created dummy job position with UID:', createdJobPosition.uid);

    const dummyStages: Array<CreateStageDto> = [
      { title: 'Phone Screen', type: StageType.INTERVIEW, description: 'Initial phone screen', jobPositionUid: createdJobPosition.uid },
      { title: 'Technical Interview', type: StageType.TECHNICAL_INTERVIEW, description: 'In-depth technical interview', jobPositionUid: createdJobPosition.uid },
      { title: 'HR Interview', type: StageType.FINAL_INTERVIEW, description: 'Final HR interview', jobPositionUid: createdJobPosition.uid },
    ];

    const createdStages = await this.stagesService.bulkCreateStages(dummyStages);

    console.log(
      'Created dummy stages:',
      createdStages.map((s) => s.title),
    );

    const dummyHiringProcess: CreateHiringProcessDto = { candidateUid: createdCandidate.uid, jobPositionUid: createdJobPosition.uid };

    const createdHiringProcess = await this.hiringProcessService.create(dummyHiringProcess);

    console.log('Created dummy hiring process with UID:', createdHiringProcess.uid);
  }
}
