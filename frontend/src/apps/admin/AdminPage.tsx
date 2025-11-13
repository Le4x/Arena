import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Arena
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('arena_token');
              navigate('/login');
            }}
            className="text-red-600 hover:text-red-800"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Shows</h2>
            <p className="text-gray-600 mb-4">
              Gérer les événements et shows
            </p>
            <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Créer un show
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Games</h2>
            <p className="text-gray-600 mb-4">
              Sessions de jeu actives
            </p>
            <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
              Nouvelle game
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Utilisateurs</h2>
            <p className="text-gray-600 mb-4">
              Gérer les accès régie/animateurs
            </p>
            <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
              Ajouter un utilisateur
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-800">
            📝 <strong>MVP:</strong> Interface admin simplifiée. Les fonctionnalités complètes
            (CRUD shows, questions, médias) seront ajoutées dans la phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
