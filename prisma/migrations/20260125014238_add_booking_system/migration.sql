-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilityException_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "duration" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassType_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
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
    "confirmedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "modalidad" TEXT NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Class_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("attendanceMarked", "cancelReason", "cancelledAt", "classNumber", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "duration", "id", "isTrialClass", "modalidad", "rescheduledFrom", "scheduledDate", "status", "studentId", "totalInPlan", "updatedAt") SELECT "attendanceMarked", "cancelReason", "cancelledAt", "classNumber", "completedAt", "confirmedAt", "confirmedBy", "createdAt", "duration", "id", "isTrialClass", "modalidad", "rescheduledFrom", "scheduledDate", "status", "studentId", "totalInPlan", "updatedAt" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityException_teacherId_date_key" ON "AvailabilityException"("teacherId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_classId_key" ON "Booking"("classId");
