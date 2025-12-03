/*
  Warnings:

  - You are about to drop the column `operateur` on the `Formulaire` table. All the data in the column will be lost.
  - You are about to drop the column `typeIncident` on the `Formulaire` table. All the data in the column will be lost.
  - Added the required column `id_incident` to the `Formulaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_operateur` to the `Formulaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Formulaire" DROP COLUMN "operateur",
DROP COLUMN "typeIncident",
ADD COLUMN     "id_incident" INTEGER NOT NULL,
ADD COLUMN     "id_operateur" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "id_operateur" INTEGER;

-- CreateTable
CREATE TABLE "Operateur" (
    "id_operateur" SERIAL NOT NULL,
    "nom_operateur" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operateur_pkey" PRIMARY KEY ("id_operateur")
);

-- CreateTable
CREATE TABLE "TypeIncident" (
    "id_incident" SERIAL NOT NULL,
    "incident" TEXT NOT NULL,
    "detail_incident" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeIncident_pkey" PRIMARY KEY ("id_incident")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operateur_nom_operateur_key" ON "Operateur"("nom_operateur");

-- CreateIndex
CREATE UNIQUE INDEX "TypeIncident_incident_key" ON "TypeIncident"("incident");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_operateur_fkey" FOREIGN KEY ("id_operateur") REFERENCES "Operateur"("id_operateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulaire" ADD CONSTRAINT "Formulaire_id_operateur_fkey" FOREIGN KEY ("id_operateur") REFERENCES "Operateur"("id_operateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulaire" ADD CONSTRAINT "Formulaire_id_incident_fkey" FOREIGN KEY ("id_incident") REFERENCES "TypeIncident"("id_incident") ON DELETE RESTRICT ON UPDATE CASCADE;
