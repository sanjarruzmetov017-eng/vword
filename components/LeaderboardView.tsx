
import React from 'react';
import { Player } from '../types';

const MOCK_LEADERS: Player[] = [
  { id: 'l1', name: 'Magnus_Wordsen', rating: 2850, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus', isBot: false, timer: 0 },
  { id: 'l2', name: 'Hikaru_Chat', rating: 2790, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hikaru', isBot: false, timer: 0 },
  { id: 'l3', name: 'Lexical_Queen', rating: 2650, title: 'IM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen', isBot: false, timer: 0 },
  { id: 'l4', name: 'Verb_Viper', rating: 2580, title: 'FM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viper', isBot: false, timer: 0 },
  { id: 'l5', name: 'Word_Master_99', rating: 2420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master', isBot: false, timer: 0 },
];

const LeaderboardView: React.FC = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar animate-page">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10 px-4">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Leaderboard</h1>
          <div className="bg-white/5 p-1 rounded-xl flex border border-white/5">
            <button className="px-4 py-2 rounded-lg bg-white/10 text-[9px] font-black uppercase">Blitz</button>
            <button className="px-4 py-2 rounded-lg text-white/20 text-[9px] font-black uppercase">Rapid</button>
          </div>
        </div>

        <div className="ios-glass rounded-[45px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="py-6 px-8">Rank</th>
                <th className="py-6 px-4">Player</th>
                <th className="py-6 px-8 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_LEADERS.map((player, i) => (
                <tr key={player.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-6 px-8">
                    <span className={`text-lg font-black italic ${i < 3 ? 'text-[#81b64c]' : 'text-white/20'}`}>#{i + 1}</span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <img src={player.avatar} className="w-10 h-10 rounded-xl" alt="" />
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{player.name}</span>
                        {player.title && <span className="text-[8px] font-black bg-[#81b64c] text-black px-1.5 rounded uppercase">{player.title}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <span className="font-black text-lg">{player.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
