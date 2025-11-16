import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaUser, FaEye } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", { email, password });
      
      // Sauvegarder le token
      localStorage.setItem("token", response.data.token);
      
      console.log("✅ Connexion réussie - Profil:", response.data.profil);
      
      // Redirection
      router.push("/dashboard"); // au lieu de "/formulaire"
      
    } catch (error) {
      console.error("Erreur :", error);
      alert(error.response?.data?.message || "Échec de la connexion");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-500/80 relative">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <span className="text-4xl">🔒</span>
          <h2 className="text-2xl font-bold mt-2">Connexion</h2>
          <p className="text-gray-600 text-sm">
            Accédez au système de déclaration d'incident
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
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
              placeholder="Entrez votre mot de passe"
              required
              className="w-full border rounded p-2 pl-10"
            />
            <FaEye className="absolute top-2.5 left-3 text-gray-400" />
          </div>

          <button className="bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-600 hover:text-white transition py-3">
            SE CONNECTER
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 text-sm">
          <Link href="/" className="text-orange-500 underline">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}