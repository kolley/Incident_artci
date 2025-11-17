// pages/api/formulaire.js
import prisma from "../../service/config/prisma";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // ✅ Utiliser le middleware pour vérifier l'authentification
  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ [formulaire] Authentification échouée:", auth.error);
    return res.status(401).json({ error: auth.error });
  }

  // ✅ CORRECTION : utiliser id_user et id_Profil (pas "id" et "profil")
  const { id_user, id_Profil } = auth.user;
  
  console.log("✅ [formulaire] Utilisateur authentifié - ID:", id_user, "Profil:", id_Profil);

  // ✅ Vérifier que l'utilisateur peut créer des incidents
  const allowedProfils = ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"];
  if (!allowedProfils.includes(id_Profil)) {
    console.log("❌ [formulaire] Profil non autorisé:", id_Profil);
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
      dateDebut,
      dateFin,
      observation,
      etat,
    } = req.body;

    // ✅ Validation des champs obligatoires
    // ⚠️ CORRECTION : dateNotification RETIRÉ (sera généré automatiquement)
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
      !etat
    ) {
      console.log("❌ [formulaire] Champs manquants");
      return res.status(400).json({ 
        error: "Certains champs obligatoires ne sont pas remplis." 
      });
    }

    // ✅ Validation supplémentaire pour l'état "Clos"
    if (etat === "Clos" && (!dateDebut || !dateFin)) {
      console.log("❌ [formulaire] Dates manquantes pour incident clos");
      return res.status(400).json({
        error: "Les dates de début et de fin sont obligatoires pour un incident clos.",
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
        dateNotification: new Date(),  // ✅ CORRECTION : Généré automatiquement par le système
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        observation: observation || null,
        etat,
        id_user: id_user, // 👈 ID de l'utilisateur connecté
      },
    });

    console.log("✅ [formulaire] Incident créé:", incident.id_formulaire, "par User ID:", id_user);

    return res.status(201).json({ 
      message: "Incident enregistré avec succès ✅", 
      incident 
    });

  } catch (error) {
    console.error("❌ [formulaire] Erreur lors de l'enregistrement:", error);
    return res.status(500).json({ 
      error: "Erreur interne du serveur",
      details: error.message 
    });
  }
}