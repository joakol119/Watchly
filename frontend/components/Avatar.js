'use client';

export const AVATARS = [
  { key: 'cool', label: 'Cool' },
  { key: 'nerd', label: 'Nerd' },
  { key: 'ninja', label: 'Ninja' },
  { key: 'wizard', label: 'Mago' },
  { key: 'explorer', label: 'Explorador' },
  { key: 'chef', label: 'Chef' },
  { key: 'alien', label: 'Alien' },
  { key: 'pirate', label: 'Pirata' },
];

const svgs = {
  cool: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#f59e0b"/>
      <circle cx="40" cy="35" r="18" fill="#fde68a"/>
      <circle cx="40" cy="75" r="22" fill="#fde68a"/>
      {/* Sunglasses */}
      <rect x="22" y="28" width="13" height="9" rx="4" fill="#1e1b4b"/>
      <rect x="45" y="28" width="13" height="9" rx="4" fill="#1e1b4b"/>
      <line x1="35" y1="32" x2="45" y2="32" stroke="#1e1b4b" strokeWidth="2.5"/>
      <line x1="22" y1="32" x2="18" y2="31" stroke="#1e1b4b" strokeWidth="2.5"/>
      <line x1="58" y1="32" x2="62" y2="31" stroke="#1e1b4b" strokeWidth="2.5"/>
      {/* Smile */}
      <path d="M33 44 Q40 50 47 44" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Hair */}
      <ellipse cx="40" cy="17" rx="18" ry="8" fill="#92400e"/>
    </svg>
  ),
  nerd: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#6366f1"/>
      <circle cx="40" cy="35" r="18" fill="#e0e7ff"/>
      <circle cx="40" cy="75" r="22" fill="#e0e7ff"/>
      {/* Glasses */}
      <circle cx="31" cy="33" r="8" fill="none" stroke="#312e81" strokeWidth="2.5"/>
      <circle cx="49" cy="33" r="8" fill="none" stroke="#312e81" strokeWidth="2.5"/>
      <line x1="39" y1="33" x2="41" y2="33" stroke="#312e81" strokeWidth="2"/>
      <line x1="23" y1="33" x2="20" y2="31" stroke="#312e81" strokeWidth="2"/>
      <line x1="57" y1="33" x2="60" y2="31" stroke="#312e81" strokeWidth="2"/>
      {/* Eyes behind glasses */}
      <circle cx="31" cy="33" r="3" fill="#312e81"/>
      <circle cx="49" cy="33" r="3" fill="#312e81"/>
      {/* Smile */}
      <path d="M34 44 Q40 48 46 44" stroke="#312e81" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Hair */}
      <ellipse cx="40" cy="17" rx="18" ry="7" fill="#92400e"/>
      <rect x="22" y="17" width="36" height="6" fill="#92400e"/>
    </svg>
  ),
  ninja: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#1e293b"/>
      <circle cx="40" cy="35" r="18" fill="#334155"/>
      <circle cx="40" cy="75" r="22" fill="#334155"/>
      {/* Mask */}
      <rect x="22" y="34" width="36" height="16" rx="4" fill="#0f172a"/>
      {/* Eyes */}
      <ellipse cx="31" cy="30" rx="4" ry="3" fill="#ef4444"/>
      <ellipse cx="49" cy="30" rx="4" ry="3" fill="#ef4444"/>
      <circle cx="31" cy="30" r="2" fill="#7f1d1d"/>
      <circle cx="49" cy="30" r="2" fill="#7f1d1d"/>
      {/* Headband */}
      <rect x="22" y="18" width="36" height="7" rx="2" fill="#ef4444"/>
      <rect x="38" y="15" width="4" height="5" fill="#ef4444"/>
    </svg>
  ),
  wizard: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#7c3aed"/>
      <circle cx="40" cy="38" r="18" fill="#ede9fe"/>
      <circle cx="40" cy="75" r="22" fill="#ede9fe"/>
      {/* Eyes */}
      <circle cx="33" cy="35" r="4" fill="#4c1d95"/>
      <circle cx="47" cy="35" r="4" fill="#4c1d95"/>
      <circle cx="34" cy="34" r="1.5" fill="white"/>
      <circle cx="48" cy="34" r="1.5" fill="white"/>
      {/* Stars in eyes */}
      <circle cx="33" cy="35" r="1" fill="#fbbf24"/>
      <circle cx="47" cy="35" r="1" fill="#fbbf24"/>
      {/* Beard */}
      <ellipse cx="40" cy="48" rx="10" ry="6" fill="white"/>
      <ellipse cx="33" cy="50" rx="5" ry="4" fill="white"/>
      <ellipse cx="47" cy="50" rx="5" ry="4" fill="white"/>
      {/* Hat */}
      <polygon points="40,2 25,22 55,22" fill="#4c1d95"/>
      <rect x="20" y="22" width="40" height="6" rx="2" fill="#6d28d9"/>
      {/* Star on hat */}
      <polygon points="40,8 41.5,12.5 46,12.5 42.5,15 44,19.5 40,17 36,19.5 37.5,15 34,12.5 38.5,12.5" fill="#fbbf24"/>
    </svg>
  ),
  explorer: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#16a34a"/>
      <circle cx="40" cy="36" r="18" fill="#d1fae5"/>
      <circle cx="40" cy="75" r="22" fill="#d1fae5"/>
      {/* Eyes */}
      <circle cx="33" cy="33" r="4" fill="#064e3b"/>
      <circle cx="47" cy="33" r="4" fill="#064e3b"/>
      <circle cx="34" cy="32" r="1.5" fill="white"/>
      <circle cx="48" cy="32" r="1.5" fill="white"/>
      {/* Smile */}
      <path d="M33 43 Q40 49 47 43" stroke="#064e3b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Explorer hat */}
      <ellipse cx="40" cy="20" rx="22" ry="5" fill="#92400e"/>
      <ellipse cx="40" cy="18" rx="14" ry="9" fill="#b45309"/>
      <rect x="26" y="15" width="28" height="5" rx="1" fill="#b45309"/>
    </svg>
  ),
  chef: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#dc2626"/>
      <circle cx="40" cy="38" r="18" fill="#fef3c7"/>
      <circle cx="40" cy="75" r="22" fill="#fef3c7"/>
      {/* Eyes */}
      <circle cx="33" cy="35" r="4" fill="#78350f"/>
      <circle cx="47" cy="35" r="4" fill="#78350f"/>
      <circle cx="34" cy="34" r="1.5" fill="white"/>
      <circle cx="48" cy="34" r="1.5" fill="white"/>
      {/* Happy smile */}
      <path d="M32 44 Q40 52 48 44" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Mustache */}
      <path d="M33 41 Q37 39 40 41 Q43 39 47 41" stroke="#78350f" strokeWidth="2" fill="none"/>
      {/* Chef hat */}
      <rect x="27" y="14" width="26" height="6" rx="2" fill="white"/>
      <ellipse cx="40" cy="12" rx="13" ry="8" fill="white"/>
      <ellipse cx="32" cy="10" rx="6" ry="6" fill="white"/>
      <ellipse cx="48" cy="10" rx="6" ry="6" fill="white"/>
    </svg>
  ),
  alien: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#0d9488"/>
      <ellipse cx="40" cy="38" rx="20" ry="22" fill="#99f6e4"/>
      <circle cx="40" cy="75" r="22" fill="#99f6e4"/>
      {/* Big alien eyes */}
      <ellipse cx="31" cy="32" rx="8" ry="10" fill="#0d9488"/>
      <ellipse cx="49" cy="32" rx="8" ry="10" fill="#0d9488"/>
      <ellipse cx="31" cy="32" rx="5" ry="7" fill="#f0fdf4"/>
      <ellipse cx="49" cy="32" rx="5" ry="7" fill="#f0fdf4"/>
      <ellipse cx="31" cy="33" rx="3" ry="4" fill="#065f46"/>
      <ellipse cx="49" cy="33" rx="3" ry="4" fill="#065f46"/>
      <circle cx="32" cy="31" r="1.5" fill="white"/>
      <circle cx="50" cy="31" r="1.5" fill="white"/>
      {/* Small mouth */}
      <path d="M36 47 Q40 50 44 47" stroke="#065f46" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Antennae */}
      <line x1="33" y1="16" x2="28" y2="6" stroke="#0d9488" strokeWidth="2.5"/>
      <circle cx="27" cy="5" r="3" fill="#5eead4"/>
      <line x1="47" y1="16" x2="52" y2="6" stroke="#0d9488" strokeWidth="2.5"/>
      <circle cx="53" cy="5" r="3" fill="#5eead4"/>
    </svg>
  ),
  pirate: (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#92400e"/>
      <circle cx="40" cy="36" r="18" fill="#fde68a"/>
      <circle cx="40" cy="75" r="22" fill="#fde68a"/>
      {/* Eye patch */}
      <ellipse cx="33" cy="32" rx="8" ry="7" fill="#1c1917"/>
      <line x1="25" y1="30" x2="41" y2="30" stroke="#1c1917" strokeWidth="2.5"/>
      {/* Normal eye */}
      <circle cx="47" cy="33" r="4" fill="#78350f"/>
      <circle cx="48" cy="32" r="1.5" fill="white"/>
      {/* Smile */}
      <path d="M33 44 Q40 50 47 44" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Scar */}
      <line x1="34" y1="38" x2="37" y2="46" stroke="#b45309" strokeWidth="1.5"/>
      {/* Hat */}
      <ellipse cx="40" cy="20" rx="20" ry="5" fill="#1c1917"/>
      <polygon points="40,2 26,20 54,20" fill="#1c1917"/>
      <circle cx="40" cy="12" r="4" fill="#dc2626"/>
      <line x1="37" y1="9" x2="43" y2="15" stroke="#fbbf24" strokeWidth="1.5"/>
      <line x1="43" y1="9" x2="37" y2="15" stroke="#fbbf24" strokeWidth="1.5"/>
    </svg>
  ),
};

export function getAvatarSvg(key) {
  return svgs[key] || svgs['cool'];
}

export default function Avatar({ avatarKey = 'cool', size = 34, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        {getAvatarSvg(avatarKey)}
      </div>
    </div>
  );
}
