// pages/api/dashboard/stats.js
import prisma from "../../../service/config/prisma";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const token = req.cookies?.token;

    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Token invalide ou manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_user = decoded.id_user;
    const id_Profil = decoded.id_Profil;

    if (!id_user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    let stats = {};

    // 🔥 CAS 1 : ADMIN, SUPERVISEUR, USER_ARTCI → VOIT TOUT
    if (id_Profil !== "USER_3") {
      stats.totalIncidents = await prisma.formulaire.count();

      stats.incidentsClos = await prisma.formulaire.count({
        where: { etat: "Clos" }
      });

      stats.incidentsEnCours = await prisma.formulaire.count({
        where: { etat: "Non clos" }
      });
    }

    // 🔥 CAS 2 : USER_3 → VOIT UNIQUEMENT SES INCIDENTS
    if (id_Profil === "USER_3") {
      stats.totalIncidents = await prisma.formulaire.count({
        where: { id_user }
      });

      stats.incidentsClos = await prisma.formulaire.count({
        where: { id_user, etat: "Clos" }
      });

      stats.incidentsEnCours = await prisma.formulaire.count({
        where: { id_user, etat: "Non clos" }
      });
    }

    return res.status(200).json(stats);
        
  } catch (error) {
    console.error("❌ [stats] Erreur:", error.message);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
}
