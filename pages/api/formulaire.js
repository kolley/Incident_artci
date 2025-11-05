// Import du Prisma Client configuré
import prisma from "../../service/config/prisma";

export default async function handler(req, res) {
  // ✅ On accepte uniquement la méthode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

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

  console.log("📩 Données reçues par l’API :", req.body);

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
    !etat // etat obligatoire
  ) {
    return res
      .status(400)
      .json({ error: "Certains champs obligatoires ne sont pas remplis." });
  }

  try {
    // ✅ Création de l’enregistrement dans la base
    const incident = await prisma.formulaire.create({
      data: {
        operateur,
        reference: reference || null, // optionnel
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
        dateNotification: new Date(), // date automatique
        dateDebut: dateDebut ? new Date(dateDebut) : null, // optionnel
        dateFin: dateFin ? new Date(dateFin) : null,       // optionnel
        observation: observation || null,                  // optionnel
        etat, // obligatoire
      },
    });

    // ✅ Réponse en cas de succès
    return res
      .status(201)
      .json({ message: "Incident enregistré avec succès ✅", incident });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'incident :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
