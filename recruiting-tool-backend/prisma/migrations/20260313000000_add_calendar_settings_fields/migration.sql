-- AlterTable
ALTER TABLE "CalendarConnection" ADD COLUMN "bufferTime" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN "defaultDuration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "workingHours" JSONB;
