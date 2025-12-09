/*
  Warnings:

  - Made the column `reference` on table `Formulaire` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Formulaire" ALTER COLUMN "reference" SET NOT NULL;
