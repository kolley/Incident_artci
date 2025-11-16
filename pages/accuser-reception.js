import { useState } from 'react';
import Link from "next/link";// valider l'utilisation de link

export default function AccuseReception() {
  const [selectedOperator, setSelectedOperator] = useState('');
  const [incidentRef, setIncidentRef] = useState('');
  const [message, setMessage] = useState('');
  const [dateIncident, setDateIncident] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const operateurs = [
    { id: 'moov', name: 'Moov Africa', logo: '📱', color: 'bg-blue-600' },
    { id: 'orange', name: 'Orange CI', logo: '🍊', color: 'bg-orange-600' },
    { id: 'mtn', name: 'MTN Côte d\'Ivoire', logo: '⚡', color: 'bg-yellow-500' },
    { id: 'gva', name: 'GVA (Green Network)', logo: '🌿', color: 'bg-pink-500' },
    { id: 'awalet', name: 'Awalet Telecom', logo: '📡', color: 'bg-purple-600' },
    { id: 'vipnet', name: 'Vipnet', logo: '💎', color: 'bg-green-600' }
  ];

  const handleSubmit = () => {
    if (!selectedOperator || !incidentRef || !message || !dateIncident) return;
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedOperator('');
      setIncidentRef('');
      setMessage('');
      setDateIncident('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-orange-500/80 from-orange-50 to-orange-100">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Accusé de Réception d'Incident
          </h1>
          <p className="text-lg text-gray-600">
            Envoyez un accusé de réception aux opérateurs télécom concernés
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-6 bg-green-100 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center">
              <span className="text-3xl mr-4">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Accusé de réception envoyé avec succès!</h3>
                <p className="text-green-700">L'opérateur a été notifié de la prise en charge de l'incident.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Sélectionnez l'opérateur
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {operateurs.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setSelectedOperator(op.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedOperator === op.id
                      ? `${op.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-2">{op.logo}</div>
                  <div className={`font-semibold ${selectedOperator === op.id ? 'text-white' : 'text-gray-900'}`}>
                    {op.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="incidentRef" className="block text-sm font-semibold text-gray-900 mb-2">
              Référence de l'incident *
            </label>
            <input
              type="text"
              id="incidentRef"
              value={incidentRef}
              onChange={(e) => setIncidentRef(e.target.value)}
              placeholder="Ex: INC-2025-00123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="dateIncident" className="block text-sm font-semibold text-gray-900 mb-2">
              Date de l'incident *
            </label>
            <input
              type="date"
              id="dateIncident"
              value={dateIncident}
              onChange={(e) => setDateIncident(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="mb-8">
            <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
              Message d'accusé de réception *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Nous accusons réception de votre signalement d'incident. Notre équipe technique procède actuellement à l'analyse de la situation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              Rédigez un message professionnel confirmant la réception et la prise en charge de l'incident
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedOperator || !incidentRef || !message || !dateIncident}
              className="flex-1 py-4 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              Envoyer l'accusé de réception
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedOperator('');
                setIncidentRef('');
                setMessage('');
                setDateIncident('');
              }}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-4">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Informations importantes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• L'accusé de réception sera envoyé par email à l'opérateur sélectionné</li>
                <li>• Une copie sera archivée dans le système de gestion des incidents</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 text-center text-gray-600 text-sm">
        © 2025 ARTCI - Tous droits réservés
      </footer>
    </div>
  );
}