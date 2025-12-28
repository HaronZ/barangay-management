/*
  Warnings:

  - You are about to drop the column `residentId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `residentId` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `residentId` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the `officials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `residents` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `personId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OFFICIAL';

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_residentId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_residentId_fkey";

-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_residentId_fkey";

-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_householdId_fkey";

-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_userId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "residentId",
ADD COLUMN     "personId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "residentId",
ADD COLUMN     "personId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "residentId",
ADD COLUMN     "personId" TEXT;

-- DropTable
DROP TABLE "officials";

-- DropTable
DROP TABLE "residents";

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT,
    "gender" "Gender" NOT NULL,
    "civilStatus" "CivilStatus" NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Filipino',
    "religion" TEXT,
    "occupation" TEXT,
    "contactNumber" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "photo" TEXT,
    "householdId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "official_details" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "termStart" TIMESTAMP(3) NOT NULL,
    "termEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "persons_userId_key" ON "persons"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "official_details_personId_key" ON "official_details"("personId");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_details" ADD CONSTRAINT "official_details_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
