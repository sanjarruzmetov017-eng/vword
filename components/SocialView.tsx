
import React, { useState } from 'react';
import { Player } from '../types';

interface SocialViewProps {
  friends: Player[];
  incomingRequests: Player[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onChallenge: (player: Player) => void;
}

const SocialView: React.FC<SocialViewProps> = ({ friends, incomingRequests, onAccept, onDecline, onChallenge }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar animate-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">Ijtimoiy Hub</h1>
          <div className="ios-glass p-1.5 rounded-2xl flex gap-1">
            <button 
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'friends' ? 'bg-[#81b64c] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              Do'stlar ({friends.length})
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`relative px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'requests' ? 'bg-[#81b64c] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              So'rovlar
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'friends' ? (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="py-20 text-center opacity-20 uppercase tracking-[0.5em] font-black text-xs">
                Sizda hali do'stlar yo'q
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="ios-glass p-8 rounded-[40px] flex items-center justify-between group hover:border-[#81b64c]/40 transition-all magnetic-item">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={friend.avatar} className="w-20 h-20 rounded-[25px] border-2 border-white/5" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#81b64c] border-4 border-[#050505] rounded-full"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-black uppercase tracking-tight">{friend.name}</h3>
                        {friend.title && <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black">{friend.title}</span>}
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rating: {friend.rating} • Online</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onChallenge(friend)}
                    className="bg-[#81b64c] text-black px-8 py-4 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Chaqiruv
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.length === 0 ? (
              <div className="py-20 text-center opacity-20 uppercase tracking-[0.5em] font-black text-xs">
                Yangi so'rovlar yo'q
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className="ios-glass p-8 rounded-[40px] flex items-center justify-between group animate-in slide-in-from-right-10 duration-700">
                  <div className="flex items-center gap-6">
                    <img src={req.avatar} className="w-20 h-20 rounded-[25px] border-2 border-white/5" alt="" />
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{req.name}</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sizga do'stlik yubordi</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onAccept(req.id)}
                      className="bg-[#81b64c] text-black px-8 py-4 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      Qabul qilish
                    </button>
                    <button 
                      onClick={() => onDecline(req.id)}
                      className="bg-white/5 text-white/40 hover:text-white px-8 py-4 rounded-[20px] font-black uppercase text-[11px] tracking-widest transition-all"
                    >
                      Rad etish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialView;
