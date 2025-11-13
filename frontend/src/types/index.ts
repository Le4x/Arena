// Enums
export enum UserRole {
  ADMIN = 'admin',
  HOST = 'host',
  ANIMATOR = 'animator',
}

export enum GameStatus {
  LOBBY = 'lobby',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export enum RoundType {
  QUIZ = 'quiz',
  BLINDTEST = 'blindtest',
  MIXED = 'mixed',
  FINAL = 'final',
}

export enum QuestionType {
  BLINDTEST_AUDIO = 'blindtest_audio',
  QCM = 'qcm',
  QCM_MULTI = 'qcm_multi',
  TEXT = 'text',
  NUMERIC = 'numeric',
  SURVEY = 'survey',
}

export enum ValidationStatus {
  PENDING = 'pending',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PARTIAL = 'partial',
}

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  name: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    correct?: string;
    incorrect?: string;
    background?: string;
  };
  logoUrl?: string;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
  fontFamily: string;
}

export interface Show {
  id: string;
  title: string;
  description?: string;
  eventDate?: string;
  venue?: string;
  themeId?: string;
  theme?: Theme;
  rounds?: Round[];
  defaultLanguage: string;
  settings?: {
    maxTeams?: number;
    maxPlayersPerTeam?: number;
    allowLateJoin?: boolean;
  };
}

export interface Round {
  id: string;
  showId: string;
  name: string;
  type: RoundType;
  order: number;
  questions?: Question[];
  settings?: {
    basePoints?: number;
    speedBonus?: boolean;
    eliminationMode?: boolean;
  };
}

export interface Question {
  id: string;
  roundId: string;
  title: string;
  description?: string;
  type: QuestionType;
  order: number;
  timeLimit: number;
  basePoints: number;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  audioUrl?: string;
  audioStartAt?: number;
  audioDuration?: number;
  audioTitle?: string;
  audioArtist?: string;
  imageCoverUrl?: string;
  settings?: {
    penalty?: number;
    allowSecondBuzz?: boolean;
    autoValidate?: boolean;
    showCorrectAfterAnswer?: boolean;
  };
}

export interface Game {
  id: string;
  showId: string;
  show?: Show;
  pinCode: string;
  status: GameStatus;
  currentRoundId?: string;
  currentQuestionId?: string;
  questionStartedAt?: string;
  teams?: Team[];
  maxTeams: number;
  state?: {
    currentRoundIndex?: number;
    currentQuestionIndex?: number;
    isQuestionActive?: boolean;
    isBuzzerLocked?: boolean;
    finalistTeamIds?: string[];
  };
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  gameId: string;
  name: string;
  color?: string;
  emoji?: string;
  score: number;
  isActive: boolean;
  players?: Player[];
  metadata?: {
    tableNumber?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  teamId: string;
  nickname: string;
  deviceId?: string;
  isConnected: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  teamId: string;
  questionId: string;
  payload: {
    selectedOptions?: string[];
    textAnswer?: string;
    numericAnswer?: number;
  };
  validationStatus: ValidationStatus;
  pointsAwarded: number;
  submittedAt: string;
  wasFirstToAnswer: boolean;
  createdAt: string;
}

export interface BuzzerAttempt {
  id: string;
  teamId: string;
  questionId: string;
  timestampMs: string;
  isFirst: boolean;
  createdAt: string;
  team?: Team;
}
