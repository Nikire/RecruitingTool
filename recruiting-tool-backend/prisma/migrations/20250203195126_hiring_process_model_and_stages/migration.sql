-- CreateEnum
CREATE TYPE "HiringProcessStatus" AS ENUM ('OPEN', 'CLOSED', 'IN_PROGRESS', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('INTERVIEW', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER');

-- CreateTable
CREATE TABLE "HiringProcess" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "HiringProcessStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "HiringProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "StageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hiringProcessId" INTEGER NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HiringProcess_uid_key" ON "HiringProcess"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_uid_key" ON "Stage"("uid");

-- AddForeignKey
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
