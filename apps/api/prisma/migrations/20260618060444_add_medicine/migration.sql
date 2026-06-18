-- CreateTable
CREATE TABLE "MedicineCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "slots" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicineDoseLog" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineDoseLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicineCard_userId_idx" ON "MedicineCard"("userId");

-- CreateIndex
CREATE INDEX "Medicine_cardId_idx" ON "Medicine"("cardId");

-- CreateIndex
CREATE INDEX "MedicineDoseLog_medicineId_date_idx" ON "MedicineDoseLog"("medicineId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineDoseLog_medicineId_date_slot_key" ON "MedicineDoseLog"("medicineId", "date", "slot");

-- AddForeignKey
ALTER TABLE "MedicineCard" ADD CONSTRAINT "MedicineCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MedicineCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineDoseLog" ADD CONSTRAINT "MedicineDoseLog_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
