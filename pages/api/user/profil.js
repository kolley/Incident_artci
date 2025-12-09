// pages/api/user/profil.js
import prisma from "../../../service/config/prisma";

export default async function handler(req, res) {
    // Vérification de la méthode
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        // Récupérer tous les profils
        const profils = await prisma.profil.findMany({
            select: {
                id_Profil: true,
                nom_profil: true,
                description: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                nom_profil: "asc"
            }
        });

        console.log(`✅ [profil] ${profils.length} profil(s) récupéré(s)`);

        return res.status(200).json(profils);

    } catch (error) {
        console.error("❌ [profil] Erreur :", error);

        return res.status(500).json({
            error: "Erreur serveur",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}
