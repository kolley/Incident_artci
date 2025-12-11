// pages/incidents/[id].js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function IncidentDetailsPage() {
    const router = useRouter();
    const { id } = router.query;

    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [emailSending, setEmailSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const [userProfil, setUserProfil] = useState(null);

    /**
     * ------------------------------
     *   Fonction d’envoi d’accusé
     * ------------------------------
     */
    const sendAccuseReception = useCallback(async (incidentId) => {
        try {
            setEmailSending(true);

            const response = await fetch("/api/accuser-reception/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_formulaire: incidentId })
            });

            const data = await response.json();

            if (data.success) {
                if (data.alreadySent) {
                    setEmailStatus({ type: "already", message: "Accusé de réception déjà envoyé" });
                } else {
                    setEmailStatus({ type: "success", message: "Accusé envoyé !" });

                    // 🔁 Recharge l’incident
                    const refresh = await fetch(`/api/incidents/${incidentId}`, {
                        method: "GET",
                        credentials: "include",
                    });
                    const refreshed = await refresh.json();
                    if (refreshed.success) setIncident(refreshed.incident);
                }
            } else {
                setEmailStatus({ type: "error", message: data.message || "Erreur lors de l'envoi" });
            }

        } catch (err) {
            setEmailStatus({ type: "error", message: "Erreur lors de l'envoi de l'accusé" });
        } finally {
            setEmailSending(false);
        }
    }, []);


    /**
     * ------------------------------
     *   Charge profil + incident
     * ------------------------------
     */
    const fetchUserProfileAndIncident = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Récupère le profil utilisateur
            const userResponse = await fetch("/api/user/me", {
                method: "GET",
                credentials: "include",
            });

            let profil = null;
            if (userResponse.ok) {
                const userData = await userResponse.json();
                profil = userData.profil;
                setUserProfil(profil);
            }

            // 2. Récupère l’incident
            const incidentResponse = await fetch(`/api/incidents/${id}`, {
                method: "GET",
                credentials: "include",
            });

            const incidentData = await incidentResponse.json();

            if (!incidentResponse.ok) {
                throw new Error(incidentData.message || "Erreur lors du chargement");
            }

            setIncident(incidentData.incident);

            // 3. Envoi automatique si admin ou superviseur
            const isAdmin = ["SUP_AD0", "SUPER_1", "SUPER_2"].includes(profil);

            if (isAdmin && !incidentData.incident.accuseEnvoye) {
                await sendAccuseReception(id);
            } else if (incidentData.incident.accuseEnvoye) {
                setEmailStatus({ type: "already", message: "Accusé de réception déjà envoyé" });
            }

        } catch (err) {
            console.error("❌ Erreur:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, sendAccuseReception]);

    /**
     * ------------------------------
     *     useEffect propre
     * ------------------------------
     */
    useEffect(() => {
        if (id) fetchUserProfileAndIncident();
    }, [id, fetchUserProfileAndIncident]);


    /**
     * ------------------------------
     *   Utilitaires
     * ------------------------------
     */
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getEtatBadge = (etat) =>
        etat === "Clos"
            ? "bg-green-100 text-green-800 border-green-300"
            : "bg-red-100 text-red-800 border-red-300";

    const getTypeBadge = (type) =>
    ({
        CRITIQUE: "bg-red-100 text-red-800",
        MAJEUR: "bg-yellow-100 text-yellow-800",
        MINEUR: "bg-blue-100 text-blue-800",
    }[type] || "bg-gray-100 text-gray-800");

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Chargement des détails...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/enregistrement">
                        <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                            ← Retour à la liste
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-700">Incident non trouvé</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-orange-500/80">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Image
                        src="/images/ARTCI-2_img.png"
                        alt="Logo"
                        width={70}     // largeur réelle (modifiable)
                        height={70}    // hauteur réelle (modifiable)
                        className="h-10 w-auto"
                    />

                    <div className="flex gap-6 items-center">
                        <Link href="/enregistrement" className="text-gray-700 hover:text-orange-600 font-semibold transition">
                            ← Retour à la liste
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Notification d'envoi d'email */}
                {emailSending && (
                    <div className="bg-blue-100 border-2 border-blue-400 text-blue-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
                        <span>Envoi de l&apos;accusé de réception en cours...</span>
                    </div>
                )}

                {emailStatus && (
                    <div className={`border-2 px-6 py-4 rounded-lg mb-6 ${emailStatus.type === "success" ? "bg-green-100 border-green-400 text-green-800" :
                        emailStatus.type === "already" ? "bg-blue-100 border-blue-400 text-blue-800" :
                            "bg-red-100 border-red-400 text-red-800"
                        }`}>
                        {emailStatus.message}
                    </div>
                )}

                {/* En-tête de l'incident */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className="text-3xl font-bold text-orange-600">{incident.reference || 'N/A'}</span>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getEtatBadge(incident.etat)}`}>
                                    {incident.etat}
                                </span>
                                {incident.accuseEnvoye && (
                                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border-2 border-green-300">
                                        ✅ Accusé envoyé
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{incident.intitule}</h1>
                            {incident.user && (
                                <p className="text-gray-600">
                                    👤 Créé par: <span className="font-semibold">{incident.user.nom_user}</span> ({incident.user.email})
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-center font-semibold">
                                {incident.operateur?.nom_operateur || incident.operateur}
                            </span>
                            <span className={`px-4 py-2 rounded-lg text-center font-semibold ${getTypeBadge(incident.typeIncident_infrastructure)}`}>
                                {incident.typeIncident_infrastructure}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">📝 Description</h2>
                        <p className="text-gray-700 leading-relaxed">{incident.descriptif}</p>
                    </div>

                    {/* Localisation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 font-semibold mb-1">📍 Zone</p>
                            <p className="text-lg text-blue-900 font-bold">{incident.zone}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-700 font-semibold mb-1">🏘️ Localité</p>
                            <p className="text-lg text-purple-900 font-bold">{incident.localite}</p>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-lg">
                            <p className="text-sm text-pink-700 font-semibold mb-1">🏙️ Communes</p>
                            <p className="text-lg text-pink-900 font-bold">{incident.communes}</p>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <p className="text-sm text-orange-700 font-semibold mb-1">👥 Abonnés impactés</p>
                            <p className="text-3xl text-orange-900 font-bold">{parseInt(incident.abonnesimpactes || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                            <p className="text-sm text-indigo-700 font-semibold mb-1">🔌 Nœuds touchés</p>
                            <p className="text-3xl text-indigo-900 font-bold">{incident.noeudsTouches}</p>
                        </div>
                    </div>

                    {/* Impacts et Résolution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                            <h3 className="text-lg font-bold text-red-900 mb-3">💥 Impacts</h3>
                            <p className="text-gray-700">{incident.impacts}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                            <h3 className="text-lg font-bold text-green-900 mb-3">🔧 Actions de résolution</h3>
                            <p className="text-gray-700">{incident.resolution}</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 font-semibold mb-1">📅 Date notification</p>
                            <p className="text-gray-800 font-bold">{formatDate(incident.dateNotification)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 font-semibold mb-1">⏱️ Date début</p>
                            <p className="text-gray-800 font-bold">{formatDate(incident.dateDebut)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 font-semibold mb-1">⏱️ Date fin</p>
                            <p className="text-gray-800 font-bold">{formatDate(incident.dateFin)}</p>
                        </div>
                    </div>

                    {/* Observation */}
                    {incident.observation && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
                            <h3 className="text-lg font-bold text-yellow-900 mb-3">📝 Observation</h3>
                            <p className="text-gray-700">{incident.observation}</p>
                        </div>
                    )}

                    {/* Footer dates */}
                    <div className="pt-6 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                        <p>📅 Créé le {formatDate(incident.createdAt)}</p>
                        <p>🔄 Modifié le {formatDate(incident.updatedAt)}</p>
                    </div>
                </div>

                {/* Bouton retour */}
                <div className="text-center">
                    <Link href="/enregistrement">
                        <button className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg">
                            ← Retour à la liste des incidents
                        </button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white mt-12 py-6 border-t-2 border-orange-200">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    © 2025 ARTCI - Tous droits réservés
                </div>
            </footer>
        </div>
    );
}