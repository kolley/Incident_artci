import { useState } from 'react';
import Link from "next/link";// valider l'utilisation de link


<header className="bg-white shadow-sm">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center">
            <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="h-16 w-auto object-contain" />
          </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <a href="/" className="text-lg font-semibold text-orange-600 hover:text-orange-700">Accueil</a>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="/login_register" className="text-lg font-semibold text-orange-600 hover:text-orange-700">
              Se Déconnecter <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
      </header>