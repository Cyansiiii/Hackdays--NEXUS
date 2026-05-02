import { RotateCcw, Sparkles } from 'lucide-react';

export default function Navbar({ onReset, showReset }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="logo-icon"><Sparkles size={17} strokeWidth={2.4} /></div>
        <span className="gradient-text">NEXUS</span>
      </div>
      <div className="navbar-actions">
        <span className="navbar-chip">Powered by Gemini 2.5 Flash</span>
        {showReset && (
          <button className="btn-secondary btn-compact" onClick={onReset}>
            <RotateCcw size={15} /> New Analysis
          </button>
        )}
      </div>
    </nav>
  );
}
