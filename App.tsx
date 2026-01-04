
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import Logo from './components/Logo';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import SearchView from './components/SearchView';
import SocialView from './components/SocialView';
import MatchmakingView from './components/MatchmakingView';
import { Player, Move, GameStatus, GameState, View, ChatMessage, MoveQuality } from './types';
import { validateWord, getBotMove } from './services/geminiService';

const playSound = (type: 'move' | 'error' | 'gameover' | 'brilliant' | 'ui' | 'match') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'ui') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'match') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'brilliant') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'gameover') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Audio Context error");
  }
};

const MOCK_DB_PLAYERS: Player[] = [
  { id: 'l1', name: 'Magnus_Wordsen', rating: 2850, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus', isBot: false, timer: 0 },
  { id: 'l2', name: 'Hikaru_Chat', rating: 2790, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hikaru', isBot: false, timer: 0 },
  { id: 'l3', name: 'Lexical_Queen', rating: 2650, title: 'IM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen', isBot: false, timer: 0 },
  { id: 'l4', name: 'Verb_Viper', rating: 2580, title: 'FM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viper', isBot: false, timer: 0 },
  { id: 'l5', name: 'Alisher_Pro', rating: 1200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alisher', isBot: false, timer: 0 },
  { id: 'l6', name: 'Zokir_Uz', rating: 1100, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zokir', isBot: false, timer: 0 },
  { id: 'l7', name: 'Diyora_Smart', rating: 950, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diyora', isBot: false, timer: 0 },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>(View.HOME);
  const [selectedTime, setSelectedTime] = useState<number>(600);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'bot' | 'random'>('random');
  const [evalValue, setEvalValue] = useState(50);
  const [showResignModal, setShowResignModal] = useState(false);
  const [ratingChange, setRatingChange] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'MEHMON_USER', rating: 400, timer: 600, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', isBot: false, friends: [], incomingRequests: ['l5'] },
    { id: 'p2', name: 'GEMINI_AI', rating: 2850, timer: 600, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotX', isBot: true, difficulty: 'medium', title: 'GM' },
  ]);

  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const [gameState, setGameState] = useState<GameState>({
    history: [],
    chats: [],
    status: GameStatus.IDLE,
    currentPlayerId: 'p1',
    winnerId: null,
    lastLetter: null,
  });

  const [inputWord, setInputWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMoveTimeRef = useRef<number>(Date.now());

  const isSidebarLocked = view === View.MATCHMAKING || (view === View.GAME && gameState.status === GameStatus.PLAYING);

  const handleSetView = (newView: View) => {
    if (isSidebarLocked) return;
    playSound('ui');
    const protectedViews = [View.GAME, View.PROFILE, View.SOCIAL, View.LEADERBOARD, View.MATCHMAKING];
    if (protectedViews.includes(newView) && !isAuthenticated) {
      setView(View.LOGIN);
      return;
    }
    setView(newView);
  };

  const startNewGame = () => {
    playSound('match');
    setView(View.MATCHMAKING);
    
    let opponent: Player;
    if (gameMode === 'bot') {
      opponent = { id: 'p2', name: 'GEMINI_AI', rating: 2500, timer: selectedTime, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotX', isBot: true, difficulty, title: 'BOT' };
    } else {
      const randomOpponent = MOCK_DB_PLAYERS[Math.floor(Math.random() * MOCK_DB_PLAYERS.length)];
      opponent = { ...randomOpponent, id: 'p2', timer: selectedTime };
    }

    setTimeout(() => {
      playSound('move');
      setPlayers(prev => [prev[0], opponent]);
      setGameState({
        history: [],
        chats: [{ id: '1', senderId: 'p2', text: gameMode === 'bot' ? 'Mashg\'ulot boshlandi!' : `Salom! Omad tilayman.`, timestamp: Date.now() }],
        status: GameStatus.PLAYING,
        currentPlayerId: 'p1',
        winnerId: null,
        lastLetter: null,
      });
      setPlayers(prev => prev.map(p => ({ ...p, timer: selectedTime })));
      setEvalValue(50);
      setRatingChange(0);
      lastMoveTimeRef.current = Date.now();
      setView(View.GAME);
    }, 4000);
  };

  const handlePlayNowGateway = () => {
    if (!isAuthenticated) {
      playSound('error');
      setView(View.LOGIN);
    } else {
      startNewGame();
    }
  };

  const finalizeGame = (winnerId: string | null) => {
    const p1 = players[0];
    const p2 = players[1];
    let change = 0;

    if (winnerId === 'p1') {
      change = 15 + Math.floor(Math.random() * 10);
    } else if (winnerId === 'p2') {
      if (p2.isBot && gameMode === 'bot') {
        change = 0;
      } else {
        change = -(10 + Math.floor(Math.random() * 5));
      }
    }

    setRatingChange(change);
    setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, rating: Math.max(0, p.rating + change) } : p));
    setGameState(gs => ({ ...gs, status: GameStatus.GAME_OVER, winnerId }));
    playSound('gameover');
  };

  useEffect(() => {
    let interval: any;
    if (gameState.status === GameStatus.PLAYING && !gameState.winnerId) {
      interval = setInterval(() => {
        setPlayers(prev => {
          const current = prev.find(p => p.id === gameState.currentPlayerId);
          if (current && current.timer <= 0) {
            finalizeGame(prev.find(p => p.id !== gameState.currentPlayerId)?.id || null);
            return prev;
          }
          return prev.map(p => p.id === gameState.currentPlayerId ? { ...p, timer: Math.max(0, p.timer - 1) } : p);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.currentPlayerId, gameState.winnerId]);

  const handleMove = async (word: string, playerId: string): Promise<boolean> => {
    if (gameState.status !== GameStatus.PLAYING || gameState.winnerId || isLoading) return false;
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.length < 3) { setError("Kamida 3 ta harf!"); playSound('error'); return false; }
    if (gameState.lastLetter && cleanWord[0] !== gameState.lastLetter) { setError(`'${gameState.lastLetter.toUpperCase()}' bilan boshlang`); playSound('error'); return false; }
    if (gameState.history.some(m => m.word === cleanWord)) { setError("Ishlatilgan so'z!"); playSound('error'); return false; }

    setIsLoading(true);
    setError('');
    try {
      const validation = await validateWord(cleanWord, gameState.lastLetter);
      if (validation.isValid) {
        const now = Date.now();
        const quality: MoveQuality = cleanWord.length >= 10 ? 'brilliant' : cleanWord.length >= 8 ? 'great' : cleanWord.length >= 5 ? 'good' : 'inaccuracy';
        if (quality === 'brilliant') playSound('brilliant'); else playSound('move');

        setGameState(prev => ({
          ...prev,
          history: [...prev.history, { word: cleanWord, playerId, timestamp: now, meaning: validation.meaning, score: cleanWord.length * 10, quality }],
          currentPlayerId: playerId === 'p1' ? 'p2' : 'p1',
          lastLetter: cleanWord[cleanWord.length - 1]
        }));
        setInputWord('');
        return true;
      } else {
        setError(validation.error || "Xato so'z");
        playSound('error');
        return false;
      }
    } catch (err) {
      setError("Tizimda xatolik");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const opponent = players.find(p => p.id === gameState.currentPlayerId);
    if (opponent && opponent.id === 'p2' && gameState.status === GameStatus.PLAYING && !gameState.winnerId && !isLoading) {
      const thinkingTime = gameMode === 'random' ? (3000 + Math.random() * 5000) : 2500;
      const timer = setTimeout(async () => {
         const botWord = await getBotMove(gameState.lastLetter || 'a', difficulty);
         await handleMove(botWord, 'p2');
      }, thinkingTime);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerId, gameState.status, gameState.lastLetter, isLoading, difficulty, gameMode, players]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setView(View.HOME);
      setIsLoading(false);
      playSound('brilliant');
      setPlayers(prev => prev.map(p => p.id === 'p1' ? {...p, name: 'GRAND_MASTER', rating: 800} : p));
    }, 1500);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (resetStep === 1) {
      setTimeout(() => {
        setIsLoading(false);
        setResetStep(2);
        playSound('ui');
      }, 1500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setView(View.LOGIN);
        setResetStep(1);
        playSound('brilliant');
        setError('');
      }, 2000);
    }
  };

  const currentMainPlayer = players.find(p => p.id === 'p1')!;

  return (
    <div className="flex h-screen w-screen p-6 gap-6 bg-transparent text-white overflow-hidden">
      <Sidebar 
        currentView={view} 
        setView={handleSetView} 
        disabled={isSidebarLocked}
        onLogout={() => { setIsAuthenticated(false); setView(View.LOGIN); }} 
        requestCount={isAuthenticated ? currentMainPlayer.incomingRequests?.length || 0 : 0}
      />
      <main className="flex-1 flex flex-col h-full relative z-10 ml-[140px]">
        <div className="flex-1 flex flex-col h-full">
          {view === View.HOME && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-page">
              <Logo className="w-40 h-40 mb-12" />
              <h1 className="text-8xl font-black italic tracking-tighter mb-4">WORD<span className="text-[#81b64c]">BATTLE</span></h1>
              <p className="text-white/20 uppercase tracking-[0.8em] text-[10px] mb-12 font-black">Global Arena • Season 1</p>
              
              {!isAuthenticated ? (
                <button 
                  onClick={handlePlayNowGateway} 
                  className="chess-green-btn px-20 py-8 rounded-[40px] text-2xl font-black uppercase tracking-[0.2em] shimmer-btn"
                >
                  Play Now
                </button>
              ) : (
                <div className="w-full max-w-4xl animate-page stagger-1">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 flex flex-col gap-4">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4 text-left">Arena Tanlang</p>
                       <button 
                         onClick={() => { playSound('ui'); setGameMode('random'); }}
                         className={`p-8 rounded-[35px] text-left border-2 transition-all duration-500 flex flex-col gap-2 ${gameMode === 'random' ? 'bg-[#81b64c]/10 border-[#81b64c] shadow-[0_20px_40px_rgba(129,182,76,0.1)]' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100 hover:bg-white/10'}`}
                       >
                         <span className="text-xl font-black uppercase italic tracking-tight">World Battle</span>
                         <span className="text-[10px] font-bold text-white/40 uppercase">Haqiqiy raqiblar bilan reyting uchun</span>
                       </button>
                       <button 
                         onClick={() => { playSound('ui'); setGameMode('bot'); }}
                         className={`p-8 rounded-[35px] text-left border-2 transition-all duration-500 flex flex-col gap-2 ${gameMode === 'bot' ? 'bg-[#81b64c]/10 border-[#81b64c] shadow-[0_20px_40px_rgba(129,182,76,0.1)]' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100 hover:bg-white/10'}`}
                       >
                         <span className="text-xl font-black uppercase italic tracking-tight">Practice Bot</span>
                         <span className="text-[10px] font-bold text-white/40 uppercase">AI bilan bilimingizni charxlang</span>
                       </button>
                    </div>
                    <div className="lg:col-span-8 flex flex-col gap-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="animate-page stagger-2">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 ml-4 text-left">Vaqt Tanlang</p>
                            <div className="ios-glass p-2 rounded-[30px] flex gap-2">
                              {[180, 300, 600].map(s => (
                                <button key={s} onClick={() => { playSound('ui'); setSelectedTime(s); }} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase transition-all duration-500 ${selectedTime === s ? 'bg-[#81b64c] text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                                  {s/60} MIN
                                </button>
                              ))}
                            </div>
                         </div>
                         <div className="animate-page stagger-3 transition-opacity duration-500">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 ml-4 text-left">Qiyinchilik</p>
                            <div className="ios-glass p-2 rounded-[30px] flex gap-2">
                              {(['easy', 'medium', 'hard'] as const).map(d => (
                                <button key={d} onClick={() => { playSound('ui'); setDifficulty(d); }} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase transition-all duration-500 ${difficulty === d ? 'bg-[#81b64c] text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                                  {d.toUpperCase()}
                                </button>
                              ))}
                            </div>
                         </div>
                       </div>
                       <button onClick={startNewGame} className="chess-green-btn w-full py-8 rounded-[40px] text-3xl font-black uppercase tracking-[0.2em] shimmer-btn mt-4">Arena Kirish</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {view === View.MATCHMAKING && <MatchmakingView player={currentMainPlayer} time={selectedTime} difficulty={difficulty} mode={gameMode} />}
          {(view === View.LOGIN || view === View.REGISTER || view === View.FORGOT_PASSWORD) && (
             <div className="flex-1 flex flex-col items-center justify-center p-6 animate-page">
                <Logo className="w-32 h-32 mb-16" />
                <div className="ios-glass p-16 rounded-[60px] w-full max-w-lg shadow-2xl relative overflow-hidden text-center magnetic-item">
                   <h2 className="text-4xl font-black italic mb-8 uppercase tracking-tighter">
                     {view === View.LOGIN ? 'Xush Kelibsiz' : (view === View.REGISTER ? 'Legacy Yarating' : 'Parolni Tiklash')}
                   </h2>
                   
                   {view === View.FORGOT_PASSWORD ? (
                     <form onSubmit={handleResetPasswordSubmit} className="space-y-6 text-left animate-page">
                       {resetStep === 1 ? (
                         <>
                           <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Ro'yxatdan o'tgan email manzilingizni kiriting.</p>
                           <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" />
                           <button type="submit" disabled={isLoading} className="chess-green-btn w-full py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-sm mt-4">
                             {isLoading ? 'Yuborilmoqda...' : 'Tasdiqlash kodi'}
                           </button>
                         </>
                       ) : (
                         <>
                           <p className="text-[#81b64c] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Emailingizga kod yuborildi. Yangi parolingizni o'rnating.</p>
                           <input type="text" placeholder="Tasdiqlash kodi (MOCK: 1234)" required className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" />
                           <div className="relative w-full">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Yangi Parol" 
                                required 
                                className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 pr-16 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#81b64c] transition-colors p-2"
                              >
                                {showPassword ? (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                              </button>
                           </div>
                           <button type="submit" disabled={isLoading} className="chess-green-btn w-full py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-sm mt-4">
                             {isLoading ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
                           </button>
                         </>
                       )}
                       <button 
                         type="button" 
                         onClick={() => { setView(View.LOGIN); setResetStep(1); }}
                         className="w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest mt-2"
                       >
                         Orqaga qaytish
                       </button>
                     </form>
                   ) : (
                     <form onSubmit={handleAuthSubmit} className="space-y-6 text-left">
                        {view === View.REGISTER && (
                          <input type="text" placeholder="Foydalanuvchi nomi" required className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" />
                        )}
                        <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" />
                        
                        <div className="relative w-full">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Parol" 
                            required 
                            className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 pr-16 font-bold outline-none focus:bg-white/10 focus:border-[#81b64c]/40 transition-all duration-700" 
                          />
                          <button 
                            type="button" 
                            onClick={() => { playSound('ui'); setShowPassword(!showPassword); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#81b64c] transition-colors p-2"
                          >
                            {showPassword ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            )}
                          </button>
                        </div>

                        {view === View.LOGIN && (
                          <div className="flex justify-end px-4">
                            <button 
                              type="button" 
                              onClick={() => { playSound('ui'); setView(View.FORGOT_PASSWORD); }}
                              className="text-[10px] font-black text-white/30 hover:text-[#81b64c] transition-colors uppercase tracking-widest"
                            >
                              Parolni unutdingizmi?
                            </button>
                          </div>
                        )}

                        <button type="submit" disabled={isLoading} className="chess-green-btn w-full py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-sm mt-4">
                          {isLoading ? 'Yuklanmoqda...' : (view === View.LOGIN ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
                        </button>
                     </form>
                   )}
                   
                   <p className="mt-10 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                     {view === View.LOGIN ? "Hisobingiz yo'qmi?" : (view === View.REGISTER ? "Hisobingiz bormi?" : "")}
                     {view !== View.FORGOT_PASSWORD && (
                        <button onClick={() => setView(view === View.LOGIN ? View.REGISTER : View.LOGIN)} className="ml-3 text-[#81b64c] hover:underline transition-all">
                          {view === View.LOGIN ? 'REGISTER' : 'LOGIN'}
                        </button>
                     )}
                   </p>
                </div>
             </div>
          )}
          {view === View.PROFILE && <ProfileView player={currentMainPlayer} />}
          {view === View.LEADERBOARD && <LeaderboardView />}
          {view === View.SEARCH && <SearchView onSendRequest={(id) => { playSound('ui'); setSentRequests(p => [...p, id]); }} sentRequests={sentRequests} friends={currentMainPlayer.friends || []} />}
          {view === View.SOCIAL && <SocialView friends={MOCK_DB_PLAYERS.filter(p => currentMainPlayer.friends?.includes(p.id))} incomingRequests={MOCK_DB_PLAYERS.filter(p => currentMainPlayer.incomingRequests?.includes(p.id))} onAccept={(id) => { playSound('brilliant'); setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, friends: [...(p.friends || []), id], incomingRequests: (p.incomingRequests || []).filter(rid => rid !== id) } : p)); }} onDecline={(id) => { playSound('ui'); setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, incomingRequests: (p.incomingRequests || []).filter(rid => rid !== id) } : p)); }} onChallenge={startNewGame} />}
          {view === View.GAME && (
             <div className="flex h-full p-4 gap-8 animate-page relative">
               <div className="flex-1 flex flex-col gap-8 h-full relative">
                 <GameBoard history={gameState.history} lastLetter={gameState.lastLetter} evalValue={evalValue} />
                 <div className="ios-glass p-10 rounded-[50px] relative">
                   <form onSubmit={e => { e.preventDefault(); handleMove(inputWord, 'p1'); }} className="flex gap-6">
                     <input ref={inputRef} type="text" value={inputWord} onChange={e => setInputWord(e.target.value)} disabled={gameState.currentPlayerId !== 'p1' || !!gameState.winnerId} placeholder={gameState.currentPlayerId === 'p1' ? "So'z kiriting..." : "Raqib o'ylamoqda..."} className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[35px] px-10 py-7 text-3xl font-black uppercase tracking-tight outline-none focus:border-[#81b64c]/40 transition-all" />
                     <button type="submit" className="chess-green-btn px-16 rounded-[30px] font-black uppercase text-sm tracking-[0.2em]">Zarba</button>
                   </form>
                   {error && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/90 px-8 py-3 rounded-full text-[10px] font-black uppercase animate-page">{error}</div>}
                 </div>
               </div>
               <GameInfo players={players} currentPlayerId={gameState.currentPlayerId} history={gameState.history} chats={gameState.chats} onSendMessage={(txt) => setGameState(g => ({...g, chats: [...g.chats, {id: Date.now().toString(), senderId: 'p1', text: txt, timestamp: Date.now()}]}))} winnerId={gameState.winnerId} ratingChange={ratingChange} onResign={() => { setShowResignModal(true); }} onNewGame={startNewGame} onHome={() => setView(View.HOME)} />
               {showResignModal && (
                  <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl rounded-[60px] animate-page">
                    <div className="ios-glass p-16 rounded-[70px] max-w-md w-full text-center">
                      <h3 className="text-4xl font-black italic mb-6 uppercase tracking-tighter">Taslim bo'lasizmi?</h3>
                      <div className="flex flex-col gap-4">
                        <button onClick={() => { setShowResignModal(false); finalizeGame('p2'); }} className="w-full py-6 bg-red-500/80 hover:bg-red-500 text-white rounded-[25px] font-black uppercase">Tasdiqlash</button>
                        <button onClick={() => setShowResignModal(false)} className="w-full py-6 bg-white/5 text-white/40 rounded-[25px] font-black uppercase">Bekor qilish</button>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
