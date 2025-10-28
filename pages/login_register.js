import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { FaUser, FaEye } from "react-icons/fa"; // icônes similaires

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await axios.post("/api/login", { email, password });
        localStorage.setItem("token", response.data.token);
        router.push("/formulaire");
      } else {
        await axios.post("/api/register", { email, password });
        alert("Inscription réussie, veuillez vous connecter !");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Échec, veuillez réessayer.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-500/80 relative">
      {/* Image de fond pleine page */}
      <img
        src="/images/image-fond.jpg"
        alt="Image de fond ARTCI"
        className="absolute inset-0 w-full h-screen object-cover opacity-10 mix-blend-multiply z-0"
      />
      
      {/* Dégradé décoratif */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
        ></div>
      </div>

      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="bg-white-800 flex items-center justify-between p-6 lg:px-8">
          <div className="bg-white-800 flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Accueil</span>
              <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="w-24 h-30 mb-8 object-contain" />
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
                            <a href="#" className="text-lg font-semibold text-white">Accueil</a>
                            <a href="#" className="text-lg font-semibold text-white">A propos</a>
                            <a href="#" className="text-lg font-semibold text-white">Arreté d'incident</a>
           </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href="/login_register" className="text-sm/6 font-semibold text-white">
              Se Connecter <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <span className="text-4xl">🔒</span>
          <h2 className="text-2xl font-bold mt-2">
            {isLogin ? "Connexion" : "Inscription"}
          </h2>
          <p className="text-gray-600 text-sm">
            {isLogin
              ? "Accédez au système de déclaration d'incident"
              : "Créez votre compte pour accéder au système"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
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
            {isLogin ? "SE CONNECTER" : "S'INSCRIRE"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 text-sm">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <button
                className="text-orange-500 underline"
                onClick={() => setIsLogin(false)}
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                className="text-orange-500 underline"
                onClick={() => setIsLogin(true)}
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}