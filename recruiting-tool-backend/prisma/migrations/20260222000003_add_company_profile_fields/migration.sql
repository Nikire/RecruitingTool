-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "careersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "careersHeadline" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "website" TEXT;
