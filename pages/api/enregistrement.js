// pages/api/enregistrement.js
import prisma from "../../service/config/prisma";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Méthode non autorisée" });
  }

  // ✅ Vérifier l'authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ [enregistrement] Authentification échouée:", auth.error);
    return res.status(401).json({ 
      success: false, 
      message: "Non authentifié - Veuillez vous connecter" 
    });
  }

  // ✅ CORRECTION : utiliser id_user et id_Profil (pas "id" et "profil")
  const { id_user, id_Profil: userProfil } = auth.user;
  
  console.log("✅ [enregistrement] Utilisateur authentifié - ID:", id_user, "Profil:", userProfil);

  // ⚠️ Vérification de sécurité
  if (!id_user || !userProfil) {
    console.log("❌ [enregistrement] Token incomplet - id_user:", id_user, "profil:", userProfil);
    return res.status(401).json({ 
      success: false, 
      message: "Token invalide - Informations manquantes" 
    });
  }

  try {
    let incidents;

    // ✅ Les superviseurs et admins voient tous les incidents
    if (["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil)) {
      incidents = await prisma.formulaire.findMany({
        include: {
          user: {
            select: {
              nom_user: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log(`✅ [enregistrement] ${userProfil} a accès à tous les incidents (${incidents.length})`);
    } 
    // ✅ Les USER_3 voient seulement leurs propres incidents
    else if (userProfil === "USER_3") {
      incidents = await prisma.formulaire.findMany({
        where: {
          id_user: id_user,
        },
        include: {
          user: {
            select: {
              nom_user: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log(`✅ [enregistrement] USER_3 a accès à ses propres incidents (${incidents.length})`);
    } 
    else {
      console.log("❌ [enregistrement] Profil non reconnu:", userProfil);
      return res.status(403).json({ 
        success: false, 
        message: `Profil non autorisé: ${userProfil}` 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: incidents,
      userProfil: userProfil,
      total: incidents.length
    });

  } catch (error) {
    console.error("❌ [enregistrement] Erreur lors de la récupération des incidents:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur",
      details: error.message
    });
  }
}