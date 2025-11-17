// pages/api/auth/logout.js
import { deleteCookie } from "cookies-next";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        // ✅ Suppression du cookie contenant le token
        deleteCookie("token", { req, res });

        console.log("✅ [logout] Cookie supprimé avec succès");

        return res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("❌ [logout] Erreur lors de la déconnexion:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}