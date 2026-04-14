/*
  Warnings:

  - You are about to drop the column `classId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `Class` table. All the data in the column will be lost.
  - Added the required column `date` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "classTypeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "parentBookingId" TEXT,
    "isRecovery" BOOLEAN NOT NULL DEFAULT false,
    "recoveryExpiresAt" DATETIME,
    "originalClassDate" DATETIME,
    "rescheduledCount" INTEGER NOT NULL DEFAULT 0,
    "rescheduledFromDate" DATETIME,
    "totalPrice" INTEGER,
    "isMonthlyPlan" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_parentBookingId_fkey" FOREIGN KEY ("parentBookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancelReason", "cancelledAt", "classTypeId", "confirmedAt", "createdAt", "date", "email", "endTime", "id", "isParent", "isRecovery", "message", "name", "originalClassDate", "parentBookingId", "phone", "recoveryExpiresAt", "rescheduledCount", "rescheduledFromDate", "startTime", "status", "updatedAt") SELECT "cancelReason", "cancelledAt", "classTypeId", "confirmedAt", "createdAt", "date", "email", "endTime", "id", "isParent", "isRecovery", "message", "name", "originalClassDate", "parentBookingId", "phone", "recoveryExpiresAt", "rescheduledCount", "rescheduledFromDate", "startTime", "status", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT,
    "bookingId" TEXT,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "modalidad" TEXT,
    "isTrialClass" BOOLEAN NOT NULL DEFAULT false,
    "classNumber" INTEGER,
    "totalInPlan" INTEGER,
    "confirmedAt" DATETIME,
    "confirmedBy" TEXT,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "rescheduledFrom" TEXT,
    "completedAt" DATETIME,
    "attendanceMarked" BOOLEAN NOT NULL DEFAULT false,
    "classTypeId" TEXT,
    "isRecovery" BOOLEAN NOT NULL DEFAULT false,
    "recoveryExpiresAt" DATETIME,
    "originalScheduledDate" DATETIME,
    "attendanceStatus" TEXT,
    "cancelledWithin48h" BOOLEAN NOT NULL DEFAULT false,
    "needsRenewalReminder" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Class_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Class_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("attendanceMarked", "attendanceStatus", "cancelReason", "cancelledAt", "cancelledWithin48h", "classNumber", "classTypeId", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "duration", "id", "isRecovery", "isTrialClass", "modalidad", "originalScheduledDate", "recoveryExpiresAt", "rescheduledFrom", "status", "studentId", "totalInPlan", "updatedAt") SELECT "attendanceMarked", "attendanceStatus", "cancelReason", "cancelledAt", "cancelledWithin48h", "classNumber", "classTypeId", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "duration", "id", "isRecovery", "isTrialClass", "modalidad", "originalScheduledDate", "recoveryExpiresAt", "rescheduledFrom", "status", "studentId", "totalInPlan", "updatedAt" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
