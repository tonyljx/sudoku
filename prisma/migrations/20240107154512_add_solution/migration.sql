/*
  Warnings:

  - Added the required column `solutionBoard` to the `GameState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameState" ADD COLUMN     "solutionBoard" TEXT NOT NULL;
