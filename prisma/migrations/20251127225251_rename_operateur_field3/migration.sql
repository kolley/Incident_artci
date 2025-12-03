/*
  Warnings:

  - You are about to drop the column `id_incident` on the `Formulaire` table. All the data in the column will be lost.
  - You are about to drop the `TypeIncident` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `typeIncident_abonne` to the `Formulaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeIncident_infrastructure` to the `Formulaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeIncident_zone` to the `Formulaire` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Formulaire" DROP CONSTRAINT "Formulaire_id_incident_fkey";

-- AlterTable
ALTER TABLE "Formulaire" DROP COLUMN "id_incident",
ADD COLUMN     "typeIncident_abonne" TEXT NOT NULL,
ADD COLUMN     "typeIncident_infrastructure" TEXT NOT NULL,
ADD COLUMN     "typeIncident_zone" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."TypeIncident";
