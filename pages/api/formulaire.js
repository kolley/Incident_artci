import prisma from "../../service/config/prisma";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // ✅ Utiliser le middleware pour vérifier l'authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ Authentification échouée:", auth.error);
    return res.status(401).json({ error: auth.error });
  }

  const { id: id_user, profil: userProfil } = auth.user;
  console.log("✅ Utilisateur authentifié - ID:", id_user, "Profil:", userProfil);

  // ✅ Vérifier que l'utilisateur peut créer des incidents
  const allowedProfils = ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"];
  if (!allowedProfils.includes(userProfil)) {
    console.log("❌ Profil non autorisé:", userProfil);
    return res.status(403).json({ 
      error: "Vous n'avez pas la permission de créer des incidents" 
    });
  }

  try {
    // ✅ Récupération des données du formulaire
    const {
      operateur,
      reference,
      intitule,
      descriptif,
      zone,
      localite,
      communes,
      abonnesimpactes,
      typeIncident,
      noeudsTouches,
      impacts,
      resolution,
      dateNotification,
      dateDebut,
      dateFin,
      observation,
      etat,
    } = req.body;

    // ✅ Validation des champs obligatoires
    if (
      !operateur ||
      !intitule ||
      !descriptif ||
      !zone ||
      !localite ||
      !communes ||
      !abonnesimpactes ||
      !typeIncident ||
      !noeudsTouches ||
      !impacts ||
      !resolution ||
      !dateNotification ||
      !etat
    ) {
      return res.status(400).json({ 
        error: "Certains champs obligatoires ne sont pas remplis." 
      });
    }

    // ✅ Création de l'incident avec l'id de l'utilisateur connecté
    const incident = await prisma.formulaire.create({
      data: {
        operateur,
        reference: reference || null,
        intitule,
        descriptif,
        zone,
        localite,
        communes,
        abonnesimpactes: parseInt(abonnesimpactes),
        typeIncident,
        noeudsTouches: parseInt(noeudsTouches),
        impacts,
        resolution,
        dateNotification: new Date(dateNotification),
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        observation: observation || null,
        etat,
        id_user: id_user, // 👈 ID de l'utilisateur connecté
      },
    });

    console.log("✅ Incident créé avec succès:", incident.id_formulaire, "par", userProfil);

    return res.status(201).json({ 
      message: "Incident enregistré avec succès ✅", 
      incident 
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement:", error);
    return res.status(500).json({ 
      error: "Erreur interne du serveur",
      details: error.message 
    });
  }
}