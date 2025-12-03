-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE', 'OUTLOOK');

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3),
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_uid_key" ON "CalendarConnection"("uid");

-- CreateIndex
CREATE INDEX "CalendarConnection_userId_idx" ON "CalendarConnection"("userId");

-- CreateIndex
CREATE INDEX "CalendarConnection_provider_idx" ON "CalendarConnection"("provider");

-- CreateIndex
CREATE INDEX "CalendarConnection_uid_idx" ON "CalendarConnection"("uid");

-- CreateIndex
CREATE INDEX "CalendarConnection_tokenExpiry_idx" ON "CalendarConnection"("tokenExpiry");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_userId_provider_key" ON "CalendarConnection"("userId", "provider");

-- AddForeignKey
ALTER TABLE "CalendarConnection" ADD CONSTRAINT "CalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
