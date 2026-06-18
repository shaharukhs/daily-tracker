-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "maxCards" INTEGER;

-- CreateTable
CREATE TABLE "MeditationEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeditationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quality" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood" INTEGER NOT NULL DEFAULT 0,
    "gratitude" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FastingEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "fasted" BOOLEAN NOT NULL DEFAULT false,
    "fastType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FastingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SadaqahEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "given" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SadaqahEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeditationEntry_userId_date_idx" ON "MeditationEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MeditationEntry_userId_date_key" ON "MeditationEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "SleepEntry_userId_date_idx" ON "SleepEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SleepEntry_userId_date_key" ON "SleepEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "MoodEntry_userId_date_idx" ON "MoodEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodEntry_userId_date_key" ON "MoodEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "FastingEntry_userId_date_idx" ON "FastingEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FastingEntry_userId_date_key" ON "FastingEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "SadaqahEntry_userId_date_idx" ON "SadaqahEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SadaqahEntry_userId_date_key" ON "SadaqahEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "MeditationEntry" ADD CONSTRAINT "MeditationEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepEntry" ADD CONSTRAINT "SleepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FastingEntry" ADD CONSTRAINT "FastingEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SadaqahEntry" ADD CONSTRAINT "SadaqahEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
