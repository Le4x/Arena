import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameAPI } from '@/services/api';
import { wsService } from '@/services/websocket';
import { Game } from '@/types';
import QRCode from 'qrcode.react';

export default function ScreenPage() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');

  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const loadGame = async () => {
      try {
        const { data } = await gameAPI.getGame(gameId);
        setGame(data);

        wsService.connect();
        wsService.joinGame(gameId, undefined, 'screen');
      } catch (error) {
        console.error('Erreur chargement game:', error);
      }
    };

    loadGame();

    wsService.on('game:state', (data) => {
      setGame(data.game);
    });

    return () => {
      wsService.off('game:state');
      wsService.leaveGame();
    };
  }, [gameId]);

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-2xl">❌ Aucun gameId fourni dans l'URL</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-2xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white p-8">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4">
          {game.show?.title || 'Arena'}
        </h1>
        <p className="text-2xl mb-12 text-gray-300">
          Scannez le QR code ou entrez le code PIN pour rejoindre !
        </p>

        <div className="bg-white rounded-3xl p-12 inline-block">
          <QRCode
            value={window.location.origin + '/play?pin=' + game.pinCode}
            size={300}
            level="H"
          />
        </div>

        <div className="mt-12">
          <p className="text-3xl text-gray-300 mb-2">Code PIN</p>
          <p className="text-9xl font-mono font-bold tracking-widest">
            {game.pinCode}
          </p>
        </div>

        <div className="mt-16 text-xl text-gray-400">
          {game.teams?.length || 0} équipes connectées
        </div>
      </div>
    </div>
  );
}
