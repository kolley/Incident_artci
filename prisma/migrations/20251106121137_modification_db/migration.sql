/*
  Warnings:

  - The primary key for the `Profil` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_id_Profil_fkey";

-- AlterTable
ALTER TABLE "Profil" DROP CONSTRAINT "Profil_pkey",
ALTER COLUMN "id_Profil" SET DATA TYPE TEXT,
ADD CONSTRAINT "Profil_pkey" PRIMARY KEY ("id_Profil");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id_Profil" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_Profil_fkey" FOREIGN KEY ("id_Profil") REFERENCES "Profil"("id_Profil") ON DELETE SET NULL ON UPDATE CASCADE;
