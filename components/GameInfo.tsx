
import React, { useState, useEffect } from 'react';
import { Player, Move, ChatMessage, MoveQuality } from '../types';

interface GameInfoProps {
  players: Player[];
  currentPlayerId: string;
  history: Move[];
  chats: ChatMessage[];
  onSendMessage: (text: string) => void;
  winnerId: string | null;
  ratingChange?: number;
  onResign: () => void;
  onNewGame: () => void;
  onHome: () => void;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Math.abs(value);
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  
  const sign = value > 0 ? '+' : (value < 0 ? '-' : '');
  return <>{sign}{displayValue}</>;
};

const GameInfo: React.FC<GameInfoProps> = ({ players, currentPlayerId, history, chats, onSendMessage, winnerId, ratingChange = 0, onResign, onNewGame, onHome }) => {
  const [tab, setTab] = useState<'moves' | 'chat'>('moves');
  const [chatInput, setChatInput] = useState('');
  
  const p1 = players.find(p => p.id === 'p1')!;
  const p2 = players.find(p => p.id === 'p2')!;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const calculateAccuracy = () => {
    const p1Moves = history.filter(m => m.playerId === 'p1');
    if (p1Moves.length === 0) return 0;
    const score = p1Moves.reduce((acc, m) => {
      if (m.quality === 'brilliant') return acc + 100;
      if (m.quality === 'great') return acc + 90;
      if (m.quality === 'good') return acc + 75;
      return acc + 40;
    }, 0);
    return Math.round(score / p1Moves.length);
  };

  const quickMessages = ['Yaxshi o\'yin!', 'Zo\'r!', '⚡', 'O\'ylayapman...', 'Omad!'];

  return (
    <div className="w-[400px] flex flex-col gap-4">
      <PlayerCard player={p2} active={currentPlayerId === 'p2'} time={formatTime(p2.timer)} ratingChange={winnerId ? (winnerId === 'p2' ? 12 : -12) : undefined} />
      
      <div className="flex-1 ios-glass rounded-[40px] flex flex-col overflow-hidden">
        <div className="flex bg-black/20 p-2">
          <button 
            onClick={() => setTab('moves')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${tab === 'moves' ? 'bg-white/10 text-[#81b64c]' : 'text-white/30 hover:text-white'}`}
          >
            Yurishlar
          </button>
          <button 
            onClick={() => setTab('chat')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${tab === 'chat' ? 'bg-white/10 text-[#81b64c]' : 'text-white/30 hover:text-white'}`}
          >
            Suhbat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {tab === 'moves' ? (
            history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase text-[9px] font-black tracking-widest text-center">
                Yurishlar yo'q
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                  <div key={i} className="grid grid-cols-10 items-center py-3 px-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="col-span-1 text-[9px] font-black text-white/20">{i + 1}</span>
                    <span className="col-span-4 font-black uppercase text-xs truncate">{history[i*2]?.word || ''}</span>
                    <span className="col-span-5 text-right font-black uppercase text-xs text-[#81b64c] truncate">{history[i*2+1]?.word || ''}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col h-full">
               <div className="flex-1 space-y-4 mb-4">
                 {chats.map(msg => (
                   <div key={msg.id} className={`flex flex-col ${msg.senderId === 'p1' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold max-w-[80%] ${msg.senderId === 'p1' ? 'bg-[#81b64c] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
               </div>
               <div className="flex flex-wrap gap-2 mb-4">
                 {quickMessages.map(m => (
                   <button key={m} onClick={() => onSendMessage(m)} className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white/40">{m}</button>
                 ))}
               </div>
               <form onSubmit={e => { e.preventDefault(); onSendMessage(chatInput); setChatInput(''); }}>
                 <input 
                   type="text" 
                   value={chatInput} 
                   onChange={e => setChatInput(e.target.value)}
                   placeholder="..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold outline-none"
                 />
               </form>
            </div>
          )}
        </div>

        {winnerId && (
          <div className="p-8 bg-black/40 backdrop-blur-2xl border-t border-white/10 animate-in slide-in-from-top-10 duration-700">
            <h3 className={`text-4xl font-black italic tracking-tighter uppercase mb-6 ${winnerId === 'p1' ? 'text-[#81b64c]' : 'text-red-500'}`}>
              {winnerId === 'p1' ? 'G\'alaba' : 'Mag\'lubiyat'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-white/5 p-4 rounded-3xl text-center">
                  <p className="text-3xl font-black text-white">{calculateAccuracy()}%</p>
                  <p className="text-[9px] font-black text-[#81b64c] uppercase">Aniqlik</p>
               </div>
               <div className="bg-white/5 p-4 rounded-3xl text-center">
                  <p className={`text-3xl font-black ${ratingChange > 0 ? 'text-[#81b64c]' : (ratingChange < 0 ? 'text-red-500' : 'text-white/40')}`}>
                    <AnimatedNumber value={ratingChange} />
                  </p>
                  <p className="text-[9px] font-black text-white/30 uppercase">Reyting</p>
               </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={onNewGame} className="chess-green-btn w-full py-5 rounded-3xl font-black uppercase text-xs tracking-widest">Yangi O'yin</button>
              <button onClick={onHome} className="bg-white/5 hover:bg-white/10 w-full py-4 rounded-3xl font-black uppercase text-[10px] text-white/40 tracking-[0.2em] transition-all">Bosh Sahifa</button>
            </div>
          </div>
        )}

        {!winnerId && (
          <div className="p-4 bg-black/10 border-t border-white/5 grid grid-cols-2 gap-3">
            <button onClick={onResign} className="bg-white/5 py-4 rounded-2xl font-black uppercase text-[10px] text-white/30 hover:bg-red-500/10 hover:text-red-500 transition-all">Taslim bo'lish</button>
            <button className="bg-white/5 py-4 rounded-2xl font-black uppercase text-[10px] text-white/10 cursor-not-allowed">Durang</button>
          </div>
        )}
      </div>

      <PlayerCard player={p1} active={currentPlayerId === 'p1'} time={formatTime(p1.timer)} ratingChange={winnerId ? ratingChange : undefined} />
    </div>
  );
};

const PlayerCard = ({ player, active, time, ratingChange }: { player: Player, active: boolean, time: string, ratingChange?: number }) => (
  <div className={`p-6 rounded-[35px] flex items-center justify-between transition-all duration-500 ${active ? 'bg-white/10 border-white/20 active-glow' : 'bg-white/5 opacity-50 border-transparent border'}`}>
    <div className="flex items-center gap-4">
      <img src={player.avatar} className={`w-14 h-14 rounded-2xl border-2 transition-all duration-500 ${active ? 'border-[#81b64c]' : 'border-white/5'}`} alt="" />
      <div>
        <div className="flex items-center gap-2">
          <p className="font-black text-lg tracking-tight uppercase italic">{player.name}</p>
          {ratingChange !== undefined && (
            <span className={`text-[10px] font-black ${ratingChange >= 0 ? 'text-[#81b64c]' : 'text-red-500'}`}>
              ({ratingChange >= 0 ? '+' : ''}{ratingChange})
            </span>
          )}
        </div>
        <p className="text-[10px] font-black text-[#81b64c] uppercase">{player.rating}</p>
      </div>
    </div>
    <div className={`text-2xl font-black font-mono px-5 py-3 rounded-2xl transition-all duration-500 ${active ? 'bg-white text-black' : 'text-white/20'}`}>{time}</div>
  </div>
);

export default GameInfo;
