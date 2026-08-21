import React from 'react';

interface SubjectIconProps {
  type: string;
  className?: string;
}

export const SubjectNeonIcon: React.FC<SubjectIconProps> = ({ type, className = "w-20 h-20" }) => {
  switch (type) {
    case 'microscope':
      // البيولوجيا - Glowing Neon Microscope
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="teal-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="50%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Eyepiece / Tube */}
          <path
            d="M58 20L44 42"
            stroke="url(#teal-grad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#glow-teal)"
          />
          <ellipse cx="60" cy="18" rx="6" ry="3" fill="#E0F2FE" filter="url(#glow-teal)" />
          
          {/* Microscope Body Arm */}
          <path
            d="M44 42C36 40 28 48 28 60C28 72 38 78 50 78H54"
            stroke="url(#teal-grad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            filter="url(#glow-teal)"
          />

          {/* Objective revolving nosepiece */}
          <rect x="42" y="44" width="8" height="6" rx="2" fill="#38BDF8" filter="url(#glow-teal)" />
          <path d="M44 50L40 57M48 50L50 57" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />

          {/* Stage Platform */}
          <path d="M34 62H64" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" filter="url(#glow-teal)" />
          
          {/* Substage Condenser / Mirror */}
          <circle cx="48" cy="70" r="4" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />

          {/* Base Stand */}
          <path
            d="M26 84H74C74 84 76 88 70 88H30C24 88 26 84 26 84Z"
            fill="#0F766E"
            stroke="#2DD4BF"
            strokeWidth="3"
            filter="url(#glow-teal)"
          />

          {/* Light Glow Beam */}
          <line x1="48" y1="56" x2="48" y2="62" stroke="#67E8F9" strokeWidth="2" strokeDasharray="1 2" />
        </svg>
      );

    case 'atom':
      // الفيزياء - Glowing Neon Particle Atom
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-atom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="nucleus-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#BE185D" />
            </radialGradient>
          </defs>

          {/* Orbit 1 - Horizontal */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="13"
            stroke="#60A5FA"
            strokeWidth="3"
            fill="none"
            filter="url(#glow-atom)"
          />
          {/* Electron 1 */}
          <circle cx="86" cy="50" r="3.5" fill="#93C5FD" filter="url(#glow-atom)" />

          {/* Orbit 2 - Diagonal 60 deg */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="13"
            transform="rotate(60 50 50)"
            stroke="#38BDF8"
            strokeWidth="3"
            fill="none"
            filter="url(#glow-atom)"
          />
          {/* Electron 2 */}
          <circle cx="32" cy="19" r="3.5" fill="#38BDF8" filter="url(#glow-atom)" />

          {/* Orbit 3 - Diagonal -60 deg */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="13"
            transform="rotate(-60 50 50)"
            stroke="#C084FC"
            strokeWidth="3"
            fill="none"
            filter="url(#glow-atom)"
          />
          {/* Electron 3 */}
          <circle cx="68" cy="81" r="3.5" fill="#E879F9" filter="url(#glow-atom)" />

          {/* Nucleus Glowing Sphere */}
          <circle cx="50" cy="50" r="9" fill="url(#nucleus-grad)" filter="url(#glow-atom)" />
          <circle cx="48" cy="48" r="3" fill="#FDF2F8" opacity="0.8" />
        </svg>
      );

    case 'flasks':
      // الكيمياء - Glowing Chemistry Flasks & Burner
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-magenta" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="chem-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#E879F9" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>

          {/* Left Erlenmeyer Flask */}
          <path
            d="M34 32H42V42L52 68C53 71 51 75 47 75H29C25 75 23 71 24 68L34 42V32Z"
            stroke="#22D3EE"
            strokeWidth="3"
            fill="#06B6D4"
            fillOpacity="0.15"
            strokeLinejoin="round"
            filter="url(#glow-magenta)"
          />
          {/* Flask liquid */}
          <path
            d="M27 64L31 52H45L49 64C50 67 48 72 45 72H31C28 72 26 67 27 64Z"
            fill="#06B6D4"
            fillOpacity="0.6"
          />
          {/* Bubbles */}
          <circle cx="36" cy="58" r="2" fill="#E0F2FE" />
          <circle cx="42" cy="64" r="1.5" fill="#E0F2FE" />

          {/* Right Stand & Beaker */}
          <path d="M60 28V75M54 75H80" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M58 40H76" stroke="#38BDF8" strokeWidth="2.5" />

          {/* Beaker on stand */}
          <rect x="62" y="32" width="12" height="18" rx="2" stroke="#F472B6" strokeWidth="2.5" fill="#F43F5E" fillOpacity="0.2" />

          {/* Bunsen Burner underneath */}
          <ellipse cx="68" cy="70" rx="6" ry="2.5" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Flame */}
          <path
            d="M68 67C65 62 66 57 68 53C70 57 71 62 68 67Z"
            fill="#FBBF24"
            filter="url(#glow-magenta)"
          />
        </svg>
      );

    case 'math':
      // الرياضيات - Glowing Pi & Geometry Ruler
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="math-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Glowing Pi Symbol π */}
          <g filter="url(#glow-cyan)">
            {/* Pi Top Bar with curved ends */}
            <path
              d="M18 36C22 35 48 35 52 33"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Left Pi Leg */}
            <path
              d="M26 36V62C26 65 24 67 20 67"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Pi Leg */}
            <path
              d="M44 36V64C44 67 47 68 50 66"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Glowing Triangle Set-Square Ruler */}
          <g filter="url(#glow-cyan)">
            <path
              d="M56 72L84 72L84 28L56 72Z"
              stroke="#67E8F9"
              strokeWidth="3.5"
              fill="#082F49"
              fillOpacity="0.5"
              strokeLinejoin="round"
            />
            {/* Inner Triangle cutout */}
            <path
              d="M66 67L79 67L79 46L66 67Z"
              stroke="#38BDF8"
              strokeWidth="2"
              fill="#0F172A"
            />
            {/* Measurement tick marks */}
            <line x1="84" y1="36" x2="80" y2="36" stroke="#BAE6FD" strokeWidth="2" />
            <line x1="84" y1="44" x2="80" y2="44" stroke="#BAE6FD" strokeWidth="2" />
            <line x1="84" y1="52" x2="80" y2="52" stroke="#BAE6FD" strokeWidth="2" />
            <line x1="84" y1="60" x2="80" y2="60" stroke="#BAE6FD" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'bookQuill':
      // اللغة العربية ج1 - Open Book & Feather Quill with script
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gold-amber-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Open Book Spine & Pages */}
          <g filter="url(#glow-amber)">
            {/* Left Page */}
            <path
              d="M50 68C40 64 24 64 16 68V48C24 44 40 44 50 48V68Z"
              fill="#78350F"
              fillOpacity="0.4"
              stroke="#FBBF24"
              strokeWidth="2.5"
            />
            {/* Right Page */}
            <path
              d="M50 68C60 64 76 64 84 68V48C76 44 60 44 50 48V68Z"
              fill="#78350F"
              fillOpacity="0.4"
              stroke="#FBBF24"
              strokeWidth="2.5"
            />
            {/* Center Spine */}
            <line x1="50" y1="48" x2="50" y2="72" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
            
            {/* Text lines */}
            <line x1="22" y1="53" x2="42" y2="53" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="22" y1="58" x2="40" y2="58" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="24" y1="63" x2="38" y2="63" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />

            <line x1="58" y1="53" x2="78" y2="53" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="60" y1="58" x2="78" y2="58" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="62" y1="63" x2="76" y2="63" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.7" />
          </g>

          {/* Feather Quill Pen */}
          <g filter="url(#glow-amber)">
            {/* Quill shaft */}
            <path
              d="M78 22C68 34 52 50 42 62"
              stroke="#FEF08A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Feather Vane */}
            <path
              d="M78 22C74 28 66 32 58 35C64 38 68 44 62 50C70 42 78 32 78 22Z"
              fill="url(#gold-amber-grad)"
            />
            {/* Calligraphic Flourish line */}
            <path
              d="M42 62C38 60 32 60 28 64C32 66 40 65 44 68"
              stroke="#FDE68A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'quranBookQuill':
      // اللغة العربية ج2 - Heritage Quran / Book & Golden Feather
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gold-cover" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
          </defs>

          {/* Perspective Book Cover */}
          <g filter="url(#glow-gold)">
            <path
              d="M24 40L54 28L68 58L38 72L24 40Z"
              fill="#713F12"
              stroke="#FACC15"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Book Pages thickness */}
            <path
              d="M38 72L44 75L74 61L68 58"
              fill="#FEF08A"
              stroke="#CA8A04"
              strokeWidth="2"
            />
            {/* Arabesque Gold Medallion on Cover */}
            <circle cx="45" cy="49" r="6" stroke="#FEF08A" strokeWidth="1.5" fill="#A16207" />
            <path d="M45 40V58M37 49H53" stroke="#FEF08A" strokeWidth="1" />
          </g>

          {/* Large Golden Feather Quill leaning across */}
          <g filter="url(#glow-gold)">
            <path
              d="M84 26C72 38 60 54 52 74"
              stroke="#FEF08A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Golden Feather plumage */}
            <path
              d="M84 26C80 34 72 40 62 45C68 48 72 56 64 64C74 54 84 40 84 26Z"
              fill="url(#gold-cover)"
            />
          </g>
        </svg>
      );

    case 'mosque':
      // التربية الإسلامية - Glowing Mosque Dome & Minaret
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-mosque" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="sky-dome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>

          {/* Main Mosque Dome */}
          <g filter="url(#glow-mosque)">
            {/* Central Large Dome */}
            <path
              d="M38 72V58C38 46 54 36 54 30C54 36 70 46 70 58V72H38Z"
              fill="url(#sky-dome)"
              fillOpacity="0.4"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Golden Crescent on top of Dome */}
            <circle cx="54" cy="24" r="4" stroke="#FDE047" strokeWidth="2" fill="none" />
            <circle cx="56" cy="23" r="3.2" fill="#0C1A2E" />

            {/* Left Tall Minaret */}
            <path
              d="M24 72V38H30V72"
              stroke="#FDE047"
              strokeWidth="2.5"
              fill="#1E293B"
            />
            {/* Minaret Balcony & Dome */}
            <rect x="22" y="44" width="10" height="3" rx="1" fill="#FDE047" />
            <path d="M24 38C24 33 27 28 27 28C27 28 30 33 30 38H24Z" fill="#FDE047" />
            <line x1="27" y1="28" x2="27" y2="24" stroke="#FDE047" strokeWidth="1.5" />

            {/* Small Side Dome */}
            <path
              d="M68 72V64C68 58 76 52 76 48C76 52 84 58 84 64V72H68Z"
              stroke="#38BDF8"
              strokeWidth="2"
              fill="#0369A1"
              fillOpacity="0.3"
            />

            {/* Arched Windows */}
            <path d="M50 72V64C50 62 52 60 54 60C56 60 58 62 58 64V72" stroke="#FDE047" strokeWidth="2" />
            <path d="M42 72V66C42 65 43 64 44 64C45 64 46 65 46 66V72" stroke="#7DD3FC" strokeWidth="1.5" />
            <path d="M62 72V66C62 65 63 64 64 64C65 64 66 65 66 66V72" stroke="#7DD3FC" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'englishBlocks':
      // اللغة الإنجليزية - ABC 3D Blocks & UK Flag
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ABC Blocks */}
          <g filter="url(#glow-orange)">
            {/* Block A (Cyan) */}
            <rect x="20" y="34" width="22" height="22" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
            <text x="31" y="50" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">A</text>

            {/* Block B (Rose / Coral) */}
            <rect x="14" y="56" width="20" height="20" rx="4" fill="#E11D48" stroke="#FB7185" strokeWidth="2" />
            <text x="24" y="71" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">B</text>

            {/* Block C (Emerald Green) */}
            <rect x="36" y="56" width="20" height="20" rx="4" fill="#059669" stroke="#34D399" strokeWidth="2" />
            <text x="46" y="71" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">C</text>
          </g>

          {/* UK Flag (Union Jack) Badge */}
          <g filter="url(#glow-orange)">
            <g clipPath="url(#flag-clip)">
              <rect x="54" y="40" width="34" height="24" rx="4" fill="#00247D" stroke="#FB923C" strokeWidth="2" />
              
              {/* White Diagonals */}
              <line x1="54" y1="40" x2="88" y2="64" stroke="#FFFFFF" strokeWidth="5" />
              <line x1="88" y1="40" x2="54" y2="64" stroke="#FFFFFF" strokeWidth="5" />
              
              {/* Red Diagonals */}
              <line x1="54" y1="40" x2="88" y2="64" stroke="#CF142B" strokeWidth="2" />
              <line x1="88" y1="40" x2="54" y2="64" stroke="#CF142B" strokeWidth="2" />

              {/* White St George Cross */}
              <line x1="71" y1="40" x2="71" y2="64" stroke="#FFFFFF" strokeWidth="7" />
              <line x1="54" y1="52" x2="88" y2="52" stroke="#FFFFFF" strokeWidth="7" />

              {/* Red St George Cross */}
              <line x1="71" y1="40" x2="71" y2="64" stroke="#CF142B" strokeWidth="4" />
              <line x1="54" y1="52" x2="88" y2="52" stroke="#CF142B" strokeWidth="4" />
            </g>
            <rect x="54" y="40" width="34" height="24" rx="4" fill="none" stroke="#FDBA74" strokeWidth="1.5" />
          </g>

          <clipPath id="flag-clip">
            <rect x="54" y="40" width="34" height="24" rx="4" />
          </clipPath>
        </svg>
      );

    default:
      return null;
  }
};
