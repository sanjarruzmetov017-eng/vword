
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import Logo from './Logo';

interface MatchmakingViewProps {
  player: Player;
  time: number;
  difficulty: string;
  mode: 'bot' | 'random';
}

const MatchmakingView: React.FC<MatchmakingViewProps> = ({ player, time, difficulty, mode }) => {
  const [dots, setDots] = useState('');
  const [fakeOpponent, setFakeOpponent] = useState({
    name: 'Qidirilmoqda...',
    rating: '????',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder'
  });

  const mockNames = ['Magnus_L', 'Hikaru_W', 'Queen_E', 'Verb_V', 'Chess_K', 'Alisher_P', 'Diyora_S', 'Zokir_U'];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    let flipInterval: any;
    if (mode === 'random') {
      flipInterval = setInterval(() => {
        const randName = mockNames[Math.floor(Math.random() * mockNames.length)];
        const randRating = 800 + Math.floor(Math.random() * 2000);
        setFakeOpponent({
          name: randName,
          rating: randRating.toString(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randName}`
        });
      }, 300);
    } else {
      setFakeOpponent({
        name: 'GEMINI_AI',
        rating: '2500',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotX'
      });
    }

    return () => {
      clearInterval(dotInterval);
      clearInterval(flipInterval);
    };
  }, [mode]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 animate-page">
      <div className="relative mb-24">
        <div className="absolute inset-0 bg-[#81b64c]/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
        <Logo className="w-32 h-32 scale-125 relative z-10" />
      </div>

      <div className="ios-glass p-16 rounded-[60px] max-w-2xl w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81b64c] to-transparent animate-[shimmer_2s_infinite]"></div>
        
        <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">
          {mode === 'random' ? `Raqib Qidirilmoqda${dots}` : `AI Tayyorlanmoqda${dots}`}
        </h2>
        <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[10px] mb-12">
          {time/60} MIN • {mode === 'random' ? 'WORLD BATTLE' : difficulty.toUpperCase()} • RATING {player.rating}
        </p>

        <div className="flex items-center justify-center gap-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={player.avatar} className="w-24 h-24 rounded-[25px] border-2 border-[#81b64c] shadow-[0_0_30px_rgba(129,182,76,0.3)]" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-white text-black text-[8px] font-black px-2 py-1 rounded-lg">YOU</div>
            </div>
            <span className="font-black uppercase text-xs italic">{player.name}</span>
          </div>

          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-white/5 rounded-full scale-150 animate-ping"></div>
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#81b64c] rounded-full animate-spin"></div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className={`relative transition-all duration-300 ${mode === 'random' ? 'animate-pulse' : ''}`}>
               <img src={fakeOpponent.avatar} className={`w-24 h-24 rounded-[25px] border-2 transition-all duration-300 ${mode === 'random' ? 'border-white/10 grayscale-0' : 'border-[#81b64c] shadow-[0_0_30px_rgba(129,182,76,0.3)]'}`} alt="" />
               {mode === 'bot' && <div className="absolute -bottom-2 -right-2 bg-[#81b64c] text-white text-[8px] font-black px-2 py-1 rounded-lg">BOT</div>}
            </div>
            <div className="flex flex-col items-center">
               <span className="font-black uppercase text-xs italic">{fakeOpponent.name}</span>
               <span className="text-[9px] font-black text-[#81b64c]">{fakeOpponent.rating}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-[#81b64c] w-1/3 animate-[loading_4s_linear]"></div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-[#81b64c] w-1/3 animate-[loading_4s_linear] delay-1000"></div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-[#81b64c] w-1/3 animate-[loading_4s_linear] delay-2000"></div>
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-white/10 text-[9px] font-black uppercase tracking-[0.8em] animate-pulse">
        {mode === 'random' ? "Global serverga ulanmoqda..." : "AI strategiyalar yuklanmoqda..."}
      </p>

      <style>{`
        @keyframes loading {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MatchmakingView;
