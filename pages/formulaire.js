// pages/formulaire.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function IncidentForm() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
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
    // ✅ SUPPRIMÉ : dateNotification (généré automatiquement par le backend)
    dateDebut: "",
    dateFin: "",
    observation: "",
    etat: "",
  });

  // ✅ Récupération des informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/me", { 
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          console.log("❌ Utilisateur non authentifié");
          router.push("/login_register");
          return;
        }

        const data = await response.json();
        console.log("✅ Utilisateur récupéré:", data.nom);
        
        setUserName(data.nom || data.email || "Utilisateur");
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des infos utilisateur:", error);
        router.push("/login_register");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/formulaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la déclaration");
      }

      console.log("✅ Incident déclaré avec succès");
      alert("Incident déclaré avec succès ✅");
      
      // Réinitialiser le formulaire
      setFormData({
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

    } catch (err) {
      console.error("❌ Erreur:", err);
      
      if (err.message.includes("Token") || err.message.includes("authentifié")) {
        alert("Session expirée. Veuillez vous reconnecter.");
        router.push("/login_register");
      } else {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  // ✅ Fonction de déconnexion
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

  const getInputClass = (value, required = true) => {
    const baseClass = "w-full border-2 p-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2";
    if (value) {
      return `${baseClass} border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200`;
    }
    return `${baseClass} border-gray-300 focus:border-orange-500 focus:ring-orange-200`;
  };

  return (
    <div className="h-screen bg-orange-500/80 relative overflow-hidden">
      <img
        src="/images/image-fond.jpg"
        alt="Image de fond ARTCI"
        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply z-0"
      />

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
              <img src="/images/logo-white.png" alt="Logo ARTCI" className="h-16 w-auto object-contain" />
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <Link href="#" className="text-lg font-semibold text-white">Accueil</Link>
            <Link href="/dashboard" className="text-lg font-semibold text-white">dashboard</Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
            {!loading && (
              <>
                <span className="text-white font-medium bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  👤 {userName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-lg font-semibold text-white hover:text-orange-200 transition-colors"
                >
                  Se Déconnecter <span aria-hidden="true">&rarr;</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <div className="relative z-10 h-full pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <div className="bg-white rounded-t-2xl shadow-2xl p-6 text-center">
            <h1 className="text-3xl font-bold text-orange-600 mb-1">
              📋 Déclaration d'Incident
            </h1>
            <p className="text-gray-600 text-sm">Remplissez tous les champs obligatoires (*)</p>
          </div>

          <div className="bg-white shadow-2xl flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-orange-100">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Opérateur <span className="text-red-500">*</span>
                </label>
                <select
                  name="operateur"
                  value={formData.operateur}
                  onChange={handleChange}
                  className={getInputClass(formData.operateur)}
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
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: INC-2025-001"
                  className={getInputClass(formData.reference)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Intitulé de l'incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="intitule"
                  value={formData.intitule}
                  onChange={handleChange}
                  placeholder="Résumé court de l'incident"
                  className={getInputClass(formData.intitule)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Descriptif <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descriptif"
                  value={formData.descriptif}
                  onChange={handleChange}
                  placeholder="Description détaillée de l'incident..."
                  className={getInputClass(formData.descriptif)}
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
                    value={formData.zone}
                    onChange={handleChange}
                    placeholder="Ex: Abidjan Nord"
                    className={getInputClass(formData.zone)}
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
                    value={formData.localite}
                    onChange={handleChange}
                    placeholder="Ex: Cocody"
                    className={getInputClass(formData.localite)}
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
                  value={formData.communes}
                  onChange={handleChange}
                  placeholder="Ex: Yopougon, Abobo, Adjamé"
                  className={getInputClass(formData.communes)}
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
                  value={formData.abonnesimpactes}
                  onChange={handleChange}
                  placeholder="Ex: 15000"
                  className={getInputClass(formData.abonnesimpactes)}
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
                  value={formData.typeIncident}
                  onChange={handleChange}
                  className={getInputClass(formData.typeIncident)}
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
                  value={formData.noeudsTouches}
                  onChange={handleChange}
                  placeholder="0"
                  className={getInputClass(formData.noeudsTouches)}
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
                  value={formData.impacts}
                  onChange={handleChange}
                  placeholder="Ex: Interruption de service, perte de connectivité"
                  className={getInputClass(formData.impacts)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Actions de résolution <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleChange}
                  placeholder="Décrivez les actions entreprises..."
                  className={getInputClass(formData.resolution)}
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
                  value={formData.etat}
                  onChange={handleChange}
                  className={getInputClass(formData.etat)}
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
                    Début <span className="text-red-500">{formData.etat === "Clos" && "*"}</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleChange}
                    className={getInputClass(formData.dateDebut)}
                    required={formData.etat === "Clos"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Fin{" "}
                    <span className={formData.etat === "Clos" ? "text-red-500" : "text-gray-400"}>
                      {formData.etat === "Clos" && "*"}
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    className={getInputClass(formData.dateFin)}
                    required={formData.etat === "Clos"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Observation <span className="text-gray-400">(optionnel)</span>
                </label>
                <textarea
                  name="observation"
                  value={formData.observation}
                  onChange={handleChange}
                  placeholder="Remarques additionnelles..."
                  className={getInputClass(formData.observation, false)}
                  rows="3"
                ></textarea>
              </div>

              {/* ✅ Boutons dans le form pour profiter du submit natif */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300 hover:shadow-lg"
                  onClick={() =>
                    setFormData({
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
                    })
                  }
                >
                  🔄 Réinitialiser
                </button>
                
                {/* ✅ CORRECTION : Un seul déclencheur de submit */}
                <button
                  type="submit"
                  className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                >
                  ✅ Soumettre l'incident
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 z-10 text-center text-orange-200 text-sm">
        © 2025 ARTCI - Tous droits réservés
      </footer>
    </div>
  );
}