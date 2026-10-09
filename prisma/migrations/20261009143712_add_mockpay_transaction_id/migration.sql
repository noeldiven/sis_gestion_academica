/*
  Warnings:

  - A unique constraint covering the columns `[mockPayTransactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mockPayTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mockPayTransactionId_key" ON "Payment"("mockPayTransactionId");
