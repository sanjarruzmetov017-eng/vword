
export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum View {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  GAME = 'GAME',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  MATCHMAKING = 'MATCHMAKING',
  SEARCH = 'SEARCH',
  SOCIAL = 'SOCIAL'
}

export type MoveQuality = 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'book';

export interface Player {
  id: string;
  name: string;
  rating: number;
  timer: number;
  avatar: string;
  isBot: boolean;
  rank?: number;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  friends?: string[]; // Do'stlar ID lari
  incomingRequests?: string[]; // Kelgan so'rovlar ID lari
  stats?: {
    wins: number;
    losses: number;
    draws: number;
    accuracy: number;
    bestWord: string;
  };
}

export interface Move {
  word: string;
  playerId: string;
  timestamp: number;
  meaning?: string;
  score: number;
  quality: MoveQuality;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  history: Move[];
  chats: ChatMessage[];
  status: GameStatus;
  currentPlayerId: string;
  winnerId: string | null;
  lastLetter: string | null;
}
