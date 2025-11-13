import { Game, Team } from '@/types';

interface GameLobbyProps {
  game: Game;
  team: Team;
}

export default function GameLobby({ game, team }: GameLobbyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">{team.emoji || '🎮'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {team.name}
          </h2>
          <div
            className="w-16 h-16 rounded-full mx-auto"
            style={{ backgroundColor: team.color }}
          />
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <p className="text-gray-600 mb-2">Vous avez rejoint :</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {game.show?.title || 'La partie'}
          </h3>
          <p className="text-4xl font-mono font-bold text-blue-600 mt-4">
            PIN: {game.pinCode}
          </p>
        </div>

        <div className="animate-pulse">
          <p className="text-lg text-gray-600">
            ⏳ En attente du début de la partie...
          </p>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Score actuel : <span className="font-bold text-2xl text-blue-600">{team.score}</span> pts
        </div>
      </div>
    </div>
  );
}
