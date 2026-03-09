-- AlterTable: make User.email nullable to support social login accounts without email
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
