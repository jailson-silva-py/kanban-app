/*
  Warnings:

  - A unique constraint covering the columns `[isInbox,ownerId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Board_isInbox_ownerId_key" ON "Board"("isInbox", "ownerId");
