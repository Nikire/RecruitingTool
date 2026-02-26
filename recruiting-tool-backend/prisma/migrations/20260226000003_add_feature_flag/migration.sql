-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_uid_key" ON "FeatureFlag"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_planType_key" ON "FeatureFlag"("key", "planType");

-- CreateIndex
CREATE INDEX "FeatureFlag_planType_idx" ON "FeatureFlag"("planType");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");
