import prisma from "../../service/config/prisma";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Méthode non autorisée" });
  }

  // ✅ Vérifier l'authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ Authentification échouée:", auth.error);
    return res.status(401).json({ 
      success: false, 
      message: "Non authentifié - Veuillez vous connecter" 
    });
  }

  const { id: id_user, profil: userProfil } = auth.user;
  console.log("✅ Utilisateur authentifié - ID:", id_user, "Profil:", userProfil);

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
      console.log(`✅ ${userProfil} a accès à tous les incidents (${incidents.length})`);
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
      console.log(`✅ USER_3 a accès à ses propres incidents (${incidents.length})`);
    } 
    else {
      console.log("❌ Profil non reconnu:", userProfil);
      return res.status(403).json({ 
        success: false, 
        message: "Profil non autorisé" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: incidents,
      userProfil: userProfil,
      total: incidents.length
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des incidents:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    });
  }
}