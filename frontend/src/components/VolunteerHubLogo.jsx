import React from 'react';

export const VolunteerHubLogoIcon = ({ className = "w-9 h-9", size }) => (
  <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`} style={size ? { width: size, height: size } : {}}>
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-md"
    >
      <defs>
        <linearGradient id="vhBoldShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D61F2" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      {/* Outer Solid Royal Blue Shield Container */}
      <path 
        d="M32 4L10 13V28C10 43.5 20 56 32 60C44 56 54 43.5 54 28V13L32 4Z" 
        fill="url(#vhBoldShieldGrad)" 
      />

      {/* Bold Inner Shield Outline for High Visibility */}
      <path 
        d="M32 9.5L14.5 16.5V28.5C14.5 40.5 22.5 50.5 32 54C41.5 50.5 49.5 40.5 49.5 28.5V16.5L32 9.5Z" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Center High-Contrast White Impact Star */}
      <polygon points="32,19 34.8,25.5 41.5,26.2 36.4,30.7 37.9,37.3 32,33.8 26.1,37.3 27.6,30.7 22.5,26.2 29.2,25.5" fill="white" />

      {/* Dual Supporting Wings / Base Arc */}
      <path d="M22 41.5C25 44.5 39 44.5 42 41.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
);

const VolunteerHubLogo = ({ 
  showText = true, 
  textSize = "text-xl", 
  textColor = "text-slate-900", 
  badge = null,
  iconSize = "w-9 h-9",
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <VolunteerHubLogoIcon className={iconSize} />
      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight ${textSize} ${textColor}`}>
            Volunteer<span className="text-[#1D61F2]">Hub</span>
          </span>
          {badge && (
            <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerHubLogo;
