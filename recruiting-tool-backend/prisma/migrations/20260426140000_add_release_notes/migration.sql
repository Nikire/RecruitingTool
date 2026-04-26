CREATE TABLE "ReleaseNote" (
  "id" SERIAL NOT NULL,
  "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "version" TEXT,
  "targetTier" TEXT NOT NULL DEFAULT 'all',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReleaseNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeenReleaseNote" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "releaseNoteId" INTEGER NOT NULL,
  "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeenReleaseNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReleaseNote_uid_key" ON "ReleaseNote"("uid");
CREATE INDEX "ReleaseNote_isPublished_idx" ON "ReleaseNote"("isPublished");
CREATE INDEX "ReleaseNote_createdAt_idx" ON "ReleaseNote"("createdAt");
CREATE INDEX "ReleaseNote_uid_idx" ON "ReleaseNote"("uid");
CREATE UNIQUE INDEX "SeenReleaseNote_userId_releaseNoteId_key" ON "SeenReleaseNote"("userId", "releaseNoteId");
CREATE INDEX "SeenReleaseNote_userId_idx" ON "SeenReleaseNote"("userId");
CREATE INDEX "SeenReleaseNote_releaseNoteId_idx" ON "SeenReleaseNote"("releaseNoteId");

ALTER TABLE "SeenReleaseNote" ADD CONSTRAINT "SeenReleaseNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeenReleaseNote" ADD CONSTRAINT "SeenReleaseNote_releaseNoteId_fkey" FOREIGN KEY ("releaseNoteId") REFERENCES "ReleaseNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
