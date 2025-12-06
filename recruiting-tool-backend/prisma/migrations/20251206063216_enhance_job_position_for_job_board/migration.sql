-- AlterEnum
ALTER TYPE "JobType" ADD VALUE 'FREELANCE';

-- AlterTable
ALTER TABLE "JobPosition" ADD COLUMN     "applicationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showSalary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "JobPosition_city_idx" ON "JobPosition"("city");

-- CreateIndex
CREATE INDEX "JobPosition_country_idx" ON "JobPosition"("country");

-- CreateIndex
CREATE INDEX "JobPosition_isHighlighted_idx" ON "JobPosition"("isHighlighted");

-- CreateIndex
CREATE INDEX "JobPosition_viewCount_idx" ON "JobPosition"("viewCount");

-- CreateIndex
CREATE INDEX "JobPosition_applicationCount_idx" ON "JobPosition"("applicationCount");
