import { AnalyticsData } from '../types/analytics';

/**
 * Mock Analytics Service
 *
 * Generates realistic mock data for analytics dashboard.
 * In production, this would call actual API endpoints.
 */

const MOCK_JOB_POSITIONS = [
  'Senior Software Engineer',
  'Product Manager',
  'UX Designer',
  'Data Analyst',
  'DevOps Engineer',
  'Marketing Manager',
];

const MOCK_SOURCES = [
  'LinkedIn',
  'Indeed',
  'Referral',
  'Company Website',
  'Job Board',
  'Recruiter',
];

const MOCK_STAGES = [
  'Application',
  'Screening',
  'Interview',
  'Technical Test',
  'Offer',
  'Hired',
];

const MOCK_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'SQL',
  'Agile',
  'Leadership',
  'Communication',
];

/**
 * Generate random number within range
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random percentage trend
 */
const randomTrend = (): number => {
  return Math.random() > 0.5 ? randomInt(5, 20) : -randomInt(5, 15);
};

/**
 * Get last N months formatted
 */
const getLastMonths = (n: number): string[] => {
  const months = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }

  return months;
};

/**
 * Get last N weeks formatted
 */
const getLastWeeks = (n: number): string[] => {
  const weeks = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    weeks.push(`Week ${date.getDate()}/${date.getMonth() + 1}`);
  }

  return weeks;
};

/**
 * Fetch analytics data (mock implementation)
 */
export const getAnalyticsData = async (
  dateRange?: { startDate: Date | null; endDate: Date | null }
): Promise<AnalyticsData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate overview metrics
  const totalCandidates = randomInt(100, 500);
  const totalHiringProcesses = randomInt(30, 150);
  const activeJobPositions = randomInt(5, 25);
  const hiredThisMonth = randomInt(3, 15);
  const avgTimeToHire = randomInt(14, 45);

  // Generate stage conversion rates (funnel data)
  const conversionRates = [];
  let previousCount = 100;

  for (let i = 0; i < MOCK_STAGES.length - 1; i++) {
    const rate = randomInt(60, 90) - (i * 5); // Decreasing conversion as we go through stages
    const count = Math.floor((previousCount * rate) / 100);

    conversionRates.push({
      fromStage: MOCK_STAGES[i],
      toStage: MOCK_STAGES[i + 1],
      rate,
      count,
    });

    previousCount = count;
  }

  // Generate time to hire by position
  const timeToHireByPosition = MOCK_JOB_POSITIONS.map((position) => ({
    position,
    days: randomInt(20, 60),
    count: randomInt(2, 8),
  }));

  // Generate hiring trends over last 6 months
  const months = getLastMonths(6);
  const hiresOverTime = months.map((month, index) => ({
    month,
    count: randomInt(3, 12) + index, // Slight upward trend
    target: 10, // Target of 10 hires per month
  }));

  // Generate source distribution
  const totalSources = randomInt(80, 200);
  const sourceDistribution = MOCK_SOURCES.map((source) => {
    const count = randomInt(10, 50);
    return {
      source,
      count,
      percentage: Math.round((count / totalSources) * 100),
    };
  });

  // Generate status distribution
  const statusDistribution = [
    { status: 'Active', count: randomInt(30, 80), percentage: 0 },
    { status: 'In Progress', count: randomInt(20, 60), percentage: 0 },
    { status: 'Hired', count: randomInt(10, 30), percentage: 0 },
    { status: 'Rejected', count: randomInt(15, 40), percentage: 0 },
    { status: 'Withdrawn', count: randomInt(5, 20), percentage: 0 },
  ];

  const totalStatus = statusDistribution.reduce((sum, item) => sum + item.count, 0);
  statusDistribution.forEach((item) => {
    item.percentage = Math.round((item.count / totalStatus) * 100);
  });

  // Generate top skills
  const topSkills = MOCK_SKILLS.slice(0, 8).map((skill) => ({
    skill,
    count: randomInt(10, 50),
  })).sort((a, b) => b.count - a.count);

  // Generate average score by position
  const avgScoreByPosition = MOCK_JOB_POSITIONS.map((position) => ({
    position,
    score: randomInt(65, 95),
    candidateCount: randomInt(5, 20),
  }));

  // Generate interviews per week for last 8 weeks
  const weeks = getLastWeeks(8);
  const interviewsPerWeek = weeks.map((week) => ({
    week,
    count: randomInt(5, 25),
  }));

  return {
    overview: {
      totalCandidates,
      totalHiringProcesses,
      activeJobPositions,
      hiredThisMonth,
      avgTimeToHire,
      candidatesTrend: randomTrend(),
      processesTrend: randomTrend(),
      positionsTrend: randomTrend(),
      hiredTrend: randomTrend(),
      timeToHireTrend: randomTrend(),
    },
    hiring: {
      conversionRates,
      timeToHireByPosition,
      hiresOverTime,
    },
    candidates: {
      sourceDistribution,
      statusDistribution,
      topSkills,
    },
    performance: {
      avgScoreByPosition,
      interviewsPerWeek,
    },
  };
};
