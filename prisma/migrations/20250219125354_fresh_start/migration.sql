/*
  Warnings:

  - You are about to drop the column `modelUsed` on the `StarredPrompts` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `StarredPrompts` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `StarredPrompts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userChatHistoryId]` on the table `StarredPrompts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userChatHistoryId` to the `StarredPrompts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StarredPrompts" DROP COLUMN "modelUsed",
DROP COLUMN "prompt",
DROP COLUMN "response",
ADD COLUMN     "userChatHistoryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StarredPrompts_userChatHistoryId_key" ON "StarredPrompts"("userChatHistoryId");

-- AddForeignKey
ALTER TABLE "StarredPrompts" ADD CONSTRAINT "StarredPrompts_userChatHistoryId_fkey" FOREIGN KEY ("userChatHistoryId") REFERENCES "UserChatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
