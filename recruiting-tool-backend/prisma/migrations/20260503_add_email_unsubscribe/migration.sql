CREATE TABLE "EmailUnsubscribe" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailUnsubscribe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailUnsubscribe_uid_key" ON "EmailUnsubscribe"("uid");
CREATE UNIQUE INDEX "EmailUnsubscribe_token_key" ON "EmailUnsubscribe"("token");
CREATE INDEX "EmailUnsubscribe_email_idx" ON "EmailUnsubscribe"("email");
CREATE INDEX "EmailUnsubscribe_token_idx" ON "EmailUnsubscribe"("token");
