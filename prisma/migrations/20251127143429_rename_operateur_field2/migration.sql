-- AlterTable
ALTER TABLE "Operateur" ALTER COLUMN "id_operateur" DROP DEFAULT;
DROP SEQUENCE "Operateur_id_operateur_seq";

-- AlterTable
ALTER TABLE "TypeIncident" ALTER COLUMN "id_incident" DROP DEFAULT;
DROP SEQUENCE "TypeIncident_id_incident_seq";
