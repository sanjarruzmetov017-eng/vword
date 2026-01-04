
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { GoogleGenAI } from "@google/genai";

const MOCK_PLAYERS: Player[] = [
  { id: 'l1', name: 'Magnus_Wordsen', rating: 2850, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus', isBot: false, timer: 0 },
  { id: 'l2', name: 'Hikaru_Chat', rating: 2790, title: 'GM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hikaru', isBot: false, timer: 0 },
  { id: 'l3', name: 'Lexical_Queen', rating: 2650, title: 'IM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen', isBot: false, timer: 0 },
  { id: 'l4', name: 'Verb_Viper', rating: 2580, title: 'FM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viper', isBot: false, timer: 0 },
  { id: 'l5', name: 'Alisher_Pro', rating: 1200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alisher', isBot: false, timer: 0 },
];

interface SearchViewProps {
  onSendRequest: (targetId: string) => void;
  sentRequests: string[];
  friends: string[];
}

const SearchView: React.FC<SearchViewProps> = ({ onSendRequest, sentRequests, friends }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ players: Player[], wordMeaning?: string }>({ players: [] });
  const [isSearchingWord, setIsSearchingWord] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ players: [] });
      return;
    }

    const filteredPlayers = MOCK_PLAYERS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    setResults(prev => ({ ...prev, players: filteredPlayers }));

    const searchWord = async () => {
      if (query.length < 3 || !query.includes(' ')) return;
      
      setIsSearchingWord(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `What is the dictionary definition of the word "${query.trim()}"? Return ONLY the definition as a short string.`,
          config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        setResults(prev => ({ ...prev, wordMeaning: response.text }));
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingWord(false);
      }
    };

    const timeout = setTimeout(searchWord, 800);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar animate-page">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-16 magnetic-item">
          <div className="absolute inset-0 bg-[#81b64c]/10 blur-[40px] rounded-full scale-110 opacity-50"></div>
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O'yinchilarni yoki so'zlarni qidiring..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-[40px] px-12 py-8 text-4xl font-black italic tracking-tighter outline-none focus:border-[#81b64c]/40 transition-all duration-700 relative z-10 placeholder:text-white/10"
          />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
            {isSearchingWord ? (
              <div className="w-8 h-8 border-4 border-white/10 border-t-[#81b64c] rounded-full animate-spin"></div>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-12">
          {results.players.length > 0 && (
            <section className="animate-page stagger-1">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-8 ml-4">Topilgan O'yinchilar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.players.map((player) => {
                  const isFriend = friends.includes(player.id);
                  const isSent = sentRequests.includes(player.id);

                  return (
                    <div key={player.id} className="ios-glass p-6 rounded-[30px] flex items-center justify-between hover:bg-white/5 transition-all group magnetic-item">
                      <div className="flex items-center gap-4">
                        <img src={player.avatar} className="w-14 h-14 rounded-2xl border border-white/10 group-hover:border-[#81b64c]/40 transition-all" alt="" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg">{player.name}</span>
                            {player.title && <span className="text-[8px] font-black bg-[#81b64c] text-black px-1.5 rounded uppercase">{player.title}</span>}
                          </div>
                          <span className="text-[10px] font-black text-white/30 uppercase">Rating: {player.rating}</span>
                        </div>
                      </div>
                      
                      {isFriend ? (
                        <div className="bg-[#81b64c]/10 text-[#81b64c] px-4 py-2 rounded-xl text-[10px] font-black uppercase">Do'stlar</div>
                      ) : (
                        <button 
                          onClick={() => !isSent && onSendRequest(player.id)}
                          disabled={isSent}
                          className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isSent ? 'bg-white/5 text-white/20' : 'bg-[#81b64c] text-black hover:scale-105 active:scale-95'}`}
                        >
                          {isSent ? 'Yuborilgan' : 'Do\'stlik'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {query.length > 2 && (
            <section className="animate-page stagger-2">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-8 ml-4">Lug'at</h3>
              <div className="ios-glass p-10 rounded-[40px] relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-4xl font-black italic tracking-tighter uppercase mb-6 text-[#81b64c]">"{query}"</h4>
                  <p className="text-xl font-medium leading-relaxed text-white/60">
                    {results.wordMeaning || (isSearchingWord ? "AI ma'no qidirmoqda..." : "Bu so'z haqida ma'lumot olish uchun kuting...")}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
