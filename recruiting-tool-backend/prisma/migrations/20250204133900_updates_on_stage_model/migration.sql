/*
  Warnings:

  - A unique constraint covering the columns `[hiringProcessId,position]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('OPEN', 'CANCELLED', 'DONE');

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "status" "StageStatus" NOT NULL DEFAULT 'OPEN';

-- CreateIndex
CREATE UNIQUE INDEX "Stage_hiringProcessId_position_key" ON "Stage"("hiringProcessId", "position");
