/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Formulaire` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Formulaire_reference_key" ON "Formulaire"("reference");
