import Head from "next/head";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="bg-orange-500/80">

                 <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="bg-white-800 flex items-center justify-between p-6 lg:px-8">
          <div className="bg-white-800 flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Accueil</span>
              <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="w-24 h-30 object-contain" />
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <Link href="#" className="text-lg font-semibold text-white">Accueil</Link>
            <Link href="https://www.artci.ci/" className="text-lg font-semibold text-white">A propos</Link>
            <Link href="/images/DECISI~1_INCIDENT.PDF" className="text-lg font-semibold text-white">Arreté d'incident</Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href="/login_register" className="text-lg font-semibold text-white">
              Se Connecter <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    {/* Image de fond pleine page */}
                    <img
                        src="/images/image-fond.jpg"
                        alt="Image de fond ARTCI"
                        className="absolute inset-0 w-full h-screen object-cover opacity-10 mix-blend-multiply z-0"
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
                    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                        <div className="text-center">
                            <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">Bienvenue sur la plateforme de signalisation des incidents</h1>
                            <p className="mt-8 text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
                                Signalez rapidement tout incident pour une intervention efficace et rapide. Ensemble, améliorons la sécurité et la qualité de nos services.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6 relative z-10">
                                <Link
                                    href="/login_register"
                                    className="px-10 py-4 text-lg bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-600 hover:text-white transition"
                                >
                                    Signaler un incident
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <footer className="mt-12 text-orange-200 text-sm">
                © 2025 ARTCI - Tous droits réservés
            </footer>
        </>
    );
}