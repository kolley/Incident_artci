// pages/enregistrement.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfil, setUserProfil] = useState(null);
  const [filter, setFilter] = useState({
    operateur: "",
    typeIncident: "",
    etat: "",
    searchTerm: "",
    dateDebut: "",
    dateFin: ""
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
      // ✅ CORRECTION : Utiliser credentials: "include" pour envoyer le cookie
      const response = await fetch('/api/enregistrement', {
        method: "GET",
        credentials: "include",  // ✅ Envoie automatiquement le cookie
      });
      
      const data = await response.json();

      if (response.status === 401) {
        console.log("❌ Session expirée");
        alert("⚠️ Session expirée, veuillez vous reconnecter");
        router.push("/login_register");
        return;
      }

      if (response.status === 403) {
        console.log("❌ Accès refusé:", data.message);
        alert(`⚠️ ${data.message}`);
        return;
      }

      if (data.success) {
        setIncidents(data.data);
        setUserProfil(data.userProfil);
        console.log("✅ Incidents chargés:", data.total, "| Profil:", data.userProfil);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des incidents');
      console.error("❌ Erreur fetchIncidents:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction d'exportation en Excel
  const exportToExcel = () => {
    try {
      if (!filteredIncidents || filteredIncidents.length === 0) {
        alert("Aucun incident à exporter.");
        return;
      }

      // Préparer les données pour l'export
      const dataToExport = filteredIncidents.map(incident => ({
        'Référence': incident.reference || 'N/A',
        'Opérateur': incident.operateur,
        'Intitulé': incident.intitule,
        'Descriptif': incident.descriptif,
        'Zone': incident.zone,
        'Localité': incident.localite,
        'Communes': incident.communes,
        'Abonnés impactés': incident.abonnesimpactes,
        'Type': incident.typeIncident,
        'Nœuds touchés': incident.noeudsTouches,
        'Impacts': incident.impacts,
        'Résolution': incident.resolution,
        'Date notification': new Date(incident.dateNotification).toLocaleString('fr-FR'),
        'Date début': incident.dateDebut ? new Date(incident.dateDebut).toLocaleString('fr-FR') : 'N/A',
        'Date fin': incident.dateFin ? new Date(incident.dateFin).toLocaleString('fr-FR') : 'N/A',
        'État': incident.etat,
        'Observation': incident.observation || 'N/A',
        'Créé par': incident.user?.nom_user || 'N/A',
        'Créé le': new Date(incident.createdAt).toLocaleString('fr-FR')
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");

      // Génération du fichier Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = `incidents_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
      
      alert(`✅ ${filteredIncidents.length} incident(s) exporté(s) avec succès !`);
    } catch (error) {
      console.error("❌ Erreur export Excel :", error);
      alert("Erreur lors de l'exportation du fichier Excel.");
    }
  };

  // ✅ CORRECTION : Fonction de déconnexion avec cookies
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      console.log("✅ Déconnexion réussie");
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
    } finally {
      router.push("/login_register");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEtatBadge = (etat) => {
    if (etat === 'Clos') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getTypeBadge = (type) => {
    const badges = {
      'CRITIQUE': 'bg-red-100 text-red-800',
      'MAJEUR': 'bg-yellow-100 text-yellow-800',
      'MINEUR': 'bg-blue-100 text-blue-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchOperateur = !filter.operateur || incident.operateur === filter.operateur;
    const matchType = !filter.typeIncident || incident.typeIncident === filter.typeIncident;
    const matchEtat = !filter.etat || incident.etat === filter.etat;
    const matchSearch = !filter.searchTerm ||
      incident.reference?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      incident.intitule?.toLowerCase().includes(filter.searchTerm.toLowerCase());

    // Filtre par date
    let matchDate = true;
    if (filter.dateDebut || filter.dateFin) {
      const incidentDate = new Date(incident.dateDebut || incident.dateNotification);

      if (filter.dateDebut) {
        const filterDateDebut = new Date(filter.dateDebut);
        matchDate = matchDate && incidentDate >= filterDateDebut;
      }

      if (filter.dateFin) {
        const filterDateFin = new Date(filter.dateFin);
        filterDateFin.setHours(23, 59, 59, 999);
        matchDate = matchDate && incidentDate <= filterDateFin;
      }
    }

    return matchOperateur && matchType && matchEtat && matchSearch && matchDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-orange-500/80">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="h-16 w-auto object-contain" />
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/formulaire" className="text-gray-700 hover:text-orange-600 font-semibold transition">
              Déclarer un incident
            </Link>
            
            {/* 👇 Lien visible uniquement pour SUPER_1 et SUP_AD0 */}
            {["SUP_AD0", "SUPER_1"].includes(userProfil) && (
              <Link href="/register" className="text-gray-700 hover:text-orange-600 font-semibold transition">
                Créer un utilisateur
              </Link>
            )}
            
            {/* ✅ CORRECTION : Utiliser la fonction handleLogout */}
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-orange-600 font-semibold transition"
            >
              Déconnexion
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Titre et Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📊 {userProfil === "USER_3" ? "Mes Incidents" : "Tous les Incidents"}
              </h1>
              <p className="text-gray-600">
                {userProfil === "USER_3" && <span className="text-orange-600 font-semibold">Vous voyez uniquement vos incidents | </span>}
                Total: <span className="font-bold text-orange-600">{incidents.length}</span> incidents |
                Affichés: <span className="font-bold text-orange-600">{filteredIncidents.length}</span>
              </p>
            </div>

            <div className="ml-auto flex flex-wrap gap-3">
              <button
                onClick={fetchIncidents}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>

              <button
                onClick={exportToExcel}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                📤 Exporter Excel
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recherche</label>
              <input
                type="text"
                placeholder="Référence ou intitulé..."
                value={filter.searchTerm}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Opérateur</label>
              <select
                value={filter.operateur}
                onChange={(e) => setFilter({ ...filter, operateur: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="MOOV">MOOV CI</option>
                <option value="MTN">MTN CI</option>
                <option value="Orange_CI">ORANGE CI</option>
                <option value="VIPNET">VIPNET</option>
                <option value="AWALE">AWALE</option>
                <option value="GVA">GVA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filter.typeIncident}
                onChange={(e) => setFilter({ ...filter, typeIncident: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="CRITIQUE">CRITIQUE</option>
                <option value="MAJEUR">MAJEUR</option>
                <option value="MINEUR">MINEUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">État</label>
              <select
                value={filter.etat}
                onChange={(e) => setFilter({ ...filter, etat: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="Clos">Clos</option>
                <option value="Non clos">Non clos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date début</label>
              <input
                type="date"
                value={filter.dateDebut}
                onChange={(e) => setFilter({ ...filter, dateDebut: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date fin</label>
              <input
                type="date"
                value={filter.dateFin}
                onChange={(e) => setFilter({ ...filter, dateFin: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
          {(filter.operateur || filter.typeIncident || filter.etat || filter.searchTerm || filter.dateDebut || filter.dateFin) && (
            <button
              onClick={() => setFilter({ operateur: "", typeIncident: "", etat: "", searchTerm: "", dateDebut: "", dateFin: "" })}
              className="mt-4 text-orange-600 hover:text-orange-700 font-semibold text-sm"
            >
              ✕ Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
            ⚠️ {error}
          </div>
        )}

        {/* Liste des incidents */}
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-xl text-gray-500">Aucun incident trouvé</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIncidents.map((incident) => (
              <div
                key={incident.id_formulaire}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* En-tête de la carte */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-orange-600">{incident.reference || 'N/A'}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getEtatBadge(incident.etat)}`}>
                          {incident.etat}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{incident.intitule}</h3>
                      {/* Afficher le créateur si admin */}
                      {["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil) && incident.user && (
                        <p className="text-sm text-gray-600 mt-1">
                          👤 Créé par: <span className="font-semibold">{incident.user.nom_user}</span> ({incident.user.email})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                        {incident.operateur}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeBadge(incident.typeIncident)}`}>
                        {incident.typeIncident}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{incident.descriptif}</p>

                  {/* Informations en grille */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">📍 Zone</p>
                      <p className="text-gray-800">{incident.zone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">🏘️ Localité</p>
                      <p className="text-gray-800">{incident.localite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">🏙️ Communes</p>
                      <p className="text-gray-800">{incident.communes}</p>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 font-semibold">👥 Abonnés impactés</p>
                      <p className="text-2xl font-bold text-blue-900">{parseInt(incident.abonnesimpactes || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-700 font-semibold">🔌 Nœuds touchés</p>
                      <p className="text-2xl font-bold text-purple-900">{incident.noeudsTouches}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700 font-semibold">⏱️ Début</p>
                      <p className="text-sm font-bold text-green-900">{formatDate(incident.dateDebut)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700 font-semibold">⏱️ Fin</p>
                      <p className="text-sm font-bold text-red-900">{formatDate(incident.dateFin)}</p>
                    </div>
                  </div>

                  {/* Impacts et Résolution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="text-sm text-gray-600 font-semibold mb-1">💥 Impacts</p>
                      <p className="text-gray-700 text-sm">{incident.impacts}</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm text-gray-600 font-semibold mb-1">🔧 Résolution</p>
                      <p className="text-gray-700 text-sm">{incident.resolution}</p>
                    </div>
                  </div>

                  {/* Observation */}
                  {incident.observation && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-sm text-gray-600 font-semibold mb-1">📝 Observation</p>
                      <p className="text-gray-700 text-sm">{incident.observation}</p>
                    </div>
                  )}

                  {/* Date de création */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      📅 Créé le {formatDate(incident.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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