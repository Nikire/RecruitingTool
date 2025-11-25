import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateScorecardTemplateDto,
  UpdateScorecardTemplateDto,
  ScorecardTemplateResponseDto,
  CategoryResponseDto,
  CriterionResponseDto,
} from './dto/scorecard.dto';

@Injectable()
export class ScorecardTemplateService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(companyUid?: string): Promise<ScorecardTemplateResponseDto[]> {
    const whereClause: any = { isActive: true };

    if (companyUid) {
      const company = await this.prisma.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      whereClause.companyId = company.id;
    }

    const templates = await this.prisma.scorecardTemplate.findMany({
      where: whereClause,
      include: {
        company: true,
        categories: {
          orderBy: { order: 'asc' },
          include: {
            criteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map((template) => this.mapTemplateToResponse(template));
  }

  async getTemplateByUid(uid: string): Promise<ScorecardTemplateResponseDto> {
    const template = await this.prisma.scorecardTemplate.findUnique({
      where: { uid },
      include: {
        company: true,
        categories: {
          orderBy: { order: 'asc' },
          include: {
            criteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Scorecard template not found');
    }

    return this.mapTemplateToResponse(template);
  }

  async createTemplate(dto: CreateScorecardTemplateDto): Promise<ScorecardTemplateResponseDto> {
    // Validate that category weights sum to 100
    const totalWeight = dto.categories.reduce((sum, cat) => sum + cat.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException('Category weights must sum to 100%');
    }

    // Resolve company ID if companyUid is provided
    let companyId: number | null = null;
    if (dto.companyUid) {
      const company = await this.prisma.company.findUnique({
        where: { uid: dto.companyUid },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      companyId = company.id;
    }

    // Create template with nested categories and criteria
    const template = await this.prisma.scorecardTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId,
        isActive: dto.isActive ?? true,
        categories: {
          create: dto.categories.map((category) => ({
            name: category.name,
            weight: category.weight,
            order: category.order,
            criteria: {
              create: category.criteria.map((criterion) => ({
                name: criterion.name,
                description: criterion.description,
                maxScore: criterion.maxScore,
                order: criterion.order,
              })),
            },
          })),
        },
      },
      include: {
        company: true,
        categories: {
          orderBy: { order: 'asc' },
          include: {
            criteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return this.mapTemplateToResponse(template);
  }

  async updateTemplate(uid: string, dto: UpdateScorecardTemplateDto): Promise<ScorecardTemplateResponseDto> {
    const existingTemplate = await this.prisma.scorecardTemplate.findUnique({
      where: { uid },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Scorecard template not found');
    }

    // Validate category weights if categories are being updated
    if (dto.categories) {
      const totalWeight = dto.categories.reduce((sum, cat) => sum + cat.weight, 0);
      if (totalWeight !== 100) {
        throw new BadRequestException('Category weights must sum to 100%');
      }

      // Delete existing categories and criteria (cascade will handle criteria)
      await this.prisma.scorecardCategory.deleteMany({
        where: { templateId: existingTemplate.id },
      });
    }

    // Update template
    const template = await this.prisma.scorecardTemplate.update({
      where: { uid },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        ...(dto.categories && {
          categories: {
            create: dto.categories.map((category) => ({
              name: category.name,
              weight: category.weight,
              order: category.order,
              criteria: {
                create: category.criteria.map((criterion) => ({
                  name: criterion.name,
                  description: criterion.description,
                  maxScore: criterion.maxScore,
                  order: criterion.order,
                })),
              },
            })),
          },
        }),
      },
      include: {
        company: true,
        categories: {
          orderBy: { order: 'asc' },
          include: {
            criteria: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return this.mapTemplateToResponse(template);
  }

  async deleteTemplate(uid: string): Promise<void> {
    const template = await this.prisma.scorecardTemplate.findUnique({
      where: { uid },
    });

    if (!template) {
      throw new NotFoundException('Scorecard template not found');
    }

    // Soft delete by setting isActive to false
    await this.prisma.scorecardTemplate.update({
      where: { uid },
      data: { isActive: false },
    });
  }

  private mapTemplateToResponse(template: any): ScorecardTemplateResponseDto {
    return {
      uid: template.uid,
      name: template.name,
      description: template.description,
      companyUid: template.company?.uid,
      isActive: template.isActive,
      categories: template.categories.map((category: any) => ({
        uid: category.uid,
        name: category.name,
        weight: category.weight,
        order: category.order,
        criteria: category.criteria.map((criterion: any) => ({
          uid: criterion.uid,
          name: criterion.name,
          description: criterion.description,
          maxScore: criterion.maxScore,
          order: criterion.order,
        })),
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
