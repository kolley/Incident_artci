import Head from "next/head";

export default function Home() {
  return (
    <> 
      
      <div className="flex flex-row m-4 space-x-4 justify-center items-center w-full">
        <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="w-24 h-24 mb-4 object-contain" />
        <div className="basis-2xs ml-auto ">
              <a href="/index">Accueil</a>
        </div>
        <div className="basis-xs ml-auto ">
              <a href="/A_propos">A propos</a>
        </div>
        <div className="basis-sm  ml-auto max-w-80  ">
              <a href="/login_register">Se Connecter</a>
        </div>
      </div>

      <Head>
        <title>Signalisation des Incidents</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-orange-600 to-gray-100 flex flex-col items-center justify-center font-sans">
        <header className="mb-8 text-center">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
            Bienvenue sur la plateforme de signalisation des incidents
          </h1>
          <p className="text-gray-200 text-lg max-w-xl mx-auto">
            Signalez rapidement tout incident pour une intervention efficace et
            rapide. Ensemble, améliorons la sécurité et la qualité de nos
            services.
          </p>
        </header>

        <section>
          <button
            className="px-10 py-4 text-lg bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-600 hover:text-white transition"
            /**onClick={() => alert("Redirection vers la page de signalement")}**/
          >
           <a href="/login_register">Signaler un incident</a>
          </button>
        </section>

        <footer className="mt-12 text-gray-200 text-sm">
          © 2025 ARTCI - Tous droits réservés
        </footer>
      </main>
    </>
  );
}
