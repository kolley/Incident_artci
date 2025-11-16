import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    FaHome,
    FaFileAlt,
    FaListAlt,
    FaUserPlus,
    FaUsers,
    FaChartBar,
    FaSignOutAlt,
    FaCog,
    FaBell,
    FaBars,
    FaTimes
} from "react-icons/fa";

export default function Dashboard() {
    const router = useRouter();
    const [userProfil, setUserProfil] = useState(null);
    const [userName, setUserName] = useState("");
    const [activeTab, setActiveTab] = useState("stats");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalIncidents: 0,
        incidentsClos: 0,
        incidentsEnCours: 0,
        mesIncidents: 0
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserProfil(payload.profil);

            // Récupérer les infos utilisateur depuis le token ou une API
            fetchUserInfo(token);
            fetchStats(token);
        } catch (error) {
            console.error("Erreur:", error);
            router.push("/login");
        }
    }, [router]);

    const fetchUserInfo = async (token) => {
        // Tu peux créer une API pour récupérer les infos complètes de l'utilisateur
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Pour l'instant, on simule avec les données du token
            setUserName("Utilisateur"); // Remplace par les vraies données
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const fetchStats = async (token) => {
        try {
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Erreur chargement stats:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
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

    // Menu items selon le profil
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
                {/* Logo et Toggle */}
                <div className="p-4 flex items-center justify-between border-b border-orange-500">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <img src="/images/ARTCI-2_img.png" alt="Logo" className="h-10 w-auto" />
                            <span className="font-bold text-lg"></span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-orange-500 rounded-lg transition"
                    >
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>

                {/* User Info */}
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

                {/* Menu Items */}
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

                {/* Logout */}
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
                {/* Header */}
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

                {/* Content Area */}
                <div className="p-6">
                    {/* Statistiques */}
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
                                        onClick={() => router.push('/formulaire')}
                                        className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-xl transition flex items-center gap-3"
                                    >
                                        <FaFileAlt size={24} />
                                        <span className="font-semibold">Déclarer un incident</span>
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
                                            onClick={() => router.push('/register')}
                                            className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-xl transition flex items-center gap-3"
                                        >
                                            <FaUserPlus size={24} />
                                            <span className="font-semibold">Créer un utilisateur</span>
                                        </button>
                                    )}
                                </div>
                            </div>

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