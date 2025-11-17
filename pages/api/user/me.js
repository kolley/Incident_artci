// pages/api/user/me.js
import prisma from "../../../service/config/prisma";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        // ✅ Récupérer le token depuis req.cookies directement
        const token = req.cookies?.token;

        console.log("🔍 [user/me] Token présent:", token ? "✅ OUI" : "❌ NON");

        if (!token) {
            console.log("❌ [user/me] Aucun token trouvé");
            return res.status(401).json({ error: "Non authentifié - Token manquant" });
        }

        if (typeof token !== "string") {
            console.log("❌ [user/me] Token invalide (type):", typeof token);
            return res.status(401).json({ error: "Token invalide (format incorrect)" });
        }

        // 🔐 Décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ CORRECTION : utiliser decoded.id_user (pas decoded.id)
        const id_user = decoded.id_user;

        console.log("✅ [user/me] Token décodé - User ID:", id_user, "Profil:", decoded.id_Profil);

        if (!id_user) {
            return res.status(401).json({ error: "Token invalide - ID manquant" });
        }

        // ✅ Récupérer l'utilisateur avec son profil complet
        const user = await prisma.user.findUnique({
            where: { id_user },
            select: {
                id_user: true,
                nom_user: true,
                email: true,
                id_Profil: true,
                nom_profil: {
                    select: {
                        id_Profil: true,
                        nom_profil: true,
                        description: true
                    }
                }
            }
        });

        if (!user) {
            console.log("❌ [user/me] Utilisateur non trouvé pour ID:", id_user);
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        console.log("✅ [user/me] Utilisateur trouvé:", user.nom_user);

        // ✅ CORRECTION : retourner "id_user" (pas "id")
        return res.status(200).json({
            id_user: user.id_user,    // ✅ Cohérent avec le token
            nom: user.nom_user,
            email: user.email,
            profil: user.id_Profil,
            profilNom: user.nom_profil?.nom_profil || null,
            profilDescription: user.nom_profil?.description || null
        });

    } catch (error) {
        console.error("❌ [user/me] Erreur:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token invalide" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expiré" });
        }

        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}