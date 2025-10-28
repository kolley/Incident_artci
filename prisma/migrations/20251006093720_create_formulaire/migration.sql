-- CreateTable
CREATE TABLE "Formulaire" (
    "id" SERIAL NOT NULL,
    "operateur" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "descriptif" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "localite" TEXT NOT NULL,
    "communes" TEXT NOT NULL,
    "typeIncident" TEXT NOT NULL,
    "noeudsTouches" INTEGER NOT NULL,
    "impacts" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "dateNotification" TIMESTAMP(3) NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formulaire_pkey" PRIMARY KEY ("id")
);
