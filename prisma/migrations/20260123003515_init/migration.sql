-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "image" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Santiago',
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "monthlyStudentGoal" INTEGER,
    "breakEvenPoint" REAL,
    "targetMonthlyRevenue" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROSPECT',
    "leadSource" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "preferredDay" TEXT,
    "preferredTime" TEXT,
    "modalidad" TEXT,
    "totalClassesTaken" INTEGER NOT NULL DEFAULT 0,
    "totalMonthsActive" INTEGER NOT NULL DEFAULT 0,
    "lifetimeValue" REAL NOT NULL DEFAULT 0,
    "lastClassDate" DATETIME,
    "acquisitionCost" REAL,
    "reschedulesThisMonth" INTEGER NOT NULL DEFAULT 0,
    "lastRescheduleReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProfile_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Class" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassNote_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Availability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "classesIncluded" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "isTrialPlan" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PricingPlan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "classesUsed" INTEGER NOT NULL DEFAULT 0,
    "classesTotal" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mercadoPagoId" TEXT,
    "paymentLink" TEXT,
    "description" TEXT,
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "forPlan" TEXT,
    "forMonth" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "lastContactDate" DATETIME,
    "convertedToStudentId" TEXT,
    "convertedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL,
    "sentAt" DATETIME,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_teacherId_dayOfWeek_startTime_key" ON "Availability"("teacherId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadoPagoId_key" ON "Payment"("mercadoPagoId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedToStudentId_key" ON "Lead"("convertedToStudentId");
