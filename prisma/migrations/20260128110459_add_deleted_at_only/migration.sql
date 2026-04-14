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
    "classId" TEXT,
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
    CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_parentBookingId_fkey" FOREIGN KEY ("parentBookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancelReason", "cancelledAt", "classTypeId", "confirmedAt", "createdAt", "date", "email", "endTime", "id", "isMonthlyPlan", "isParent", "isRecovery", "message", "name", "originalClassDate", "parentBookingId", "phone", "recoveryExpiresAt", "rescheduledCount", "rescheduledFromDate", "startTime", "status", "totalPrice", "updatedAt") SELECT "cancelReason", "cancelledAt", "classTypeId", "confirmedAt", "createdAt", "date", "email", "endTime", "id", "isMonthlyPlan", "isParent", "isRecovery", "message", "name", "originalClassDate", "parentBookingId", "phone", "recoveryExpiresAt", "rescheduledCount", "rescheduledFromDate", "startTime", "status", "totalPrice", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_classId_key" ON "Booking"("classId");
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT,
    "scheduledDate" DATETIME,
    "date" DATETIME,
    "startTime" TEXT,
    "endTime" TEXT,
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
    "deletedAt" DATETIME,
    "completedAt" DATETIME,
    "attendanceMarked" BOOLEAN NOT NULL DEFAULT false,
    "classTypeId" TEXT,
    "bookingId" TEXT,
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
    CONSTRAINT "Class_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Class_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("attendanceMarked", "attendanceStatus", "bookingId", "cancelReason", "cancelledAt", "cancelledWithin48h", "classNumber", "classTypeId", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "date", "duration", "endTime", "expiresAt", "id", "isRecovery", "isTrialClass", "modalidad", "needsRenewalReminder", "originalScheduledDate", "recoveryExpiresAt", "rescheduledFrom", "startTime", "status", "studentId", "totalInPlan", "updatedAt") SELECT "attendanceMarked", "attendanceStatus", "bookingId", "cancelReason", "cancelledAt", "cancelledWithin48h", "classNumber", "classTypeId", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "date", "duration", "endTime", "expiresAt", "id", "isRecovery", "isTrialClass", "modalidad", "needsRenewalReminder", "originalScheduledDate", "recoveryExpiresAt", "rescheduledFrom", "startTime", "status", "studentId", "totalInPlan", "updatedAt" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
