-- CreateTable
CREATE TABLE "DemoBookingToken" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "prospectEmail" TEXT NOT NULL,
    "prospectName" TEXT,
    "prospectCompany" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBookingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoTimeSlot" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tokenId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "selectedAt" TIMESTAMP(3),

    CONSTRAINT "DemoTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoBookingToken_uid_key" ON "DemoBookingToken"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "DemoBookingToken_token_key" ON "DemoBookingToken"("token");

-- CreateIndex
CREATE INDEX "DemoBookingToken_token_idx" ON "DemoBookingToken"("token");

-- CreateIndex
CREATE INDEX "DemoBookingToken_companyId_idx" ON "DemoBookingToken"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoTimeSlot_uid_key" ON "DemoTimeSlot"("uid");

-- CreateIndex
CREATE INDEX "DemoTimeSlot_tokenId_idx" ON "DemoTimeSlot"("tokenId");

-- AddForeignKey
ALTER TABLE "DemoBookingToken" ADD CONSTRAINT "DemoBookingToken_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoTimeSlot" ADD CONSTRAINT "DemoTimeSlot_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "DemoBookingToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
