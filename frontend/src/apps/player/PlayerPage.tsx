import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameAPI, teamAPI } from '@/services/api';
import { wsService } from '@/services/websocket';
import { Game, Team, Question } from '@/types';
import JoinScreen from './JoinScreen';
import GameLobby from './GameLobby';
import QuestionScreen from './QuestionScreen';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const pinFromUrl = searchParams.get('pin');

  const [step, setStep] = useState<'join' | 'lobby' | 'playing'>('join');
  const [game, setGame] = useState<Game | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // Écouter les events WebSocket
    wsService.on('game:state', (data) => {
      setGame(data.game);
    });

    wsService.on('question:started', async (data) => {
      setStep('playing');
      // Charger la question depuis l'API
      // Pour le MVP, on va simplifier
      setCurrentQuestion({ id: data.questionId } as Question);
    });

    wsService.on('question:stopped', () => {
      setStep('lobby');
      setCurrentQuestion(null);
    });

    return () => {
      wsService.off('game:state');
      wsService.off('question:started');
      wsService.off('question:stopped');
    };
  }, []);

  const handleJoinGame = async (pinCode: string, teamName: string) => {
    try {
      // Récupérer la game par PIN
      const { data } = await gameAPI.getGameByPin(pinCode);
      const gameData: Game = data.game;

      if (!gameData) {
        alert('Code PIN invalide');
        return;
      }

      // Créer ou rejoindre une équipe
      const teamRes = await teamAPI.createTeam(gameData.id, teamName);
      const teamData: Team = teamRes.data;

      setGame(gameData);
      setTeam(teamData);

      // Se connecter au WebSocket
      wsService.connect();
      wsService.joinGame(gameData.id, teamData.id, 'player');

      setStep('lobby');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  };

  const handleBuzz = async () => {
    if (!game || !team || !currentQuestion) return;
    try {
      wsService.pressBuzzer(game.id, team.id, currentQuestion.id);
    } catch (error) {
      console.error('Erreur buzz:', error);
    }
  };

  const handleSubmitAnswer = async (payload: any) => {
    if (!game || !team || !currentQuestion) return;
    try {
      wsService.submitAnswer(game.id, team.id, currentQuestion.id, payload);
    } catch (error) {
      console.error('Erreur submit answer:', error);
    }
  };

  if (step === 'join') {
    return <JoinScreen onJoin={handleJoinGame} initialPin={pinFromUrl} />;
  }

  if (step === 'lobby') {
    return (
      <GameLobby game={game!} team={team!} />
    );
  }

  if (step === 'playing' && currentQuestion) {
    return (
      <QuestionScreen
        question={currentQuestion}
        game={game!}
        team={team!}
        onBuzz={handleBuzz}
        onSubmitAnswer={handleSubmitAnswer}
      />
    );
  }

  return <div>Chargement...</div>;
}
