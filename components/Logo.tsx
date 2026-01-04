
import React from 'react';

interface LogoProps {
  className?: string;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-16 h-16", glow = true }) => {
  return (
    <div className={`relative ${className} group cursor-pointer`}>
      {glow && (
        <div className="absolute inset-0 bg-[#81b64c]/30 blur-[60px] rounded-full scale-150 animate-pulse duration-[4s]"></div>
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-1000 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="20" y1="16" x2="80" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4a4844" />
            <stop offset="1" stopColor="#1a1816" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path
          d="M20 25C20 20 24 16 29 16H71C76 16 80 20 80 25V55C80 72 65 82 50 88C35 82 20 72 20 55V25Z"
          fill="url(#shieldGradient)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        
        <path d="M35 85H65L68 92H32L35 85Z" fill="#5b8a32" />
        <rect x="38" y="80" width="24" height="6" rx="1" fill="#81b64c" filter="url(#glow)" />

        <g className="transition-all duration-1000 group-hover:translate-y-[-2px]">
          <path d="M40 35L50 60L35 55L40 35Z" fill="white" />
          <path d="M60 35L50 60L65 55L60 35Z" fill="white" />
          <path d="M48 60L50 65L52 60H48Z" fill="white" />
          <path d="M44 25L50 20L56 25L50 22L44 25Z" fill="#81b64c" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
