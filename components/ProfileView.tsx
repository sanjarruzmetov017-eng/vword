
import React from 'react';
import { Player } from '../types';

interface ProfileViewProps {
  player: Player;
}

const ProfileView: React.FC<ProfileViewProps> = ({ player }) => {
  // Yangi o'yinchi uchun default stats
  const stats = player.stats || { wins: 0, losses: 0, draws: 0, accuracy: 0, bestWord: 'N/A' };
  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar animate-page">
      <div className="max-w-4xl mx-auto">
        <div className="ios-glass p-12 rounded-[50px] mb-8 flex items-center gap-10">
          <div className="relative">
            <img src={player.avatar} className="w-40 h-40 rounded-[35px] border-2 border-white/10 relative z-10" alt="Avatar" />
            <div className="absolute -bottom-2 -right-2 bg-white text-black font-black px-4 py-1.5 rounded-xl text-[10px] z-20">
              LVL 1
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">{player.name}</h1>
              {player.title && <span className="bg-white/10 border border-white/10 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">{player.title}</span>}
            </div>
            <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">Yangi O'yinchi • Global Challenger</p>
            <div className="flex gap-4">
               <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
                 <p className="text-[8px] font-black text-white/20 uppercase mb-0.5">Rating</p>
                 <p className="text-xl font-black text-[#81b64c]">{player.rating}</p>
               </div>
               <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
                 <p className="text-[8px] font-black text-white/20 uppercase mb-0.5">Rank</p>
                 <p className="text-xl font-black text-white">#--</p>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Win Rate" value={`${winRate}%`} subValue={`${stats.wins} Wins`} color="#81b64c" />
          <StatCard label="Accuracy" value={`${stats.accuracy}%`} subValue="Last 20 games" color="#fff" />
          <StatCard label="Best Word" value={stats.bestWord} subValue={`${stats.bestWord.length !== undefined ? stats.bestWord.length : 0} Letters`} color="#fff" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subValue, color }: { label: string, value: string, subValue: string, color: string }) => (
  <div className="ios-glass p-8 rounded-[40px] group transition-all">
    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">{label}</p>
    <p className="text-3xl font-black mb-1 truncate" style={{ color }}>{value}</p>
    <p className="text-[10px] font-bold text-white/20 uppercase">{subValue}</p>
  </div>
);

export default ProfileView;
