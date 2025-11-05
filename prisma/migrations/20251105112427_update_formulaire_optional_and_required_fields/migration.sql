/*
  Warnings:

  - Made the column `etat` on table `Formulaire` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Formulaire" ALTER COLUMN "reference" DROP NOT NULL,
ALTER COLUMN "dateDebut" DROP NOT NULL,
ALTER COLUMN "dateFin" DROP NOT NULL,
ALTER COLUMN "etat" SET NOT NULL;
