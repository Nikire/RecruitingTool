CREATE TABLE "CompanyCalendarSettings" (
  "id" SERIAL NOT NULL,
  "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "companyId" INTEGER NOT NULL,
  "isBookingEnabled" BOOLEAN NOT NULL DEFAULT false,
  "workingDays" JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
  "workingHoursEnd" TEXT NOT NULL DEFAULT '18:00',
  "bufferMinutes" INTEGER NOT NULL DEFAULT 15,
  "defaultDurationMinutes" INTEGER NOT NULL DEFAULT 60,
  "blockedDates" JSONB NOT NULL DEFAULT '[]',
  "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyCalendarSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyCalendarSettings_uid_key" ON "CompanyCalendarSettings"("uid");
CREATE UNIQUE INDEX "CompanyCalendarSettings_companyId_key" ON "CompanyCalendarSettings"("companyId");
CREATE INDEX "CompanyCalendarSettings_companyId_idx" ON "CompanyCalendarSettings"("companyId");

ALTER TABLE "CompanyCalendarSettings" ADD CONSTRAINT "CompanyCalendarSettings_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
