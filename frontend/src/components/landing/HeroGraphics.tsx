/** SVG filter for smooth glow — avoids CSS drop-shadow pixelation on some devices */
const heroGlowFilter = (id: string) => (
  <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

export function HeroShield() {
  return (
    <div className="hero-shield absolute left-0 top-0 h-[100vh] w-[50vw] overflow-hidden pointer-events-none [backface-visibility:hidden]">
      <div
        className="hero-graphic absolute left-0 top-0 h-[100vh] w-[100vmin] transition-all duration-300"
        style={{ transform: "translateX(-50%) translateZ(0)" }}
      >
        <svg viewBox="0 0 56 56" className="h-full w-full" shapeRendering="geometricPrecision">
          <defs>
            {heroGlowFilter("heroGlowShield")}
            <linearGradient id="heroShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFAA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <g filter="url(#heroGlowShield)">
          <path
            fill="none"
            stroke="url(#heroShieldGrad)"
            strokeWidth={1.5}
            vectorEffect="nonScalingStroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M27.988 51.672c.375 0 .985-.14 1.594-.469c13.313-7.476 17.906-10.64 17.906-19.195v-17.93c0-2.46-1.078-3.234-3.047-4.078c-2.765-1.148-11.718-4.36-14.484-5.32c-.633-.211-1.289-.352-1.969-.352c-.656 0-1.312.188-1.945.352c-2.766.843-11.719 4.195-14.484 5.32c-1.97.82-3.047 1.617-3.047 4.078v17.93c0 8.554 4.617 11.695 17.906 19.195c.61.328 1.195.469 1.57.469m0-4.266c-.351 0-.75-.14-1.453-.562c-10.828-6.563-14.297-8.485-14.297-15.703V14.78c0-.797.164-1.101.797-1.36c3.563-1.405 10.43-3.843 14.04-5.132c.35-.14.656-.21.913-.21c.282 0 .563.07.938.21c3.61 1.29 10.406 3.89 14.039 5.133c.633.234.797.562.797 1.36V31.14c0 7.218-3.492 9.117-14.297 15.703c-.703.422-1.102.562-1.477.562m-2.93-8.32c.797 0 1.43-.375 1.899-1.125l11.578-18.21c.305-.445.586-.984.586-1.5c0-1.078-.96-1.758-1.945-1.758c-.61 0-1.196.375-1.617 1.078L24.965 34.516l-5.438-7.055c-.539-.68-1.078-.938-1.734-.938c-1.031 0-1.828.82-1.828 1.875c0 .516.21 1.032.539 1.477l6.539 8.11c.656.75 1.242 1.101 2.016 1.101"
          />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function HeroBug() {
  return (
    <div className="hero-bug absolute right-0 top-0 h-[100vh] w-[50vw] overflow-hidden pointer-events-none [backface-visibility:hidden]">
      <div
        className="hero-graphic absolute right-0 top-0 h-[100vh] w-[100vmin] transition-all duration-300"
        style={{ transform: "translateX(50%) translateZ(0)" }}
      >
        <svg viewBox="0 0 56 56" className="h-full w-full" shapeRendering="geometricPrecision">
          <defs>
            {heroGlowFilter("heroGlowBug")}
            <linearGradient id="heroBugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#00FFAA" />
            </linearGradient>
          </defs>
          <g filter="url(#heroGlowBug)">
          <path
            fill="none"
            stroke="url(#heroBugGrad)"
            strokeWidth={1.5}
            vectorEffect="nonScalingStroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m0-3.984C16.937 47.922 8.1 39.062 8.1 28c0-11.04 8.813-19.922 19.876-19.922c11.039 0 19.921 8.883 19.945 19.922c.023 11.063-8.883 19.922-19.922 19.922m0-4.688c3.703 0 6.937-4.007 6.937-8.297c0-.703-.093-1.265-.351-1.734c.398.094.773.188 1.148.305c.914.234 1.172.61 1.055 1.406l-.961 6.305c-.14.726.328 1.195.961 1.195c.61 0 .914-.398 1.008-1.055l1.054-6.82c.282-1.523-.351-2.367-2.039-2.789l-5.789-1.36v-.14c.586-.281.938-.82 1.102-1.43l3.914-.562c1.64-.235 2.367-1.149 2.367-2.742v-4.547c0-.633-.351-1.008-1.008-1.008c-.609 0-.96.375-.96 1.008v4.125c0 .937-.516 1.242-1.36 1.383l-2.883.398a1.849 1.849 0 0 0-.773-1.008v-.14c2.273-.422 3.375-1.758 3.375-3.774a6.706 6.706 0 0 0-1.664-4.406l.117-.094c1.289-.937 1.5-2.297.656-3.726l-.773-1.29c-.258-.445-.54-.632-.961-.632c-.54 0-.914.375-.914.89a1 1 0 0 0 .164.61l.703 1.078c.398.61.539 1.195.047 1.617a3.16 3.16 0 0 0-.352.305c-1.148-.75-2.555-1.172-3.82-1.172c-1.336 0-2.742.422-3.773 1.172a5.174 5.174 0 0 1-.352-.328c-.398-.352-.398-.915.023-1.594l.703-1.078c.141-.235.188-.375.188-.61c0-.515-.399-.89-.938-.89c-.398 0-.68.187-.914.633l-.82 1.289c-.82 1.43-.68 2.953.68 3.726l.093.07a6.742 6.742 0 0 0-1.687 4.43c0 2.016 1.102 3.352 3.352 3.774v.14a1.92 1.92 0 0 0-.75 1.008l-2.883-.398c-.867-.141-1.36-.446-1.36-1.383v-4.125c0-.633-.351-1.008-.984-1.008s-1.008.375-1.008 1.008v4.547c0 1.593.75 2.507 2.39 2.742l3.891.562c.165.61.54 1.149 1.102 1.43v.14l-5.789 1.36c-1.664.422-2.297 1.266-2.04 2.789l1.056 6.82c.117.657.398 1.055 1.03 1.055c.61 0 1.079-.469.938-1.195l-.96-6.305c-.118-.797.14-1.172 1.054-1.406c.398-.117.773-.211 1.148-.305c-.234.469-.351 1.031-.351 1.734c0 4.29 3.234 8.297 6.96 8.297"
          />
          </g>
        </svg>
      </div>
    </div>
  );
}
