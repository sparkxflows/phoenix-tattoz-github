import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const PERMANENT_LOGO_URL = '/assets/aistudio/unnamed__3__df6a950e.png';
export const FALLBACK_LOGO_URL = '/logo.png';

export const PhoenixLogo: React.FC<LogoProps> = ({ className = '', size = 52 }) => {
  const [useFallback, setUseFallback] = useState(false);
  const [svgFallback, setSvgFallback] = useState(false);

  const imgSrc = useFallback ? FALLBACK_LOGO_URL : PERMANENT_LOGO_URL;

  if (!svgFallback) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center select-none rounded-full overflow-hidden transition-all duration-300 hover:scale-105 shadow-md shadow-black/50 ring-2 ring-[#FFD60A] bg-[#FFD60A] shrink-0 aspect-square ${className}`}
        style={{ 
          width: size, 
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
        }}
      >
        <img
          src={imgSrc}
          alt="Phoenix Tattooz Studio & Academy Logo"
          className="w-full h-full object-cover rounded-full select-none block"
          style={{ width: '100%', height: '100%', aspectRatio: '1/1' }}
          loading="eager"
          decoding="async"
          onError={() => {
            if (!useFallback) {
              setUseFallback(true);
            } else {
              setSvgFallback(true);
            }
          }}
        />
      </div>
    );
  }

  // Default Fallback: Original Phoenix Tattooz Circular Seal
  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full select-none transition-transform duration-300 hover:scale-105 aspect-square shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="96" fill="#FFD60A" />
        
        {/* Outer and inner borders */}
        <circle cx="100" cy="100" r="92" stroke="#0B0B0B" strokeWidth="3" />
        <circle cx="100" cy="100" r="86" stroke="#0B0B0B" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="66" stroke="#0B0B0B" strokeWidth="2.5" />
        
        {/* Top curved text path */}
        <path
          id="textPathTop"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
        />
        <text
          fill="#0B0B0B"
          fontSize="12.5"
          fontWeight="900"
          letterSpacing="2.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            PHOENIX TATTOOZ
          </textPath>
        </text>

        {/* Bottom curved text path */}
        <path
          id="textPathBottom"
          d="M 166 108 A 72 72 0 0 1 34 108"
          fill="none"
        />
        <text
          fill="#0B0B0B"
          fontSize="10"
          fontWeight="800"
          letterSpacing="3"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            ★ SINCE 2019 ★
          </textPath>
        </text>

        {/* Center Stylized Phoenix Silhouette */}
        <g transform="translate(100, 104) scale(0.68) translate(-100, -100)" fill="#0B0B0B">
          {/* Head & Crown */}
          <path d="M100 48 L104 60 L112 52 L106 66 L116 64 L105 73 L100 80 L95 73 L84 64 L94 66 L88 52 L96 60 Z" />
          
          {/* Center Body & Chest */}
          <path d="M100 78 C94 88, 92 100, 95 116 C97 122, 100 130, 100 134 C100 130, 103 122, 105 116 C108 100, 106 88, 100 78 Z" />
          
          {/* Left Wing */}
          <path d="M92 84 C80 80, 58 72, 42 86 C54 88, 68 94, 76 102 C60 98, 48 104, 38 116 C52 114, 66 118, 74 126 C62 124, 52 130, 46 142 C60 138, 74 140, 84 146 C88 136, 92 120, 94 108 Z" />
          
          {/* Right Wing */}
          <path d="M108 84 C120 80, 142 72, 158 86 C146 88, 132 94, 124 102 C140 98, 152 104, 162 116 C148 114, 134 118, 126 126 C138 124, 148 130, 154 142 C140 138, 126 140, 116 146 C112 136, 108 120, 106 108 Z" />
          
          {/* Majestic Tail Flames */}
          <path d="M96 136 C92 148, 86 160, 78 170 C88 164, 94 154, 98 144 Z" />
          <path d="M104 136 C108 148, 114 160, 122 170 C112 164, 106 154, 102 144 Z" />
          <path d="M99 140 L100 178 L101 140 Z" />
        </g>
      </svg>
    </div>
  );
};
