// pages/api/dashboard/stats.js
import prisma from "../../../service/config/prisma";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // ✅ Récupération du token depuis req.cookies directement
    const token = req.cookies?.token;

    console.log("🔍 [stats] Token présent:", token ? "✅ OUI" : "❌ NON");

    if (!token) {
      console.log("❌ [stats] Token manquant");
      return res.status(401).json({ error: "Token manquant" });
    }

    if (typeof token !== "string") {
      console.log("❌ [stats] Token invalide (type):", typeof token);
      return res.status(401).json({ error: "Token invalide (format incorrect)" });
    }

    // 🔐 Vérification + décodage
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ CORRECTION : utiliser decoded.id_user (pas decoded.id)
    const id_user = decoded.id_user;
    const id_Profil = decoded.id_Profil;

    console.log("✅ [stats] Token décodé - User ID:", id_user, "Profil:", id_Profil);

    if (!id_user) {
      return res.status(401).json({ error: "Token invalide - ID manquant" });
    }

    // 📊 Total incidents
    const totalIncidents = await prisma.formulaire.count();

    // 📊 Incidents clos
    const incidentsClos = await prisma.formulaire.count({
      where: { etat: "Clos" }
    });

    // 📊 Incidents en cours
    const incidentsEnCours = await prisma.formulaire.count({
      where: { etat: "Non clos" }
    });

    // 📊 Si utilisateur simple → ses incidents uniquement
    let mesIncidents = 0;
    if (id_Profil === "USER_3") {
      mesIncidents = await prisma.formulaire.count({
        where: { id_user }
      });
    }

    console.log("📊 [stats] Statistiques calculées:", {
      totalIncidents,
      incidentsClos,
      incidentsEnCours,
      mesIncidents
    });

    return res.status(200).json({
      totalIncidents,
      incidentsClos,
      incidentsEnCours,
      mesIncidents
    });

  } catch (error) {
    console.error("❌ [stats] Erreur:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalide" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expiré" });
    }

    return res.status(500).json({ 
      error: "Erreur interne du serveur", 
      details: error.message 
    });
  }
}