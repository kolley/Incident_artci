// pages/api/user/operateur.js
import prisma from "../../../service/config/prisma";

export default async function handler(req, res) {
  // ✅ Vérification de la méthode HTTP
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // ✅ Récupération des opérateurs avec tri alphabétique
    const operateurs = await prisma.operateur.findMany({
      select: {
        id_operateur: true,
        nom_operateur: true,
      },
      orderBy: {
        nom_operateur: 'asc'  // ✅ Tri alphabétique (optionnel mais pratique)
      }
    });

    // ✅ Log du nombre d'opérateurs trouvés
    console.log(`✅ [operateur] ${operateurs.length} opérateur(s) récupéré(s)`);

    return res.status(200).json(operateurs);

  } catch (error) {
    console.error("❌ [operateur] Erreur :", error);
    
    // ✅ Log plus détaillé en développement
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ 
        error: "Erreur serveur", 
        details: error.message 
      });
    }
    
    return res.status(500).json({ error: "Erreur serveur" });
  }
}