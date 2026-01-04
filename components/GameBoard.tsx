
import React, { useEffect, useRef, useState } from 'react';
import { Move, MoveQuality } from '../types';

interface GameBoardProps {
  history: Move[];
  lastLetter: string | null;
  evalValue: number;
}

const Particle: React.FC<{ x: number, y: number, color: string }> = ({ x, y, color }) => {
  const angle = Math.random() * Math.PI * 2;
  const velocity = 3 + Math.random() * 6;
  const [pos, setPos] = useState({ x, y });
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed > 1200) {
        clearInterval(interval);
        return;
      }
      setPos(p => ({
        x: p.x + Math.cos(angle) * velocity,
        y: p.y + Math.sin(angle) * velocity + (elapsed / 80) // Gravity effect
      }));
      setOpacity(1 - elapsed / 1200);
    }, 16);
    return () => clearInterval(interval);
  }, [angle, velocity]);

  return (
    <div 
      className="absolute w-2 h-2 rounded-full pointer-events-none z-50 blur-[1px]"
      style={{ 
        left: pos.x, 
        top: pos.y, 
        backgroundColor: color, 
        opacity,
        boxShadow: `0 0 10px ${color}`
      }} 
    />
  );
};

const QualityBadge = ({ quality }: { quality: MoveQuality }) => {
  const styles: Record<MoveQuality, string> = {
    brilliant: 'bg-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-bounce',
    great: 'bg-[#81b64c] text-white shadow-[0_0_15px_rgba(129,182,76,0.4)]',
    good: 'bg-white/10 text-white/60',
    inaccuracy: 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    book: 'bg-[#3c3a37] text-white'
  };
  const labels: Record<MoveQuality, string> = {
    brilliant: '!!', great: '!', good: '', inaccuracy: '?', book: ''
  };
  if (!labels[quality]) return null;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-700 hover:scale-125 cursor-default ${styles[quality]}`}>
      {labels[quality]}
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({ history, lastLetter, evalValue }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string }[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const lastMove = history[history.length - 1];
    if (lastMove?.quality === 'brilliant' || lastMove?.quality === 'great') {
      const id = Date.now();
      const color = lastMove.quality === 'brilliant' ? '#22d3ee' : '#81b64c';
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: id + i,
        x: lastMove.playerId === 'p1' ? window.innerWidth - 700 : 400,
        y: window.innerHeight - 450,
        color
      }));
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 1500);
    }
  }, [history]);

  const getMoveFontSize = (word: string) => {
    if (word.length > 15) return 'text-xl';
    if (word.length > 10) return 'text-3xl';
    return 'text-5xl';
  };

  return (
    <div className="flex-1 ios-glass rounded-[50px] flex overflow-hidden relative shadow-2xl border-white/5">
      {particles.map(p => <Particle key={p.id} x={p.x} y={p.y} color={p.color} />)}
      
      {/* Dynamic Evaluation Bar */}
      <div className="w-8 h-full bg-black/40 relative flex flex-col-reverse overflow-hidden border-r border-white/10">
        <div 
          className="eval-bar-gradient transition-all duration-[1.5s] cubic-bezier(0.2, 0.8, 0.2, 1) relative" 
          style={{ height: `${evalValue}%` }}
        >
           <div className="absolute top-0 left-0 w-full h-1.5 bg-white/30 blur-[2px]"></div>
           <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-black/40 mix-blend-overlay">
             {Math.round(evalValue)}%
           </div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 z-0"></div>
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative z-10">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 animate-pulse">
              <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mb-8">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-[0.5em]">Battleground</h2>
              <p className="mt-4 text-[10px] font-bold tracking-widest uppercase text-white/40">Sizning navbatingiz</p>
            </div>
          ) : (
            history.map((move, i) => (
              <div key={i} className={`flex ${move.playerId === 'p1' ? 'justify-end' : 'justify-start'} animate-page stagger-${(i % 3) + 1}`}>
                <div className={`group relative max-w-[90%] md:max-w-[75%] p-10 rounded-[45px] border transition-all duration-700 magnetic-item ${
                  move.playerId === 'p1' 
                  ? 'bg-gradient-to-br from-[#81b64c] to-[#6a963e] border-white/20 text-white rounded-tr-none shadow-[0_20px_40px_-10px_rgba(129,182,76,0.3)]' 
                  : 'bg-white/5 border-white/10 text-white rounded-tl-none backdrop-blur-3xl shadow-2xl'
                }`}>
                  <div className="flex items-center gap-8 mb-4">
                    <span className={`${getMoveFontSize(move.word)} font-black uppercase tracking-tighter drop-shadow-2xl break-all leading-none`}>
                      {move.word}
                    </span>
                    <QualityBadge quality={move.quality} />
                  </div>
                  {move.meaning && (
                    <p className={`text-[13px] font-medium leading-relaxed italic ${move.playerId === 'p1' ? 'text-white/90' : 'text-white/40'}`}>
                      {move.meaning}
                    </p>
                  )}
                  <div className={`absolute -bottom-8 ${move.playerId === 'p1' ? 'right-4' : 'left-4'} flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ball: {move.score}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Current Target Footer */}
        <div className="bg-white/[0.02] p-10 border-t border-white/5 flex items-center justify-between backdrop-blur-3xl">
          <div className="flex items-center gap-10">
            <div className={`w-24 h-24 rounded-[35px] flex items-center justify-center text-5xl font-black border-2 transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) ${
              lastLetter ? 'bg-[#81b64c] text-white border-white/20 shadow-[0_0_40px_rgba(129,182,76,0.3)] scale-110' : 'bg-white/5 text-white/10 border-white/5'
            }`}>
              {lastLetter?.toUpperCase() || '?'}
            </div>
            <div>
              <h4 className="text-[11px] font-black text-[#81b64c] uppercase tracking-[0.3em] mb-2">Keyingi nishon</h4>
              <p className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {lastLetter ? (
                  <>So'z <span className="text-[#81b64c]">{lastLetter.toUpperCase()}</span> bilan boshlansin</>
                ) : "Istalgan so'zni kiriting"}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-white/10">
             <div className="w-1 h-1 rounded-full bg-white/20"></div>
             <div className="w-1 h-1 rounded-full bg-white/20"></div>
             <div className="w-1 h-1 rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
