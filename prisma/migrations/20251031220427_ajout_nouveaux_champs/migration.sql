/*
  Warnings:

  - Added the required column `abonnesimpacte` to the `Formulaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Formulaire" ADD COLUMN     "abonnesimpacte" INTEGER NOT NULL,
ADD COLUMN     "etat" TEXT;
