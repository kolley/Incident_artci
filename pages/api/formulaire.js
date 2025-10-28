// Import Prisma Client configuré
import prisma from "../../service/config/prisma";

// Export de la fonction handler qui va gérer les requêtes HTTP
export default async function handler(req, res) {
  // On ne traite que les requêtes POST (soumission du formulaire)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Récupération des données envoyées par le formulaire
  const {
    operateur,
    reference,
    intitule,
    descriptif,
    zone,
    localite,
    communes,
    typeIncident,
    noeudsTouches,
    impacts,
    resolution,
    dateNotification,
    dateDebut,
    dateFin,
    observation,
  } = req.body;

  // Validation basique : vérifier que les champs obligatoires ne sont pas vides
  if (
    !operateur ||
    !reference ||
    !intitule ||
    !descriptif ||
    !zone ||
    !localite ||
    !communes ||
    !typeIncident ||
    !noeudsTouches ||
    !impacts ||
    !resolution ||
    !dateNotification ||
    !dateDebut ||
    !dateFin
  ) {
    return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  try {
    // Enregistrement dans la base de données via Prisma
    const incident = await prisma.formulaire.create({
      data: {
        operateur,
        reference,
        intitule,
        descriptif,
        zone,
        localite,
        communes,
        typeIncident,
        noeudsTouches: parseInt(noeudsTouches), // conversion si besoin
        impacts,
        resolution,
        dateNotification: new Date(dateNotification),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        observation,
      },
    });

    // Réponse positive en JSON
    return res.status(201).json({ message: "Incident enregistré avec succès ✅", incident });
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de l'enregistrement de l'incident :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
