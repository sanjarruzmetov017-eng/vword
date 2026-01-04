
import React from 'react';
import { Icons } from '../constants';
import { View } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  disabled?: boolean;
  onLogout?: () => void;
  requestCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, disabled, onLogout, requestCount = 0 }) => {
  const menuItems = [
    { name: 'Asosiy', icon: Icons.Home, view: View.HOME },
    { name: 'Qidiruv', icon: Icons.Search, view: View.SEARCH },
    { name: 'Ijtimoiy', icon: Icons.Users, view: View.SOCIAL, badge: requestCount },
    { name: 'Profil', icon: Icons.Profile, view: View.PROFILE },
    { name: 'Reyting', icon: Icons.Trophy, view: View.LEADERBOARD },
  ];

  return (
    <aside className={`fixed left-4 top-4 bottom-4 w-[110px] flex flex-col items-center py-8 z-50 ios-glass rounded-[40px] transition-all duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${disabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
      <div className="mb-12 cursor-pointer group" onClick={() => !disabled && setView(View.HOME)}>
        <Logo className="w-12 h-12 transition-transform duration-[1s]" glow={false} />
      </div>
      
      <nav className="flex flex-col gap-3 w-full px-2">
        {menuItems.map((item, index) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.name}
              disabled={disabled}
              onClick={() => setView(item.view)}
              className={`group relative flex flex-col items-center justify-center py-4 rounded-3xl transition-all duration-[0.8s] ease-[cubic-bezier(0.2,0.8,0.2,1)] animate-in fade-in slide-in-from-left-4 fill-mode-both`}
              style={{ animationDelay: `${index * 120}ms`, animationDuration: '1.2s' }}
            >
              <div className={`relative ${isActive ? 'scale-110 text-[#81b64c]' : 'text-white/40 group-hover:scale-105 group-hover:text-white'} transition-all duration-[0.8s] ease-[cubic-bezier(0.2,0.8,0.2,1)]`}>
                <item.icon />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] mt-2 font-black uppercase tracking-widest text-center px-1 transition-all duration-[0.8s] ${isActive ? 'text-white' : 'text-white/20'}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-[#81b64c] rounded-full animate-in fade-in slide-in-from-left-2 duration-1000"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
        {!disabled && (
           <button 
           onClick={onLogout} 
           className="w-full aspect-square flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500/20 hover:bg-red-500/30 hover:text-red-500 transition-all duration-700 group"
           title="Chiqish"
         >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-700">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
         </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
