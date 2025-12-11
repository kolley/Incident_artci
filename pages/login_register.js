import { useState } from "react";
import { useRouter } from "next/router";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Erreur de connexion:", data);
        alert("❌ " + (data.message || "Échec de la connexion"));

        if (data.redirect) {
          setTimeout(() => {
            router.push(data.redirect);
          }, 2000);
        } else {
          setTimeout(() => {
            router.push("/login_register");
          }, 2000);
        }
        return;
      }

      console.log("✅ Connexion réussie - Données:", data);
      alert("✅ " + (data.message || "Connexion réussie !"));

      // ✅ Redirection immédiate vers le dashboard
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      console.error("❌ Exception lors de la connexion:", error);
      alert("❌ Erreur: " + (error.message || "Une erreur est survenue"));

      setTimeout(() => {
        router.push("/error");
      }, 2000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/image-fond.jpg"
          alt="Image de fond réseau"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Formulaire de connexion */}
      <div className="bg-gray-50 shadow-2xl rounded-3xl p-10 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
              <FaLock className="text-white text-2xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h2>
          <p className="text-gray-600 text-sm">
            Accédez au système de déclaration d&apos;incident
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Champ Email */}
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <FaUser className="text-gray-400 text-lg" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@exemple.com"
              required
              disabled={loading}
              className={`w-full bg-white border-2 border-gray-300 rounded-xl p-4 pl-12 pr-4 text-gray-700 focus:outline-none focus:border-orange-500 transition ${loading ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <FaLock className="text-gray-400 text-lg" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              disabled={loading}
              className={`w-full bg-white border-2 border-gray-300 rounded-xl p-4 pl-12 pr-12 text-gray-700 focus:outline-none focus:border-orange-500 transition ${loading ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
            </button>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className={`font-bold text-lg rounded-xl shadow-md py-4 mt-2 transition-all ${loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-orange-600 hover:bg-orange-600 hover:text-white border-2 border-transparent hover:border-orange-600"
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
        <p className="text-center mt-6 text-gray-600 text-sm">
          <Link
            href="/"
            className={`text-orange-600 underline hover:text-orange-700 transition font-medium ${loading ? "pointer-events-none opacity-50" : ""
              }`}
          >
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}