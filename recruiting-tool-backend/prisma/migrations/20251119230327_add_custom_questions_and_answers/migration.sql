-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "customAnswers" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "JobPosition" ADD COLUMN     "customQuestions" JSONB DEFAULT '[]';
