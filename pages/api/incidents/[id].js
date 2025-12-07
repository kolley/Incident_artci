// modification incident API
//pages/api/incidents/[id].js
import prisma from "../../../service/config/prisma";
import { verifyToken } from "../../../service/middleware/auth";

export default async function handler(req, res) {
    const { id } = req.query;

    // ✅ Vérifier l'authentification
    const auth = verifyToken(req);

    if (!auth.success) {
        console.log("❌ [incidents-api] Authentification échouée:", auth.error);
        return res.status(401).json({
            success: false,
            message: "Non authentifié"
        });
    }

    const { id_user, id_Profil: userProfil } = auth.user;

    console.log("✅ [incidents-api] User ID:", id_user, "Profil:", userProfil, "Méthode:", req.method);

    // ✅ MÉTHODE GET : Récupérer un incident
    if (req.method === "GET") {
        try {
            // 1. Récupérer l'incident avec les relations
            const incident = await prisma.formulaire.findUnique({
                where: { id_formulaire: parseInt(id) },
                include: {
                    user: {
                        select: {
                            id_user: true,
                            nom_user: true,
                            email: true
                        }
                    },
                    operateur: {
                        select: {
                            id_operateur: true,
                            nom_operateur: true
                        }
                    }
                }
            });

            if (!incident) {
                return res.status(404).json({
                    success: false,
                    message: "Incident non trouvé"
                });
            }

            // 2. Vérifier les permissions (USER_3 voit uniquement ses incidents)
            if (userProfil === "USER_3" && incident.id_user !== id_user) {
                console.log("❌ [get-incident] Permission refusée");
                return res.status(403).json({
                    success: false,
                    message: "Vous n'avez pas la permission de voir cet incident"
                });
            }

            console.log("✅ [get-incident] Incident récupéré:", id);

            // 3. Retourner l'incident
            return res.status(200).json({
                success: true,
                incident: incident
            });

        } catch (error) {
            console.error("❌ [get-incident] Erreur:", error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: error.message
            });
        }
    }

    // ✅ MÉTHODE PUT/PATCH : Mise à jour
    else if (req.method === "PUT" || req.method === "PATCH") {
        try {
            // 1. Vérifier que l'incident existe
            const existingIncident = await prisma.formulaire.findUnique({
                where: { id_formulaire: parseInt(id) }
            });

            if (!existingIncident) {
                return res.status(404).json({
                    success: false,
                    message: "Incident non trouvé"
                });
            }

            // 2. Vérifier les permissions
            const isAdmin = ["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil);
            const isOwner = existingIncident.id_user === id_user;

            if (!isAdmin && !isOwner) {
                console.log("❌ [update-incident] Permission refusée");
                return res.status(403).json({
                    success: false,
                    message: "Vous n'avez pas la permission de modifier cet incident"
                });
            }

            // 3. Récupérer les données à mettre à jour
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

            // 4. Mettre à jour l'incident
            const updatedIncident = await prisma.formulaire.update({
                where: { id_formulaire: parseInt(id) },
                data: {
                    operateur: operateur || existingIncident.operateur,
                    reference: reference !== undefined ? reference : existingIncident.reference,
                    intitule: intitule || existingIncident.intitule,
                    descriptif: descriptif || existingIncident.descriptif,
                    zone: zone || existingIncident.zone,
                    localite: localite || existingIncident.localite,
                    communes: communes || existingIncident.communes,
                    abonnesimpactes: abonnesimpactes ? parseInt(abonnesimpactes) : existingIncident.abonnesimpactes,
                    typeIncident: typeIncident || existingIncident.typeIncident,
                    noeudsTouches: noeudsTouches ? parseInt(noeudsTouches) : existingIncident.noeudsTouches,
                    impacts: impacts || existingIncident.impacts,
                    resolution: resolution || existingIncident.resolution,
                    dateDebut: dateDebut ? new Date(dateDebut) : existingIncident.dateDebut,
                    dateFin: dateFin ? new Date(dateFin) : existingIncident.dateFin,
                    observation: observation !== undefined ? observation : existingIncident.observation,
                    etat: etat || existingIncident.etat,
                }
            });

            console.log("✅ [update-incident] Incident mis à jour:", id);

            return res.status(200).json({
                success: true,
                message: "Incident mis à jour avec succès",
                data: updatedIncident
            });

        } catch (error) {
            console.error("❌ [update-incident] Erreur:", error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour",
                details: error.message
            });
        }
    }

    // ✅ MÉTHODE DELETE : Suppression
    else if (req.method === "DELETE") {
        try {
            // 1. Vérifier que l'incident existe
            const existingIncident = await prisma.formulaire.findUnique({
                where: { id_formulaire: parseInt(id) }
            });

            if (!existingIncident) {
                return res.status(404).json({
                    success: false,
                    message: "Incident non trouvé"
                });
            }

            // 2. Vérifier les permissions (seulement admins)
            const isAdmin = ["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil);

            if (!isAdmin) {
                console.log("❌ [delete-incident] Permission refusée");
                return res.status(403).json({
                    success: false,
                    message: "Seuls les administrateurs peuvent supprimer des incidents"
                });
            }

            // 3. Supprimer l'incident
            await prisma.formulaire.delete({
                where: { id_formulaire: parseInt(id) }
            });

            console.log("✅ [delete-incident] Incident supprimé:", id);

            return res.status(200).json({
                success: true,
                message: "Incident supprimé avec succès"
            });

        } catch (error) {
            console.error("❌ [delete-incident] Erreur:", error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression",
                details: error.message
            });
        }
    }

    // ✅ Méthode non autorisée
    else {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée"
        });
    }
}