// pages/enregistrement.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Image from "next/image";

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfil, setUserProfil] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [incidentFormData, setIncidentFormData] = useState({
    typeIncident_infrastructure: "",
    typeIncident_abonne: "",
    typeIncident_zone: "",
  });

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setIncidentFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ État pour le modal d'édition
  const [editingIncident, setEditingIncident] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [filter, setFilter] = useState({
    operateur: "",
    typeIncident: "",
    etat: "",
    searchTerm: "",
    dateDebut: "",
    dateFin: ""
  });

  // ✅ CORRECTION : Utiliser useCallback pour fetchIncidents
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/enregistrement', {
        method: "GET",
        credentials: "include",
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

        // ✅ Récupérer l'ID utilisateur
        const userResponse = await fetch("/api/user/me", {
          method: "GET",
          credentials: "include"
        });
        const userData = await userResponse.json();
        setUserId(userData.id_user);

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
  }, [router]);

  // ✅ CORRECTION : Ajouter fetchIncidents dans les dépendances
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // ✅ Récupération du nom de l'utilisateur connecté
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/me", {
          method: "GET",
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.nom || data.email || "Utilisateur");
          console.log("✅ Nom utilisateur récupéré:", data.nom);
        }
      } catch (error) {
        console.error("❌ Erreur récupération nom utilisateur:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // ✅ Fonction pour ouvrir le modal d'édition
  const openEditModal = (incident) => {
    setEditingIncident(incident);
    setEditFormData({
      operateur: incident.operateur,
      reference: incident.reference || "",
      intitule: incident.intitule,
      descriptif: incident.descriptif,
      zone: incident.zone,
      localite: incident.localite,
      communes: incident.communes,
      abonnesimpactes: incident.abonnesimpactes,
      typeIncident: incident.typeIncident,
      noeudsTouches: incident.noeudsTouches,
      impacts: incident.impacts,
      resolution: incident.resolution,
      dateDebut: incident.dateDebut ? new Date(incident.dateDebut).toISOString().slice(0, 16) : "",
      dateFin: incident.dateFin ? new Date(incident.dateFin).toISOString().slice(0, 16) : "",
      observation: incident.observation || "",
      etat: incident.etat,
    });
  };

  // ✅ Fonction pour fermer le modal
  const closeEditModal = () => {
    setEditingIncident(null);
    setEditFormData({});
  };

  // ✅ Gestion du changement dans le formulaire d'édition
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Fonction pour soumettre la modification
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/incidents/${editingIncident.id_formulaire}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la modification");
      }

      alert("✅ Incident modifié avec succès !");
      closeEditModal();
      fetchIncidents(); // Recharger les incidents

    } catch (err) {
      console.error("❌ Erreur modification:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  // ✅ Fonction pour supprimer un incident (admins uniquement)
  const handleDelete = async (id) => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      alert("✅ Incident supprimé avec succès !");
      fetchIncidents(); // Recharger les incidents

    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  // ✅ Vérifier si l'utilisateur peut modifier cet incident
  const canEdit = (incident) => {
    const isAdmin = ["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil);
    const isOwner = incident.id_user === userId;
    return isAdmin || isOwner;
  };

  // ✅ Vérifier si l'utilisateur peut supprimer (admins uniquement)
  const canDelete = () => {
    return ["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil);
  };

  const exportToExcel = () => {
    try {
      if (!filteredIncidents || filteredIncidents.length === 0) {
        alert("Aucun incident à exporter.");
        return;
      }

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      console.log("✅ Déconnexion réussie");
    } catch (error) {
      console.error("❌ Erreur déconnexion:", error);
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

  const getInputClass = (value) => {
    const baseClass = "w-full border-2 p-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2";
    if (value) {
      return `${baseClass} border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200`;
    }
    return `${baseClass} border-gray-300 focus:border-orange-500 focus:ring-orange-200`;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchOperateur = !filter.operateur || incident.operateur === filter.operateur;
    const matchType = !filter.typeIncident || incident.typeIncident === filter.typeIncident;
    const matchEtat = !filter.etat || incident.etat === filter.etat;
    const matchSearch = !filter.searchTerm ||
      incident.reference?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      incident.intitule?.toLowerCase().includes(filter.searchTerm.toLowerCase());

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

          <div className="flex items-center gap-3">
            <Image
              src="/images/ARTCI-2_img.png"
              alt="Logo"
              width={70}     // largeur réelle (modifiable)
              height={70}    // hauteur réelle (modifiable)
              className="h-10 w-auto"
            />
          </div>

          <div className="flex gap-6 items-center">

            <Link href="/dashboard" className="text-black-500 hover:text-orange-600 font-semibold transition">
              dashboard
            </Link>

            {/*
      <button
        onClick={handleLogout}
        className="text-gray-700 hover:text-orange-600 font-semibold transition"
      >
        Déconnexion
      </button>*/ }

            {/* 🔥 BLOC AJOUTÉ EXACTEMENT COMME DONNÉ */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
              {!loading && (
                <>
                  <span className="text-black-500 font-medium bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    👤 {userName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-lg font-semibold text-black-500 hover:text-orange-600 transition-colors"
                  >
                    Se Déconnecter <span aria-hidden="true">&rarr;</span>
                  </button>
                </>
              )}
            </div>
            {/* 🔥 FIN DU BLOC AJOUTÉ */}

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
              {/*
{["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil) && (
  <button
    onClick={() => router.push("/accuser-reception")}
    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Accuser-Reception
  </button>
)}
*/}

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
          <div className="space-y-10 mb-5" > 
            {filteredIncidents.map((incident) => (
              <Link href={`/incidents/${incident.id_formulaire}`} key={incident.id_formulaire}  asChild>
                <div
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer mb-5"
                >
                  <div className="p-6">
                    {/* En-tête de la carte */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-2xl font-bold text-orange-600">{incident.reference || 'N/A'}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getEtatBadge(incident.etat)}`}>
                            {incident.etat}
                          </span>
                          {incident.accuseEnvoye && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300">
                              ✅ Accusé envoyé
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{incident.intitule}</h3>
                        {["SUP_AD0", "SUPER_1", "SUPER_2"].includes(userProfil) && incident.user && (
                          <p className="text-sm text-gray-600 mt-1">
                            👤 Créé par: <span className="font-semibold">{incident.user.nom_user}</span> ({incident.user.email})
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                          {incident.operateur}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeBadge(incident.typeIncident)}`}>
                          {incident.typeIncident}
                        </span>

                        {/* ✅ Boutons Modifier/Supprimer */}
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                          {canEdit(incident) && (
                            <button
                              onClick={() => openEditModal(incident)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                            >
                              ✏️ Modifier
                            </button>
                          )}
                          {canDelete() && (
                            <button
                              onClick={() => handleDelete(incident.id_formulaire)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
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
              </Link>
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

      {/* ✅ MODAL D'ÉDITION */}
      {editingIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-orange-500 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-600">✏️ Modifier l&apos;incident</h2>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/*<div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opérateur <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="operateur"
                      value={editFormData.operateur}
                      onChange={handleEditChange}
                      className={getInputClass(editFormData.operateur)}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="MOOV">MOOV CI</option>
                      <option value="MTN">MTN CI</option>
                      <option value="Orange_CI">ORANGE CI</option>
                      <option value="VIPNET">VIPNET</option>
                      <option value="AWALE">AWALE</option>
                      <option value="GVA">GVA</option>
                    </select>
                  </div>*/}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={editFormData.reference}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.reference)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Intitulé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="intitule"
                  value={editFormData.intitule}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.intitule)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descriptif <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descriptif"
                  value={editFormData.descriptif}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.descriptif)}
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zone"
                    value={editFormData.zone}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.zone)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Localité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="localite"
                    value={editFormData.localite}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.localite)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Communes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="communes"
                    value={editFormData.communes}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.communes)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Abonnés impactés <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="abonnesimpactes"
                    value={editFormData.abonnesimpactes}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.abonnesimpactes)}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nœuds touchés <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="noeudsTouches"
                    value={editFormData.noeudsTouches}
                    onChange={handleEditChange}
                    className={getInputClass(editFormData.noeudsTouches)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="border-t-2 border-orange-200 pt-4 mt-6">
                <h2 className="text-xl font-bold text-orange-600 mb-4">Détails de l&apos;incident</h2>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Type de l&apos;incident <span className="text-red-500">*</span>
                </label>

                <div className="space-y-4">
                  {/* Type d'incident par infrastructure */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type incident — Infrastructure <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-4">
                      {["I1", "I2", "I3"].map((lvl) => (
                        <label key={lvl} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="typeIncident_infrastructure"
                            value={lvl}
                            checked={incidentFormData.typeIncident_infrastructure === lvl}
                            onChange={handleIncidentChange}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{lvl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type d'incident par abonné */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type incident — Abonné <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-4">
                      {["P1", "P2", "P3"].map((lvl) => (
                        <label key={lvl} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="typeIncident_abonne"
                            value={lvl}
                            checked={incidentFormData.typeIncident_abonne === lvl}
                            onChange={handleIncidentChange}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{lvl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type d'incident par zone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type incident — Zone <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-4">
                      {["Z1", "Z2", "Z3"].map((lvl) => (
                        <label key={lvl} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="typeIncident_zone"
                            value={lvl}
                            checked={incidentFormData.typeIncident_zone === lvl}
                            onChange={handleIncidentChange}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{lvl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Impacts <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="impacts"
                  value={editFormData.impacts}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.impacts)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actions de résolution <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="resolution"
                  value={editFormData.resolution}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.resolution)}
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  État <span className="text-red-500">*</span>
                </label>
                <select
                  name="etat"
                  value={editFormData.etat}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.etat)}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Clos">Clos</option>
                  <option value="Non clos">Non clos</option>
                </select>
              </div>

              {editFormData.etat === "Clos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateDebut"
                      value={editFormData.dateDebut}
                      onChange={handleEditChange}
                      className={getInputClass(editFormData.dateDebut)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateFin"
                      value={editFormData.dateFin}
                      onChange={handleEditChange}
                      className={getInputClass(editFormData.dateFin)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observation
                </label>
                <textarea
                  name="observation"
                  value={editFormData.observation}
                  onChange={handleEditChange}
                  className={getInputClass(editFormData.observation)}
                  rows="2"
                />
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t-2 border-gray-200 -mx-6 px-6 -mb-6 pb-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-xl transition font-semibold"
                >
                  ✅ Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}