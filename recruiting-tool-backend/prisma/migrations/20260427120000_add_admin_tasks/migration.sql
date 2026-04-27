CREATE TYPE "AdminTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
CREATE TYPE "AdminTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "AdminTask" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AdminTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "AdminTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "labels" TEXT[],
    "assignedToId" INTEGER,
    "linkedCompanyId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminTask_uid_key" ON "AdminTask"("uid");
CREATE INDEX "AdminTask_uid_idx" ON "AdminTask"("uid");
CREATE INDEX "AdminTask_status_idx" ON "AdminTask"("status");
CREATE INDEX "AdminTask_createdById_idx" ON "AdminTask"("createdById");
CREATE INDEX "AdminTask_assignedToId_idx" ON "AdminTask"("assignedToId");

ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_linkedCompanyId_fkey"
  FOREIGN KEY ("linkedCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
