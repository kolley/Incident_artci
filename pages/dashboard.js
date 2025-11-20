// pages/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    FaFileAlt,
    FaListAlt,
    FaUserPlus,
    FaUsers,
    FaChartBar,
    FaSignOutAlt,
    FaCog,
    FaBell,
    FaBars,
    FaTimes,
    FaTimes as FaClose
} from "react-icons/fa";

export default function Dashboard() {
    const router = useRouter();
    const [userProfil, setUserProfil] = useState(null);
    const [userName, setUserName] = useState("");
    const [activeTab, setActiveTab] = useState("stats");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ✅ Nouveau state pour gérer l'affichage des formulaires
    const [showIncidentForm, setShowIncidentForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);

    const [stats, setStats] = useState({
        totalIncidents: 0,
        incidentsClos: 0,
        incidentsEnCours: 0,
        mesIncidents: 0
    });

    // État du formulaire d'incident
    const [incidentFormData, setIncidentFormData] = useState({
        operateur: "",
        reference: "",
        intitule: "",
        descriptif: "",
        zone: "",
        localite: "",
        communes: "",
        abonnesimpactes: "",
        typeIncident: "",
        noeudsTouches: "",
        impacts: "",
        resolution: "",
        dateDebut: "",
        dateFin: "",
        observation: "",
        etat: "",
    });

    // État du formulaire utilisateur
    const [userFormData, setUserFormData] = useState({
        nom_user: "",
        email: "",
        password: "",
        id_Profil: ""
    });

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await fetch("/api/user/me", {
                    method: "GET",
                    credentials: "include"
                });

                if (!res.ok) {
                    console.log("❌ Utilisateur non authentifié");
                    router.push("/login_register");
                    return;
                }

                const data = await res.json();
                console.log("✅ Utilisateur récupéré:", data.nom, "- Profil:", data.profil);

                setUserProfil(data.profil);
                setUserName(data.nom);
                fetchStats();

            } catch (error) {
                console.error("❌ Erreur verifyUser:", error);
                router.push("/login_register");
            }
        };

        verifyUser();
    }, [router]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/dashboard/stats", {
                method: "GET",
                credentials: "include"
            });

            if (!res.ok) {
                console.error("❌ Erreur stats:", await res.text());
                return;
            }

            const data = await res.json();
            console.log("📊 Stats récupérées:", data);
            setStats(data);

        } catch (error) {
            console.error("❌ Erreur fetchStats:", error);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                console.error("⚠️ Erreur lors de la déconnexion");
            }

            console.log("✅ Déconnexion réussie");
        } catch (error) {
            console.error("❌ Erreur handleLogout:", error);
        } finally {
            router.push("/login_register");
        }
    };

    // ✅ Gestion du formulaire d'incident
    const handleIncidentChange = (e) => {
        setIncidentFormData({
            ...incidentFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleIncidentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/formulaire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(incidentFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la déclaration");
            }

            alert("✅ Incident déclaré avec succès !");

            // Réinitialiser et fermer
            setIncidentFormData({
                operateur: "",
                reference: "",
                intitule: "",
                descriptif: "",
                zone: "",
                localite: "",
                communes: "",
                abonnesimpactes: "",
                typeIncident: "",
                noeudsTouches: "",
                impacts: "",
                resolution: "",
                dateDebut: "",
                dateFin: "",
                observation: "",
                etat: "",
            });
            setShowIncidentForm(false);
            fetchStats(); // Rafraîchir les stats

        } catch (err) {
            console.error("❌ Erreur:", err);
            alert(`Erreur: ${err.message}`);
        }
    };

    // ✅ Gestion du formulaire utilisateur
    const handleUserChange = (e) => {
        setUserFormData({
            ...userFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(userFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la création");
            }

            alert("✅ Utilisateur créé avec succès !");

            // Réinitialiser et fermer
            setUserFormData({
                nom_user: "",
                email: "",
                password: "",
                id_Profil: ""
            });
            setShowUserForm(false);

        } catch (err) {
            console.error("❌ Erreur:", err);
            alert(`Erreur: ${err.message}`);
        }
    };

    const getProfilLabel = (profil) => {
        const labels = {
            "SUP_AD0": "Super Admin",
            "SUPER_1": "Superviseur Principal",
            "SUPER_2": "Superviseur",
            "USER_3": "Utilisateur"
        };
        return labels[profil] || profil;
    };

    const getProfilBadgeColor = (profil) => {
        const colors = {
            "SUP_AD0": "bg-red-100 text-red-800",
            "SUPER_1": "bg-purple-100 text-purple-800",
            "SUPER_2": "bg-blue-100 text-blue-800",
            "USER_3": "bg-green-100 text-green-800"
        };
        return colors[profil] || "bg-gray-100 text-gray-800";
    };

    const getInputClass = (value) => {
        const baseClass = "w-full border-2 p-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2";
        if (value) {
            return `${baseClass} border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200`;
        }
        return `${baseClass} border-gray-300 focus:border-orange-500 focus:ring-orange-200`;
    };

    const menuItems = [
        {
            name: "Tableau de bord",
            icon: FaChartBar,
            path: "stats",
            roles: ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"]
        },
        {
            name: "Déclarer un incident",
            icon: FaFileAlt,
            path: "/formulaire",
            roles: ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"]
        },
        {
            name: "Voir les incidents",
            icon: FaListAlt,
            path: "/enregistrement",
            roles: ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"]
        },
        {
            name: "Créer un utilisateur",
            icon: FaUserPlus,
            path: "/register",
            roles: ["SUP_AD0", "SUPER_1"]
        },
        {
            name: "Gestion des utilisateurs",
            icon: FaUsers,
            path: "users",
            roles: ["SUP_AD0", "SUPER_1"]
        },
        {
            name: "Paramètres",
            icon: FaCog,
            path: "settings",
            roles: ["SUP_AD0", "SUPER_1", "SUPER_2", "USER_3"]
        }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(userProfil)
    );

    if (!userProfil) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-orange-500/80 to-orange-500/80 text-white transition-all duration-300 flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-orange-500">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <img src="/images/ARTCI-2_img.png" alt="Logo" className="h-10 w-auto" />
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-orange-500 rounded-lg transition"
                    >
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>

                <div className="p-4 border-b border-orange-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold">
                            {userName.charAt(0).toUpperCase() || "U"}
                        </div>
                        {sidebarOpen && (
                            <div>
                                <p className="font-semibold">{userName}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${getProfilBadgeColor(userProfil)}`}>
                                    {getProfilLabel(userProfil)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.path || router.pathname === item.path;

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    if (item.path.startsWith('/')) {
                                        router.push(item.path);
                                    } else {
                                        setActiveTab(item.path);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                        ? 'bg-white text-orange-600 shadow-lg'
                                        : 'hover:bg-orange-500'
                                    }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-orange-500">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-500 transition"
                    >
                        <FaSignOutAlt size={20} />
                        {sidebarOpen && <span className="font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-md p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {activeTab === "stats" && "Tableau de bord"}
                                {activeTab === "users" && "Gestion des utilisateurs"}
                                {activeTab === "settings" && "Paramètres"}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Bienvenue, {getProfilLabel(userProfil)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                                <FaBell size={24} className="text-gray-600" />
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {activeTab === "stats" && (
                        <div>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-600 text-sm font-semibold">Total Incidents</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalIncidents}</p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <FaFileAlt size={24} className="text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-600 text-sm font-semibold">Incidents Clos</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.incidentsClos}</p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <FaFileAlt size={24} className="text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-600 text-sm font-semibold">En Cours</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.incidentsEnCours}</p>
                                        </div>
                                        <div className="p-3 bg-red-100 rounded-lg">
                                            <FaFileAlt size={24} className="text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                {userProfil === "USER_3" && (
                                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-600 text-sm font-semibold">Mes Incidents</p>
                                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.mesIncidents}</p>
                                            </div>
                                            <div className="p-3 bg-orange-100 rounded-lg">
                                                <FaFileAlt size={24} className="text-orange-600" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions rapides */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => {
                                            setShowIncidentForm(!showIncidentForm);
                                            setShowUserForm(false); // Fermer l'autre formulaire
                                        }}
                                        className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-xl transition flex items-center gap-3"
                                    >
                                        <FaFileAlt size={24} />
                                        <span className="font-semibold">
                                            {showIncidentForm ? "Masquer le formulaire" : "Déclarer un incident"}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/enregistrement')}
                                        className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-xl transition flex items-center gap-3"
                                    >
                                        <FaListAlt size={24} />
                                        <span className="font-semibold">Voir les incidents</span>
                                    </button>

                                    {["SUP_AD0", "SUPER_1"].includes(userProfil) && (
                                        <button
                                            onClick={() => {
                                                setShowUserForm(!showUserForm);
                                                setShowIncidentForm(false); // Fermer l'autre formulaire
                                            }}
                                            className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-xl transition flex items-center gap-3"
                                        >
                                            <FaUserPlus size={24} />
                                            <span className="font-semibold">
                                                {showUserForm ? "Masquer le formulaire" : "Créer un utilisateur"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

        {/* ✅ FORMULAIRE D'INCIDENT (affiché conditionnellement) */}
                            {showIncidentForm && (
                                <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-2 border-orange-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-orange-600">📋 Déclarer un incident</h2>
                                        <button
                                            onClick={() => setShowIncidentForm(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition"
                                        >
                                            <FaClose size={24} className="text-gray-600" />
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleIncidentSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Opérateur <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="operateur"
                                                value={incidentFormData.operateur}
                                                onChange={handleIncidentChange}
                                                className={getInputClass(incidentFormData.operateur)}
                                                required
                                            >
                                                <option value="">Sélectionner un opérateur</option>
                                                <option value="MOOV">MOOV CI</option>
                                                <option value="MTN">MTN CI</option>
                                                <option value="Orange_CI">ORANGE CI</option>
                                                <option value="VIPNET">VIPNET</option>
                                                <option value="AWALE">AWALE</option>
                                                <option value="GVA">GVA</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Référence Incident <span className="text-red-500">(optionnel)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="reference"
                                                value={incidentFormData.reference}
                                                onChange={handleIncidentChange}
                                                placeholder="Ex: INC-2025-001"
                                                className={getInputClass(incidentFormData.reference)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Intitulé de l'incident <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="intitule"
                                                value={incidentFormData.intitule}
                                                onChange={handleIncidentChange}
                                                placeholder="Résumé court de l'incident"
                                                className={getInputClass(incidentFormData.intitule)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Descriptif <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="descriptif"
                                                value={incidentFormData.descriptif}
                                                onChange={handleIncidentChange}
                                                placeholder="Description détaillée de l'incident..."
                                                className={getInputClass(incidentFormData.descriptif)}
                                                rows="3"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Zone impactée <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zone"
                                                    value={incidentFormData.zone}
                                                    onChange={handleIncidentChange}
                                                    placeholder="Ex: Abidjan Nord"
                                                    className={getInputClass(incidentFormData.zone)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Localité <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="localite"
                                                    value={incidentFormData.localite}
                                                    onChange={handleIncidentChange}
                                                    placeholder="Ex: Cocody"
                                                    className={getInputClass(incidentFormData.localite)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Communes impactées <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="communes"
                                                value={incidentFormData.communes}
                                                onChange={handleIncidentChange}
                                                placeholder="Ex: Yopougon, Abobo, Adjamé"
                                                className={getInputClass(incidentFormData.communes)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Nombre d'abonnés impactés <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="abonnesimpactes"
                                                value={incidentFormData.abonnesimpactes}
                                                onChange={handleIncidentChange}
                                                placeholder="Ex: 15000"
                                                className={getInputClass(incidentFormData.abonnesimpactes)}
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="border-t-2 border-orange-200 pt-4 mt-6">
                                            <h2 className="text-xl font-bold text-orange-600 mb-4">Détails de l'incident</h2>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Type de l'incident <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="typeIncident"
                                                value={incidentFormData.typeIncident}
                                                onChange={handleIncidentChange}
                                                className={getInputClass(incidentFormData.typeIncident)}
                                                required
                                            >
                                                <option value="">Sélectionner un type</option>
                                                <option value="CRITIQUE">CRITIQUE</option>
                                                <option value="MAJEUR">MAJEUR</option>
                                                <option value="MINEUR">MINEUR</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Nombre total de nœuds touchés <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="noeudsTouches"
                                                value={incidentFormData.noeudsTouches}
                                                onChange={handleIncidentChange}
                                                placeholder="0"
                                                className={getInputClass(incidentFormData.noeudsTouches)}
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Impacts <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="impacts"
                                                value={incidentFormData.impacts}
                                                onChange={handleIncidentChange}
                                                placeholder="Ex: Interruption de service, perte de connectivité"
                                                className={getInputClass(incidentFormData.impacts)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Actions de résolution <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="resolution"
                                                value={incidentFormData.resolution}
                                                onChange={handleIncidentChange}
                                                placeholder="Décrivez les actions entreprises..."
                                                className={getInputClass(incidentFormData.resolution)}
                                                rows="3"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                État de l'incident <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="etat"
                                                value={incidentFormData.etat}
                                                onChange={handleIncidentChange}
                                                className={getInputClass(incidentFormData.etat)}
                                                required
                                            >
                                                <option value="">Sélectionner l'état</option>
                                                <option value="Clos">Clos</option>
                                                <option value="Non clos">Non clos</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Début <span className="text-red-500">{incidentFormData.etat === "Clos" && "*"}</span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="dateDebut"
                                                    value={incidentFormData.dateDebut}
                                                    onChange={handleIncidentChange}
                                                    className={getInputClass(incidentFormData.dateDebut)}
                                                    required={incidentFormData.etat === "Clos"}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Fin{" "}
                                                    <span className={incidentFormData.etat === "Clos" ? "text-red-500" : "text-gray-400"}>
                                                        {incidentFormData.etat === "Clos" && "*"}
                                                    </span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="dateFin"
                                                    value={incidentFormData.dateFin}
                                                    onChange={handleIncidentChange}
                                                    className={getInputClass(incidentFormData.dateFin)}
                                                    required={incidentFormData.etat === "Clos"}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Observation <span className="text-gray-400">(optionnel)</span>
                                            </label>
                                            <textarea
                                                name="observation"
                                                value={incidentFormData.observation}
                                                onChange={handleIncidentChange}
                                                placeholder="Remarques additionnelles..."
                                                className={getInputClass(incidentFormData.observation)}
                                                rows="3"
                                            ></textarea>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIncidentFormData({
                                                        operateur: "",
                                                        reference: "",
                                                        intitule: "",
                                                        descriptif: "",
                                                        zone: "",
                                                        localite: "",
                                                        communes: "",
                                                        abonnesimpactes: "",
                                                        typeIncident: "",
                                                        noeudsTouches: "",
                                                        impacts: "",
                                                        resolution: "",
                                                        dateDebut: "",
                                                        dateFin: "",
                                                        observation: "",
                                                        etat: "",
                                                    });
                                                    setShowIncidentForm(false);
                                                }}
                                                className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300 hover:shadow-lg"
                                            >
                                                🔄 Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                                            >
                                                ✅ Soumettre l'incident
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ✅ FORMULAIRE CRÉATION UTILISATEUR (affiché conditionnellement) */}
                            {showUserForm && ["SUP_AD0", "SUPER_1"].includes(userProfil) && (
                                <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-2 border-green-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-green-600">👤 Créer un utilisateur</h2>
                                        <button
                                            onClick={() => setShowUserForm(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition"
                                        >
                                            <FaClose size={24} className="text-gray-600" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUserSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nom complet <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nom_user"
                                                value={userFormData.nom_user}
                                                onChange={handleUserChange}
                                                placeholder="Ex: Jean Dupont"
                                                className={getInputClass(userFormData.nom_user)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userFormData.email}
                                                onChange={handleUserChange}
                                                placeholder="Ex: jean.dupont@artci.ci"
                                                className={getInputClass(userFormData.email)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mot de passe <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={userFormData.password}
                                                onChange={handleUserChange}
                                                placeholder="Minimum 8 caractères"
                                                className={getInputClass(userFormData.password)}
                                                minLength="8"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Profil <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="id_Profil"
                                                value={userFormData.id_Profil}
                                                onChange={handleUserChange}
                                                className={getInputClass(userFormData.id_Profil)}
                                                required
                                            >
                                                <option value="">Sélectionner un profil</option>
                                                {userProfil === "SUP_AD0" && (
                                                    <>
                                                        <option value="SUP_AD0">Super Admin</option>
                                                        <option value="SUPER_1">Superviseur Principal</option>
                                                        <option value="SUPER_2">Superviseur</option>
                                                        <option value="USER_3">Utilisateur</option>
                                                    </>
                                                )}
                                                {userProfil === "SUPER_1" && (
                                                    <>
                                                        <option value="SUPER_2">Superviseur</option>
                                                        <option value="USER_3">Utilisateur</option>
                                                    </>
                                                )}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {userProfil === "SUP_AD0" && "Vous pouvez créer tous les types d'utilisateurs"}
                                                {userProfil === "SUPER_1" && "Vous pouvez créer des Superviseurs et Utilisateurs"}
                                            </p>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowUserForm(false)}
                                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-xl transition font-semibold"
                                            >
                                                ✅ Créer l'utilisateur
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Derniers incidents */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Derniers incidents</h2>
                                <p className="text-gray-600">Contenu à venir...</p>
                            </div>
                        </div>
                    )}

                    {/* Gestion des utilisateurs */}
                    {activeTab === "users" && ["SUP_AD0", "SUPER_1"].includes(userProfil) && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des utilisateurs</h2>
                            <p className="text-gray-600">Fonctionnalité à venir...</p>
                        </div>
                    )}

                    {/* Paramètres */}
                    {activeTab === "settings" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Paramètres</h2>
                            <p className="text-gray-600">Fonctionnalité à venir...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}