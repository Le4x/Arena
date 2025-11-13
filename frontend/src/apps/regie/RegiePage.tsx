import { useState } from 'react';

export default function RegiePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🎛️ Régie - Contrôle du Show
          </h1>
          <p className="text-gray-600 mt-2">
            Interface de contrôle en temps réel
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Question en cours</h2>
            <p className="text-gray-600">
              Sélectionnez une game et lancez une question depuis l'interface admin.
            </p>
            {/* MVP: Interface simplifiée */}
            <div className="mt-6 space-y-4">
              <button className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
                ▶️ Démarrer la question
              </button>
              <button className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600">
                ⏸️ Arrêter la question
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Équipes connectées</h2>
            <p className="text-gray-600 text-sm">
              Liste des équipes qui rejoindront la partie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
