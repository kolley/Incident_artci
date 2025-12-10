import { useState } from "react";
import { useRouter } from "next/router";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📧 Email envoyé :", email);
    console.log("🔑 Tentative de connexion...");

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour les cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // ❌ Gestion des erreurs
      if (!response.ok) {
        console.error("❌ Erreur de connexion:", data);

        // ✅ Afficher le message d'erreur
        alert("❌ " + (data.message || "Échec de la connexion"));

        // ✅ Redirection après l'erreur (avec délai pour lire le message)
        if (data.redirect) {
          setTimeout(() => {
            router.push(data.redirect);
          }, 2000);
        } else {
          // Redirection par défaut vers la même page pour réessayer
          setTimeout(() => {
            router.push("/login_register");
          }, 2000);
        }
        return; // Important: arrêter ici
      }

      // ✅ Connexion réussie
      console.log("✅ Connexion réussie - Données:", data);

      // ✅ Afficher le message de succès
      alert("✅ " + (data.message || "Connexion réussie !"));

      // ✅ Redirection vers le dashboard
      if (data.redirect) {
        setTimeout(() => {
          router.push(data.redirect);
        }, 1000);
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      console.error("❌ Exception lors de la connexion:", error);

      // ✅ Afficher le message d'erreur
      alert("❌ Erreur: " + (error.message || "Une erreur est survenue"));

      // ✅ Redirection vers une page d'erreur en cas d'exception
      setTimeout(() => {
        router.push("/error");
      }, 2000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-500/80 relative">
      {/* Images de fond */}
      <img
        src="/images/image-fond.jpg"
        alt="Image de fond ARTCI"
        className="absolute inset-0 w-full h-screen object-cover opacity-10 mix-blend-multiply z-0"
      />
      <img
        src="/images/17930.jpg"
        alt="Image de fond 2 ARTCI"
        className="absolute inset-0 w-full h-screen object-cover opacity-50 mix-blend-multiply z-0"
      />

      {/* Formulaire de connexion */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <span className="text-4xl">🔒</span>
          <h2 className="text-2xl font-bold mt-2">Connexion</h2>
          <p className="text-gray-600 text-sm">
            Accédez au système de déclaration d'incident
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Champ Email */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
              className={`w-full border rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            <FaUser className="absolute top-3.5 left-3 text-gray-400" />
          </div>

          {/* Champ Mot de passe */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              disabled={loading}
              className={`w-full border rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            <FaEye className="absolute top-3.5 left-3 text-gray-400" />
            
            {/* Bouton pour afficher/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className={`font-semibold rounded-full shadow-md py-3 transition-all ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-orange-600 hover:bg-orange-600 hover:text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              "SE CONNECTER"
            )}
          </button>
        </form>

        {/* Lien de retour */}
        <p className="text-center mt-4 text-gray-600 text-sm">
          <Link 
            href="/" 
            className={`text-orange-500 underline hover:text-orange-600 transition ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}