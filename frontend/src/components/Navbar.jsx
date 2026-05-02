export default function Navbar({ onReset, showReset }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="logo-icon">✦</div>
        <span className="gradient-text">NEXUS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Gemini 1.5 Flash</span>
        {showReset && (
          <button
            onClick={onReset}
            style={{
              padding: '8px 18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            ← New Analysis
          </button>
        )}
      </div>
    </nav>
  );
}
