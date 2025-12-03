// pages/api/formulaire.js - VERSION COMPLÈTE
import prisma from "../../service/config/prisma";
import { verifyToken } from "../../service/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const auth = verifyToken(req);
  
  if (!auth.success) {
    console.log("❌ [formulaire] Authentification échouée:", auth.error);
    return res.status(401).json({ error: auth.error });
  }

  const { id_user, id_Profil } = auth.user;
  
  console.log("✅ [formulaire] Utilisateur authentifié - ID:", id_user, "Profil:", id_Profil);

  const allowedProfils = ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"];
  if (!allowedProfils.includes(id_Profil)) {
    console.log("❌ [formulaire] Profil non autorisé:", id_Profil);
    return res.status(403).json({ 
      error: "Vous n'avez pas la permission de créer des incidents" 
    });
  }

  try {
    // ✅ Récupérer l'opérateur de l'utilisateur depuis la BDD
    const user = await prisma.user.findUnique({
      where: { id_user },
      select: { id_operateur: true }
    });

    if (!user || !user.id_operateur) {
      return res.status(400).json({ 
        error: "Votre compte n'est pas associé à un opérateur. Contactez l'administrateur." 
      });
    }

    const {
      typeIncident_infrastructure,
      typeIncident_zone,
      typeIncident_abonne,
      reference,
      intitule,
      descriptif,
      zone,
      localite,
      communes,
      abonnesimpactes,
      noeudsTouches,
      impacts,
      resolution,
      dateDebut,
      dateFin,
      observation,
      etat,
    } = req.body;

    // Validation des champs obligatoires
    if (
      !typeIncident_infrastructure ||
      !typeIncident_zone ||
      !typeIncident_abonne ||
      !intitule ||
      !descriptif ||
      !zone ||
      !localite ||
      !communes ||
      !abonnesimpactes ||
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

    if (etat === "Clos" && (!dateDebut || !dateFin)) {
      console.log("❌ [formulaire] Dates manquantes pour incident clos");
      return res.status(400).json({
        error: "Les dates de début et de fin sont obligatoires pour un incident clos.",
      });
    }

    // ✅ Création de l'incident avec l'opérateur de l'utilisateur
    const incident = await prisma.formulaire.create({
      data: {
        id_user,
        id_operateur: user.id_operateur,  // ✅ Opérateur automatique
        typeIncident_infrastructure,
        typeIncident_zone,
        typeIncident_abonne,
        reference: reference || null,
        intitule,
        descriptif,
        zone,
        localite,
        communes,
        abonnesimpactes: parseInt(abonnesimpactes),
        noeudsTouches: parseInt(noeudsTouches),
        impacts,
        resolution,
        dateNotification: new Date(),
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        observation: observation || null,
        etat,
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