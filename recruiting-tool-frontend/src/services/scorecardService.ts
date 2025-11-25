/**
 * Scorecard Service
 * Mock API service for scorecard templates and submissions
 */

import {
  ScorecardTemplate,
  ScorecardSubmission,
  CreateScorecardTemplateDto,
  SubmitScorecardDto,
  UpdateScorecardTemplateDto,
} from '../types/scorecard';

// Mock data storage
let mockTemplates: ScorecardTemplate[] = [
  {
    uid: 'template-1',
    name: 'Technical Interview Scorecard',
    description: 'Standard scorecard for technical interviews',
    categories: [
      {
        uid: 'cat-1',
        name: 'Technical Skills',
        weight: 40,
        criteria: [
          {
            uid: 'crit-1',
            name: 'Problem Solving',
            description: 'Ability to analyze and solve complex problems',
            maxScore: 5,
          },
          {
            uid: 'crit-2',
            name: 'Code Quality',
            description: 'Writing clean, maintainable code',
            maxScore: 5,
          },
          {
            uid: 'crit-3',
            name: 'Technical Knowledge',
            description: 'Depth of technical expertise',
            maxScore: 5,
          },
        ],
      },
      {
        uid: 'cat-2',
        name: 'Communication',
        weight: 30,
        criteria: [
          {
            uid: 'crit-4',
            name: 'Verbal Communication',
            description: 'Clarity and effectiveness in verbal communication',
            maxScore: 5,
          },
          {
            uid: 'crit-5',
            name: 'Listening Skills',
            description: 'Active listening and understanding',
            maxScore: 5,
          },
        ],
      },
      {
        uid: 'cat-3',
        name: 'Cultural Fit',
        weight: 30,
        criteria: [
          {
            uid: 'crit-6',
            name: 'Team Collaboration',
            description: 'Ability to work effectively in a team',
            maxScore: 5,
          },
          {
            uid: 'crit-7',
            name: 'Values Alignment',
            description: 'Alignment with company values',
            maxScore: 5,
          },
        ],
      },
    ],
    createdAt: new Date('2025-01-15').toISOString(),
    createdByName: 'John Doe',
  },
  {
    uid: 'template-2',
    name: 'Behavioral Interview Scorecard',
    description: 'Scorecard for behavioral and cultural fit assessment',
    categories: [
      {
        uid: 'cat-4',
        name: 'Leadership',
        weight: 35,
        criteria: [
          {
            uid: 'crit-8',
            name: 'Decision Making',
            maxScore: 5,
          },
          {
            uid: 'crit-9',
            name: 'Team Management',
            maxScore: 5,
          },
        ],
      },
      {
        uid: 'cat-5',
        name: 'Adaptability',
        weight: 35,
        criteria: [
          {
            uid: 'crit-10',
            name: 'Learning Agility',
            maxScore: 5,
          },
          {
            uid: 'crit-11',
            name: 'Change Management',
            maxScore: 5,
          },
        ],
      },
      {
        uid: 'cat-6',
        name: 'Motivation',
        weight: 30,
        criteria: [
          {
            uid: 'crit-12',
            name: 'Career Goals',
            maxScore: 5,
          },
          {
            uid: 'crit-13',
            name: 'Company Interest',
            maxScore: 5,
          },
        ],
      },
    ],
    createdAt: new Date('2025-01-20').toISOString(),
    createdByName: 'Jane Smith',
  },
];

let mockSubmissions: ScorecardSubmission[] = [];

