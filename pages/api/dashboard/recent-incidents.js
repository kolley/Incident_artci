// pages/api/dashboard/recent-incidents.js
import prisma from "../../../service/config/prisma";
import jwt from "jsonwebtoken";
import { getCookie } from "cookies-next";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        // ✅ Récupération du token JWT depuis les cookies
        const token = getCookie("token", { req, res });

        if (!token) {
            return res.status(401).json({ error: "Non authentifié" });
        }

        // ✅ Décodage du token pour récupérer l'ID et le profil de l'utilisateur
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_user = decoded?.id_user;
        const id_Profil = decoded?.id_Profil || decoded?.profil;

        if (!id_user) {
            return res.status(401).json({ error: "Token invalide" });
        }

        // ✅ Récupération des derniers incidents
        let whereClause = {};

        // Si l'utilisateur est USER_3, ne montrer que ses propres incidents
        if (id_Profil === "USER_3") {
            whereClause.id_user = id_user;
        }

        const recentIncidents = await prisma.formulaire.findMany({
            where: whereClause,
            orderBy: {
                dateNotification: 'desc'
            },
            take: 10, // Limiter à 10 incidents
            select: {
                id_formulaire: true,
                operateur: true,
                reference: true,
                intitule: true,
                typeIncident: true,
                etat: true,
                dateNotification: true,
                dateDebut: true,
                dateFin: true,
                zone: true,
                localite: true,
                user: {
                    select: {
                        nom_user: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json(recentIncidents);

    } catch (error) {
        console.error("Erreur lors de la récupération des incidents récents :", error);

        // Gestion spécifique des erreurs JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token invalide" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expiré" });
        }

        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}