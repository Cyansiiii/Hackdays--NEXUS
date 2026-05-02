import { useRef, useEffect } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import heroVideo from '../assets/hero.mp4';

export default function HeroPage({ onDashboardClick }) {
  const videoRef = useRef(null);
  const fadingOutRef = useRef(false);
  const rafRef = useRef(null);

  // Cancel any running rAF animation
  const cancelFade = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Fade from current opacity to target over `duration` ms
  const fade = (el, target, duration, onComplete) => {
    cancelFade();
    const start = el.style.opacity !== '' ? parseFloat(el.style.opacity) : target === 1 ? 0 : 1;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      el.style.opacity = String(start + (target - start) * progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initial load: start invisible, fade in once ready
    video.style.opacity = '0';
    fadingOutRef.current = false;

    const handleCanPlay = () => {
      fade(video, 1, 500);
    };

    const handleTimeUpdate = () => {
      if (!video) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fade(video, 0, 500);
      }
    };

    const handleEnded = () => {
      cancelFade();
      video.style.opacity = '0';
      fadingOutRef.current = false;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().then(() => {
          fade(video, 1, 500);
        });
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      cancelFade();
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col">
      {/* ── Full-screen background video ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={heroVideo}
          className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
          autoPlay
          muted
          playsInline
          style={{ opacity: 0 }}
        />
        {/* Subtle dark vignette to reinforce cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* ── Navigation bar ── */}
      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          {/* Left: logo + links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-white" />
              <span className="text-white font-semibold text-lg">NEXUS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={onDashboardClick}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
              >
                Dashboard
              </button>
              {['Features', 'About'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Right: auth buttons */}
          <div className="flex items-center gap-4">
            <button className="text-white text-sm font-medium hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer">
              Sign Up
            </button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors border-none cursor-pointer">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        {/* Heading */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the Students
        </h1>

        {/* Email + subtitle + manifesto */}
        <div className="max-w-xl w-full space-y-4">
          {/* Email input bar */}
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none min-w-0"
            />
            <button className="bg-white rounded-full p-3 text-black flex-shrink-0 hover:bg-white/90 transition-colors border-none cursor-pointer">
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-white text-sm leading-relaxed px-4 text-white/70">
            NEXUS is a full-stack AI tool that analyzes previous year question papers (PYQs) and returns detailed topic frequencies, semantic patterns, and predictive exam insights.
          </p>

          {/* Manifesto button */}
          <div className="flex justify-center mt-6">
            <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors border-none cursor-pointer">
              Read the Manifesto
            </button>
          </div>
        </div>
      </main>

      {/* ── Social icons footer ── */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        <button
          aria-label="Instagram"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </button>
        <button
          aria-label="Twitter"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </button>
        <button
          aria-label="Website"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all border-none cursor-pointer"
        >
          <Globe size={20} />
        </button>
      </div>
    </div>
  );
}
