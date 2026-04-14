-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "planId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'TRANSFER',
    "mercadoPagoId" TEXT,
    "paymentLink" TEXT,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "receiptUrl" TEXT,
    "forPlan" TEXT,
    "forMonth" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "description", "dueDate", "forMonth", "forPlan", "id", "mercadoPagoId", "paidAt", "paymentLink", "status", "studentId", "updatedAt") SELECT "amount", "createdAt", "currency", "description", "dueDate", "forMonth", "forPlan", "id", "mercadoPagoId", "paidAt", "paymentLink", "status", "studentId", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_mercadoPagoId_key" ON "Payment"("mercadoPagoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
