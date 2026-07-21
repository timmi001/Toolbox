type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
};

export function BrandLogo({
  className = '',
  showText = true,
  textClassName = '',
  iconClassName = '',
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div
        className={`relative h-10 w-10 md:h-12 md:w-12 rounded-2xl p-[2px] shadow-md transition-all duration-300 ease-out ${iconClassName}`}
        style={{
          background: 'linear-gradient(135deg, #4285F4 0%, #34A853 35%, #FBBC05 70%, #EA4335 100%)',
        }}
      >
        <div className="h-full w-full rounded-[14px] bg-background/95 dark:bg-background/90 p-1.5">
          <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="brandGradientBlueGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="50%" stopColor="#34A853" />
                <stop offset="100%" stopColor="#EA4335" />
              </linearGradient>
              <linearGradient id="brandGradientYellowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBC05" />
                <stop offset="100%" stopColor="#EA4335" />
              </linearGradient>
            </defs>
            <rect x="7" y="7" width="22" height="22" rx="6" fill="url(#brandGradientBlueGreen)" opacity="0.95" />
            <rect x="35" y="7" width="22" height="22" rx="6" fill="url(#brandGradientYellowOrange)" opacity="0.95" />
            <rect x="7" y="35" width="22" height="22" rx="6" fill="url(#brandGradientYellowOrange)" opacity="0.95" />
            <rect x="35" y="35" width="22" height="22" rx="6" fill="url(#brandGradientBlueGreen)" opacity="0.95" />
            <path d="M20 20l24 24M44 20L20 44" stroke="rgba(255,255,255,0.8)" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {showText ? (
        <span
          className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335] bg-[length:200%_100%] transition-all duration-300 ease-out ${textClassName}`}
        >
          ToolboxX
        </span>
      ) : null}
    </div>
  );
}
