CREATE TABLE "OutreachTemplateOverride" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "variantIndex" INTEGER NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachTemplateOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OutreachTemplateOverride_uid_key" ON "OutreachTemplateOverride"("uid");
CREATE UNIQUE INDEX "OutreachTemplateOverride_templateId_lang_variantIndex_key" ON "OutreachTemplateOverride"("templateId", "lang", "variantIndex");
CREATE INDEX "OutreachTemplateOverride_uid_idx" ON "OutreachTemplateOverride"("uid");
CREATE INDEX "OutreachTemplateOverride_templateId_idx" ON "OutreachTemplateOverride"("templateId");
