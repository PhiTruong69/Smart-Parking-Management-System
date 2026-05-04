/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ParkingSession` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ParkingSession` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `ParkingSession` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ParkingZone` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ParkingZone` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `ParkingZone` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ParkingZone` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ParkingZone` table. All the data in the column will be lost.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `expiredAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `visitorName` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `billingPeriod` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bkpayTransactionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hcmutId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ssoLastSync` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ssoProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IoTSensor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SSOSyncLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SensorReading` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `period` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `method` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "IoTSensor" DROP CONSTRAINT "IoTSensor_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "ParkingSession" DROP CONSTRAINT "ParkingSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ParkingSession" DROP CONSTRAINT "ParkingSession_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "SensorReading" DROP CONSTRAINT "SensorReading_sensorId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "ParkingSession_entryAt_idx";

-- DropIndex
DROP INDEX "ParkingSession_status_idx";

-- DropIndex
DROP INDEX "ParkingSession_userId_idx";

-- DropIndex
DROP INDEX "ParkingSession_zoneId_idx";

-- DropIndex
DROP INDEX "ParkingZone_name_key";

-- DropIndex
DROP INDEX "ParkingZone_status_idx";

-- DropIndex
DROP INDEX "Ticket_expiredAt_idx";

-- DropIndex
DROP INDEX "Ticket_status_idx";

-- DropIndex
DROP INDEX "Ticket_ticketNo_key";

-- DropIndex
DROP INDEX "Transaction_date_idx";

-- DropIndex
DROP INDEX "Transaction_status_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_hcmutId_key";

-- DropIndex
DROP INDEX "User_ssoProviderId_key";

-- AlterTable
ALTER TABLE "ParkingSession" DROP COLUMN "createdAt",
DROP COLUMN "notes",
DROP COLUMN "plateNumber",
ALTER COLUMN "entryAt" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ParkingZone" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ALTER COLUMN "occupied" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiredAt",
DROP COLUMN "id",
DROP COLUMN "plateNumber",
DROP COLUMN "visitorName",
ALTER COLUMN "issuedAt" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticketNo");

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "billingPeriod",
DROP COLUMN "bkpayTransactionId",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt",
ADD COLUMN     "period" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "method" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "hcmutId",
DROP COLUMN "lastLoginAt",
DROP COLUMN "lastSyncAt",
DROP COLUMN "phone",
DROP COLUMN "ssoLastSync",
DROP COLUMN "ssoProviderId",
DROP COLUMN "updatedAt",
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "ActivityLog";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "BillingPlan";

-- DropTable
DROP TABLE "IoTSensor";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "SSOSyncLog";

-- DropTable
DROP TABLE "SensorReading";
