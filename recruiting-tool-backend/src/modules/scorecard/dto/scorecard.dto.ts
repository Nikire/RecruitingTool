import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs for Scorecard Template Creation
export class CreateCriterionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  maxScore: number = 5;

  @IsInt()
  @Min(0)
  order: number = 0;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @Max(100)
  weight: number;

  @IsInt()
  @Min(0)
  order: number = 0;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCriterionDto)
  criteria: CreateCriterionDto[];
}

export class CreateScorecardTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  companyUid?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories: CreateCategoryDto[];
}

export class UpdateScorecardTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  @IsOptional()
  categories?: CreateCategoryDto[];
}

// DTOs for Scorecard Submission
export class CriterionScoreDto {
  @IsString()
  @IsNotEmpty()
  criterionUid: string;

  @IsInt()
  @Min(0)
  score: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubmitScorecardDto {
  @IsString()
  @IsNotEmpty()
  templateUid: string;

  @IsString()
  @IsNotEmpty()
  interviewUid: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionScoreDto)
  scores: CriterionScoreDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

// Response DTOs
export class CriterionResponseDto {
  uid: string;
  name: string;
  description?: string;
  maxScore: number;
  order: number;
}

export class CategoryResponseDto {
  uid: string;
  name: string;
  weight: number;
  order: number;
  criteria: CriterionResponseDto[];
}

export class ScorecardTemplateResponseDto {
  uid: string;
  name: string;
  description?: string;
  companyUid?: string;
  isActive: boolean;
  categories: CategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CriterionScoreResponseDto {
  criterionUid: string;
  criterionName: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export class CategoryScoreResponseDto {
  categoryName: string;
  weight: number;
  scores: CriterionScoreResponseDto[];
}

export class ScorecardResponseDto {
  uid: string;
  templateUid: string;
  templateName: string;
  interviewUid: string;
  evaluatorUid: string;
  evaluatorName: string;
  overallScore: number;
  notes?: string;
  categoryScores: CategoryScoreResponseDto[];
  submittedAt: Date;
  createdAt: Date;
}

// Consensus/Summary DTOs
export class CriterionConsensusDto {
  criterionUid: string;
  criterionName: string;
  averageScore: number;
  maxScore: number;
  variance: number;
  evaluatorScores: Array<{
    evaluatorUid: string;
    evaluatorName: string;
    score: number;
    notes?: string;
  }>;
}

export class CategoryConsensusDto {
  categoryName: string;
  weight: number;
  averageScore: number;
  variance: number;
  criteria: CriterionConsensusDto[];
}

export class ScorecardSummaryDto {
  interviewUid: string;
  totalEvaluators: number;
  averageOverallScore: number;
  variance: number;
  categoryConsensus: CategoryConsensusDto[];
  highVarianceItems: Array<{
    criterionName: string;
    variance: number;
    averageScore: number;
  }>;
  evaluatorScorecards: Array<{
    evaluatorUid: string;
    evaluatorName: string;
    overallScore: number;
    submittedAt: Date;
  }>;
}
