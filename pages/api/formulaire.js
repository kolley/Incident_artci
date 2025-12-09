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

    // 🔍 Validation champ par champ (permet de renvoyer le champ précis)

    if (!reference || reference.trim() === "") {
      return res.status(400).json({
        error: "Le champ référence est obligatoire.",
        field: "reference"
      });
    }

    if (!typeIncident_infrastructure) {
      return res.status(400).json({
        error: "Veuillez sélectionner le type d'incident infrastructure.",
        field: "typeIncident_infrastructure"
      });
    }

    if (!typeIncident_zone) {
      return res.status(400).json({
        error: "Veuillez sélectionner le type d'incident zone.",
        field: "typeIncident_zone"
      });
    }

    if (!typeIncident_abonne) {
      return res.status(400).json({
        error: "Veuillez sélectionner le type d'incident abonné.",
        field: "typeIncident_abonne"
      });
    }

    if (!intitule) {
      return res.status(400).json({
        error: "Le champ intitulé est obligatoire.",
        field: "intitule"
      });
    }

    if (!descriptif) {
      return res.status(400).json({
        error: "Le champ descriptif est obligatoire.",
        field: "descriptif"
      });
    }

    if (!zone) {
      return res.status(400).json({
        error: "Le champ zone est obligatoire.",
        field: "zone"
      });
    }

    if (!localite) {
      return res.status(400).json({
        error: "Le champ localité est obligatoire.",
        field: "localite"
      });
    }

    if (!communes) {
      return res.status(400).json({
        error: "Le champ communes est obligatoire.",
        field: "communes"
      });
    }

    if (!abonnesimpactes) {
      return res.status(400).json({
        error: "Le nombre d'abonnés impactés est obligatoire.",
        field: "abonnesimpactes"
      });
    }

    if (!noeudsTouches) {
      return res.status(400).json({
        error: "Le nombre de nœuds touchés est obligatoire.",
        field: "noeudsTouches"
      });
    }

    if (!impacts) {
      return res.status(400).json({
        error: "Le champ impacts est obligatoire.",
        field: "impacts"
      });
    }

    if (!resolution) {
      return res.status(400).json({
        error: "Le champ résolution est obligatoire.",
        field: "resolution"
      });
    }

    if (!etat) {
      return res.status(400).json({
        error: "Veuillez choisir un état pour l'incident.",
        field: "etat"
      });
    }

    // 🔍 Cas particulier : incident clos → dates obligatoires
    if (etat === "Clos" && (!dateDebut || !dateFin)) {
      return res.status(400).json({
        error: "Les dates de début et de fin sont obligatoires pour un incident clos.",
        field: !dateDebut ? "dateDebut" : "dateFin"
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
        reference,
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
    
    // ✅ GESTION DE L'ERREUR DE RÉFÉRENCE DUPLIQUÉE
    if (error.code === "P2002" && error.meta?.target?.includes("reference")) {
      return res.status(400).json({ 
        error: "Cette référence existe déjà. Veuillez en choisir une autre.",
        field: "reference"
      });
    }
    
    return res.status(500).json({ 
      error: "Erreur interne du serveur",
      details: error.message 
    });
  }
}