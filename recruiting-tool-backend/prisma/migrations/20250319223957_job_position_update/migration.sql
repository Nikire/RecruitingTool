/*
  Warnings:

  - You are about to drop the column `createdById` on the `HiringProcess` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId]` on the table `HiringProcess` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobPositionId` to the `HiringProcess` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobPositionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "HiringProcess" DROP CONSTRAINT "HiringProcess_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "HiringProcess" DROP CONSTRAINT "HiringProcess_createdById_fkey";

-- AlterTable
ALTER TABLE "HiringProcess" DROP COLUMN "createdById",
ADD COLUMN     "jobPositionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "estimatedTime" INTEGER,
ADD COLUMN     "jobPositionId" INTEGER;

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hiringProcessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "status" "JobPositionStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_uid_key" ON "Candidate"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_hiringProcessId_key" ON "Candidate"("hiringProcessId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_hiringProcessId_email_key" ON "Candidate"("hiringProcessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosition_uid_key" ON "JobPosition"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "HiringProcess_candidateId_key" ON "HiringProcess"("candidateId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
