import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";

export default function AccuseReception() {
  const router = useRouter();
  const [incidentRef, setIncidentRef] = useState('');
  const [message, setMessage] = useState('');
  const [dateIncident, setDateIncident] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!incidentRef || !message || !dateIncident) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/accuse-reception/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: incidentRef,
          dateIncident,
          message
        })
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIncidentRef('');
          setMessage('');
          setDateIncident('');
        }, 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* HEADER */}
      <header className="bg-white shadow-md border-b-4 border-orange-500">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <img src="/images/ARTCI-2_img.png" alt="Logo ARTCI" className="h-16 w-auto object-contain" />
          </Link>
          
          <div className="hidden lg:flex lg:gap-x-8">
            <Link href="/" className="text-lg font-semibold text-gray-700 hover:text-orange-600 transition">
              Accueil
            </Link>
            <Link href="/dashboard" className="text-lg font-semibold text-gray-700 hover:text-orange-600 transition">
              Dashboard
            </Link>
          </div>
          
          <Link 
            href="/login_register" 
            className="hidden lg:flex items-center gap-2 px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-md"
          >
            Se Déconnecter
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* TITRE */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
            <span className="text-5xl">📧</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Accusé de Réception d'Incident
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Envoyez un accusé de réception officiel aux opérateurs télécom concernés
          </p>
        </div>

        {/* MESSAGE DE SUCCÈS */}
        {showSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl shadow-lg">
            <div className="flex items-center">
              <span className="text-4xl mr-4">✅</span>
              <div>
                <h3 className="text-xl font-bold text-green-800">Accusé de réception envoyé !</h3>
                <p className="text-green-700 mt-1">L'opérateur a été notifié par email de la prise en charge de l'incident.</p>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE D'ERREUR */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl shadow-lg">
            <div className="flex items-center">
              <span className="text-4xl mr-4">❌</span>
              <div>
                <h3 className="text-xl font-bold text-red-800">Erreur</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
          
          {/* RÉFÉRENCE INCIDENT */}
          <div className="mb-6">
            <label htmlFor="incidentRef" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔖</span>
              Référence de l'incident <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="incidentRef"
              value={incidentRef}
              onChange={(e) => setIncidentRef(e.target.value)}
              placeholder="Ex: INC-2025-00123"
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              required
            />
          </div>

          {/* DATE INCIDENT */}
          <div className="mb-6">
            <label htmlFor="dateIncident" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📅</span>
              Date de l'incident <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateIncident"
              value={dateIncident}
              onChange={(e) => setDateIncident(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              required
            />
          </div>

          {/* MESSAGE */}
          <div className="mb-10">
            <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>✉️</span>
              Message d'accusé de réception <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Nous accusons réception de votre signalement d'incident référencé ci-dessus. Notre équipe technique procède actuellement à l'analyse détaillée de la situation. Nous vous tiendrons informé de l'évolution du traitement de cet incident dans les meilleurs délais."
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition"
              required
            />
            <p className="mt-3 text-sm text-gray-500 flex items-start gap-2">
              <span>💡</span>
              <span>Rédigez un message professionnel et formel confirmant la réception et la prise en charge de l'incident</span>
            </p>
          </div>

          {/* BOUTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || !incidentRef || !message || !dateIncident}
              className="flex-1 py-4 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Envoyer l'accusé de réception</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIncidentRef('');
                setMessage('');
                setDateIncident('');
                setError('');
              }}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </form>

        {/* INFORMATIONS */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Informations importantes</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>L'accusé de réception sera envoyé <strong>par email</strong> à tous les opérateurs concernés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Une copie sera <strong>automatiquement archivée</strong> dans le système de gestion des incidents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Assurez-vous que la <strong>référence de l'incident</strong> est correcte avant l'envoi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 py-8 border-t-2 border-gray-200 bg-white">
        <div className="text-center text-gray-600 text-sm">
          <p className="font-semibold">© 2025 ARTCI - Autorité de Régulation des Télécommunications de Côte d'Ivoire</p>
          <p className="mt-2">Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}