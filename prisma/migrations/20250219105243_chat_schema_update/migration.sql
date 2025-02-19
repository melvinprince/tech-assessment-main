/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StarredPrompts` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `UserChatHistory` table. All the data in the column will be lost.
  - Added the required column `modelUsed` to the `StarredPrompts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `StarredPrompts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelUsed` to the `UserChatHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StarredPrompts_prompt_key";

-- AlterTable
ALTER TABLE "StarredPrompts" DROP COLUMN "createdAt",
ADD COLUMN     "modelUsed" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL,
ADD COLUMN     "starredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserChatHistory" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modelUsed" TEXT NOT NULL,
ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false;
