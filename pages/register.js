import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomUser, setNomUser] = useState("");
  const [profil, setProfil] = useState("USER_3");
  const [loading, setLoading] = useState(false);
  const [userProfil, setUserProfil] = useState(null);
  const router = useRouter();

  const profils = [ 
    { id: "SUP_AD0", label: "SUPER ADMIN" },
    { id: "SUPER_1", label: "SUPERVISEUR PRINCIPAL" },
    { id: "SUPER_2", label: "SUPERVISEUR" },
    { id: "USER_3", label: "USER" },
  ];

  // Vérifier les permissions
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Vous devez être connecté pour accéder à cette page");
      router.push("/login");
      return;
    }

    // Décoder le token pour récupérer le profil
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserProfil(payload.profil);
      
      // Vérifier les permissions
      if (!["SUP_AD0", "SUPER_1"].includes(payload.profil)) {
        alert("❌ Vous n'avez pas la permission d'accéder à cette page");
        router.push("/formulaire");
      }
    } catch (error) {
      console.error("Erreur de décodage du token:", error);
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post("/api/register", {
        email,
        password,
        nom_user: nomUser,
        id_Profil: profil,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Utilisateur créé avec succès !");
      
      // Réinitialiser le formulaire
      setEmail("");
      setPassword("");
      setNomUser("");
      setProfil("USER_3");

    } catch (error) {
      console.error("Erreur :", error);
      
      if (error.response?.status === 403) {
        alert("❌ Vous n'avez pas la permission de créer des utilisateurs");
      } else if (error.response?.status === 409) {
        alert("❌ Cet email est déjà utilisé");
      } else {
        alert(error.response?.data?.message || "Échec de la création");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userProfil) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-500/80">
        <div className="text-white text-xl">Vérification des permissions...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-500/80 relative">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <span className="text-4xl">👤</span>
          <h2 className="text-2xl font-bold mt-2">Créer un utilisateur</h2>
          <p className="text-gray-600 text-sm">
            Réservé aux superviseurs principaux
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={nomUser}
              onChange={(e) => setNomUser(e.target.value)}
              placeholder="Entrez le nom complet"
              required
              className="w-full border rounded p-2 pl-10"
            />
            <FaUser className="absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez l'email"
              required
              className="w-full border rounded p-2 pl-10"
            />
            <FaUser className="absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe"
              required
              minLength={6}
              className="w-full border rounded p-2 pl-10"
            />
            <FaUser className="absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div>
            <label htmlFor="profil" className="block mb-1 font-semibold">
              Profil
            </label>
            <select
              id="profil"
              value={profil}
              onChange={(e) => setProfil(e.target.value)}
              className="w-full border rounded p-2"
            >
              {profils.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-600 hover:text-white transition py-3 disabled:opacity-50"
          >
            {loading ? "Création..." : "CRÉER L'UTILISATEUR"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 text-sm">
          <Link href="/formulaire" className="text-orange-500 underline">
            Retour au formulaire
          </Link>
        </p>
      </div>
    </div>
  );
}