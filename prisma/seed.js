import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {

    // -------------------------------------------------------
    // SEED : OPERATEURS
    // -------------------------------------------------------
    await prisma.operateur.createMany({
        data: [
            { id_operateur: 1, nom_operateur: 'ORANGE CI', description: "ORANGE CÔTE D'IVOIRE" },
            { id_operateur: 2, nom_operateur: 'MTN CI', description: "MTN CÔTE D'IVOIRE" },
            { id_operateur: 3, nom_operateur: 'MOOV CI', description: "MOOV AFRICA CÔTE D'IVOIRE" },
            { id_operateur: 4, nom_operateur: 'MAIN ONE', description: 'MAIN ONE' },
            { id_operateur: 5, nom_operateur: 'AWALE', description: 'AWALE CORPORATION' },
            { id_operateur: 6, nom_operateur: 'VIPNET', description: "MTN CÔTE D'IVOIRE" },
            { id_operateur: 7, nom_operateur: 'GVA', description: "GROUP VIVENDI AFRICA CÔTE D'IVOIRE" },
            { id_operateur: 8, nom_operateur: 'CI DATA', description: "CÔTE D'IVOIRE DATA" },
            { id_operateur: 9, nom_operateur: 'KONNECT AFRICA CI', description: "KONNECT AFRICA CÔTE D'IVOIRE" },
            { id_operateur: 10, nom_operateur: 'DATACONNECT', description: "DATACONNECT (EX ECOBAND NETWORKS CÔTE D'IVOIRE)" },
            { id_operateur: 11, nom_operateur: 'QUANTIS CI', description: "QUANTIS CÔTE D'IVOIRE" },
            { id_operateur: 12, nom_operateur: 'BAYOBAB CI', description: "BAYOBAB CÔTE D'IVOIRE" },
            { id_operateur: 13, nom_operateur: 'KAYDAN TECH', description: 'KAYDAN TECHNOLOGY' },
            { id_operateur: 15, nom_operateur: 'CI-ENERGIES', description: "CÔTE D'IVOIRE-ENERGIES" },
            { id_operateur: 16, nom_operateur: 'ARTCI', description: "AUTORITE DE REGULATION TELECOMMUNICATION DE CÔTE D'IVOIRE" },
        ],
        skipDuplicates: true,
    })

    // -------------------------------------------------------
    // SEED : PROFILS
    // -------------------------------------------------------
    await prisma.profil.createMany({
        data: [
            {
                id_Profil: 'SUP_AD0',
                nom_profil: 'SUPER ADMIN',
                description: "Le SuperAdmin est l'acteur suprême du système"
            },
            {
                id_Profil: 'SUPER_1',
                nom_profil: 'SUPERVISEUR PRINCIPAL',
                description: "Le Superviseur principal a le droit d'ajout de user et d'extraction de données"
            },
            {
                id_Profil: 'SUPER_2',
                nom_profil: 'SUPERVISEUR',
                description: "Le Superviseur a le droit d'extraction de données"
            },
            {
                id_Profil: 'USER_3',
                nom_profil: 'USER',
                description: "Le User a le droit de déclaration d'incident"
            },
            {
                id_Profil: 'USER_4',
                nom_profil: 'USER_ARTCI',
                description: "Tout agent de l'ARTCI voulant visualiser les incidents"
            },
        ],
        skipDuplicates: true,
    })

    // -------------------------------------------------------
    // SEED : USER ADMIN
    // -------------------------------------------------------
    await prisma.user.create({
        data: {
            email: 'kolleyjunior@gmail.com',
            password: '$2b$10$nOkzdrBTxCjINUmIDeILvO0/qubM7ur3fqchs26fBLBELduB3IqXe',
            id_Profil: 'SUP_AD0',
            nom_user: 'KOLLEY AYO LEON JUNIOR',
            id_operateur: 16 // ARTCI par exemple
        }
    })

}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