// Generate unique IDs
const generateUid = () => `scorecard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get all scorecard templates
 */
export const getTemplates = async (): Promise<ScorecardTemplate[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockTemplates];
};

/**
 * Get a single scorecard template by UID
 */
export const getTemplate = async (uid: string): Promise<ScorecardTemplate | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const template = mockTemplates.find((t) => t.uid === uid);
  return template ? { ...template } : null;
};

/**
 * Create a new scorecard template
 */
export const createTemplate = async (
  data: CreateScorecardTemplateDto
): Promise<ScorecardTemplate> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newTemplate: ScorecardTemplate = {
    uid: generateUid(),
    name: data.name,
    description: data.description,
    categories: data.categories.map((cat) => ({
      uid: generateUid(),
      name: cat.name,
      weight: cat.weight,
      criteria: cat.criteria.map((crit) => ({
        uid: generateUid(),
        name: crit.name,
        description: crit.description,
        maxScore: crit.maxScore,
      })),
    })),
    createdAt: new Date().toISOString(),
    createdByName: 'Current User', // Would come from auth context
  };

  mockTemplates.push(newTemplate);
  return newTemplate;
};

/**
 * Update an existing scorecard template
 */
export const updateTemplate = async (
  uid: string,
  data: UpdateScorecardTemplateDto
): Promise<ScorecardTemplate> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockTemplates.findIndex((t) => t.uid === uid);
  if (index === -1) {
    throw new Error('Template not found');
  }

  const updatedTemplate: ScorecardTemplate = {
    ...mockTemplates[index],
    name: data.name ?? mockTemplates[index].name,
    description: data.description ?? mockTemplates[index].description,
    categories: data.categories
      ? data.categories.map((cat) => ({
          uid: generateUid(),
          name: cat.name,
          weight: cat.weight,
          criteria: cat.criteria.map((crit) => ({
            uid: generateUid(),
            name: crit.name,
            description: crit.description,
            maxScore: crit.maxScore,
          })),
        }))
      : mockTemplates[index].categories,
    updatedAt: new Date().toISOString(),
  };

  mockTemplates[index] = updatedTemplate;
  return updatedTemplate;
};

/**
 * Delete a scorecard template
 */
export const deleteTemplate = async (uid: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockTemplates = mockTemplates.filter((t) => t.uid !== uid);
};

/**
 * Submit a scorecard for an interview
 */
export const submitScorecard = async (
  data: SubmitScorecardDto
): Promise<ScorecardSubmission> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const template = mockTemplates.find((t) => t.uid === data.templateUid);
  if (!template) {
    throw new Error('Template not found');
  }

  // Calculate overall score based on weighted categories
  let totalWeightedScore = 0;
  const enrichedScores = data.scores.map((score) => {
    // Find criterion and category
    let categoryName = '';
    let criterionName = '';
    let categoryWeight = 0;
    let maxScore = 5;

    for (const category of template.categories) {
      const criterion = category.criteria.find((c) => c.uid === score.criterionUid);
      if (criterion) {
        categoryName = category.name;
        criterionName = criterion.name;
        categoryWeight = category.weight;
        maxScore = criterion.maxScore;

        // Calculate weighted contribution
        const normalizedScore = (score.score / maxScore) * 100;
        const criteriaCount = category.criteria.length;
        const weightPerCriterion = categoryWeight / criteriaCount;
        totalWeightedScore += (normalizedScore * weightPerCriterion) / 100;
        break;
      }
    }

    return {
      ...score,
      criterionName,
      categoryName,
    };
  });

  const newSubmission: ScorecardSubmission = {
    uid: generateUid(),
    templateUid: data.templateUid,
    templateName: template.name,
    interviewUid: data.interviewUid,
    evaluatorUid: 'current-user-uid', // Would come from auth context
    evaluatorName: 'Current User',
    scores: enrichedScores,
    overallScore: Math.round(totalWeightedScore * 100) / 100,
    notes: data.notes,
    submittedAt: new Date().toISOString(),
  };

  mockSubmissions.push(newSubmission);
  return newSubmission;
};

/**
 * Get all scorecards for a specific interview
 */
export const getScorecardsByInterview = async (
  interviewUid: string
): Promise<ScorecardSubmission[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSubmissions.filter((s) => s.interviewUid === interviewUid);
};

/**
 * Get a single scorecard submission
 */
export const getScorecard = async (uid: string): Promise<ScorecardSubmission | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const submission = mockSubmissions.find((s) => s.uid === uid);
  return submission ? { ...submission } : null;
};
