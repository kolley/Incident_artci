/*
  Warnings:

  - The primary key for the `Formulaire` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Formulaire` table. All the data in the column will be lost.
  - The primary key for the `Profil` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Profil` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Profil` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilId` on the `User` table. All the data in the column will be lost.
  - Added the required column `id_user` to the `Formulaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_profil` to the `Profil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_user` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_profilId_fkey";

-- AlterTable
ALTER TABLE "Formulaire" DROP CONSTRAINT "Formulaire_pkey",
DROP COLUMN "id",
ADD COLUMN     "id_formulaire" SERIAL NOT NULL,
ADD COLUMN     "id_user" INTEGER NOT NULL,
ADD CONSTRAINT "Formulaire_pkey" PRIMARY KEY ("id_formulaire");

-- AlterTable
ALTER TABLE "Profil" DROP CONSTRAINT "Profil_pkey",
DROP COLUMN "id",
DROP COLUMN "nom",
ADD COLUMN     "id_Profil" SERIAL NOT NULL,
ADD COLUMN     "nom_profil" TEXT NOT NULL,
ADD CONSTRAINT "Profil_pkey" PRIMARY KEY ("id_Profil");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
DROP COLUMN "profilId",
ADD COLUMN     "id_Profil" INTEGER,
ADD COLUMN     "id_user" SERIAL NOT NULL,
ADD COLUMN     "nom_user" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id_user");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_Profil_fkey" FOREIGN KEY ("id_Profil") REFERENCES "Profil"("id_Profil") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulaire" ADD CONSTRAINT "Formulaire_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
