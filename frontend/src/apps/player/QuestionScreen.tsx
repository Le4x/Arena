import { useState } from 'react';
import { Question, Game, Team, QuestionType } from '@/types';

interface QuestionScreenProps {
  question: Question;
  game: Game;
  team: Team;
  onBuzz: () => void;
  onSubmitAnswer: (payload: any) => void;
}

export default function QuestionScreen({
  question,
  onBuzz,
  onSubmitAnswer,
}: QuestionScreenProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleBuzz = () => {
    onBuzz();
    setHasAnswered(true);
  };

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;

    if (question.type === QuestionType.QCM_MULTI) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = () => {
    onSubmitAnswer({ selectedOptions });
    setHasAnswered(true);
  };

  // Buzzer mode (blindtest)
  if (question.type === QuestionType.BLINDTEST_AUDIO) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            🎵 Blindtest Audio
          </h2>

          {!hasAnswered ? (
            <button
              onClick={handleBuzz}
              className="w-64 h-64 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-2xl flex items-center justify-center text-6xl transform hover:scale-110 transition-all active:scale-95"
            >
              🔔
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <p className="text-2xl font-bold text-gray-800">
                ✅ Vous avez buzzé !
              </p>
              <p className="text-gray-600 mt-4">
                Attendez la validation de la régie...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // QCM mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {question.title}
          </h3>
          {question.description && (
            <p className="text-gray-600">{question.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              disabled={hasAnswered}
              className={"w-full p-4 rounded-xl text-left font-medium transition-all " + (
                selectedOptions.includes(option.id)
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              ) + (hasAnswered ? ' opacity-50 cursor-not-allowed' : '')}
            >
              <span className="text-xl mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option.text}
            </button>
          ))}
        </div>

        {!hasAnswered && selectedOptions.length > 0 && (
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
          >
            Valider la réponse ✅
          </button>
        )}

        {hasAnswered && (
          <div className="mt-6 bg-white rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-gray-800">
              ✅ Réponse envoyée !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
