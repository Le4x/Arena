import { useState } from 'react';

interface JoinScreenProps {
  onJoin: (pinCode: string, teamName: string) => void;
  initialPin?: string | null;
}

export default function JoinScreen({ onJoin, initialPin }: JoinScreenProps) {
  const [pinCode, setPinCode] = useState(initialPin || '');
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim() && teamName.trim()) {
      onJoin(pinCode.toUpperCase(), teamName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🎮 Arena
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Rejoignez la partie !
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code PIN
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'équipe
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Les Champions"
              maxLength={30}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Rejoindre 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
