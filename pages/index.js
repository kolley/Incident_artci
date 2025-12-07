import Head from "next/head";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <header className="absolute inset-x-0 top-0 z-50">
                <nav aria-label="Global" className="bg-white-800 flex items-center justify-between p-6 lg:px-8">
                    <div className="bg-white-800 flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5">
                            <img src="/images/logo-white.png" alt="Logo ARTCI" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        <Link href="#" className="px-10 text-lg rounded-full font-semibold text-white hover:bg-white hover:text-orange-600 transition">Accueil</Link>
                        <Link href="https://www.artci.ci/" className="px-10 text-lg rounded-full font-semibold text-white hover:bg-white hover:text-orange-600 transition">A propos</Link>
                        <Link href="/images/DECISI~1_INCIDENT.PDF" className="px-10 text-lg rounded-full font-semibold text-white hover:bg-white hover:text-orange-600 transition">décision</Link>
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <Link href="/login_register" className="text-lg font-semibold text-white">
                            Se Connecter →
                        </Link>
                    </div>
                </nav>
            </header>

            {/* 🔥 Bloc avec image + overlay orange */}
            <div className="relative isolate px-6 pt-14 lg:px-8 bg-orange-500/80">

                {/* Image de fond */}
                <img
                    src="/images/image-fond.jpg"
                    alt="Image de fond ARTCI"
                    className="absolute inset-0 w-full h-screen object-cover opacity-10 mix-blend-multiply z-0"
                />


                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 relative z-10 text-center">
                    <h1 className="text-5xl font-semibold text-white sm:text-7xl fade-up">
                        Bienvenue sur la plateforme de signalisation des incidents
                    </h1>

                    <p className="mt-8 text-lg text-gray-300 sm:text-xl fade-up-delay">
                        Signalez rapidement tout incident pour une intervention efficace et rapide.
                    </p>


                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/login_register"
                            className="px-10 py-4 text-lg bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-600 hover:text-white transition"
                        >
                            Signaler un incident
                        </Link>
                    </div>
                </div>

                {/* Footer placé juste sous l'image */}
                <footer className="pb-6 text-orange-200 text-sm text-center relative z-10">
                    © 2025 ARTCI - Tous droits réservés
                </footer>
            </div>
        </>
    );
}
