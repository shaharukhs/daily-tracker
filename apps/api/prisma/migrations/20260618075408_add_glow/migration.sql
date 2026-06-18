-- CreateTable
CREATE TABLE "GlowProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "routine" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlowProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlowLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlowLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlowProduct_userId_idx" ON "GlowProduct"("userId");

-- CreateIndex
CREATE INDEX "GlowLog_productId_date_idx" ON "GlowLog"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "GlowLog_productId_date_key" ON "GlowLog"("productId", "date");

-- AddForeignKey
ALTER TABLE "GlowProduct" ADD CONSTRAINT "GlowProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlowLog" ADD CONSTRAINT "GlowLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "GlowProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
