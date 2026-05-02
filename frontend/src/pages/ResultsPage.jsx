import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'exact',       icon: '🎯', label: 'Exact Matches' },
  { id: 'semantic',    icon: '🔗', label: 'Similar Questions' },
  { id: 'frequency',   icon: '📊', label: 'Topic Heatmap' },
  { id: 'evolution',   icon: '🔄', label: 'Patterns' },
  { id: 'recommend',   icon: '💡', label: 'Recommendations' },
  { id: 'predicted',   icon: '🔮', label: 'Predictions' },
];

export default function ResultsPage({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('exact');

  if (!data) return <div className="page"><p>No data.</p></div>;

  const years = data.years_analyzed ?? [];

  return (
    <main className="page">
      <div className="results-container">

        {/* Header */}
        <motion.div
          className="results-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            <span className="gradient-text">{data.subject}</span> — Analysis
          </h1>
          <div className="results-meta">
            <span className="meta-pill">📅 Years: {years.join(', ')}</span>
            <span className="meta-pill">❓ {data.total_questions_analyzed} questions analyzed</span>
            <span className="meta-pill">🎯 {(data.exact_matches ?? []).length} exact matches found</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'exact'     && <ExactTab     data={data} />}
            {activeTab === 'semantic'  && <SemanticTab  data={data} />}
            {activeTab === 'frequency' && <FrequencyTab data={data} years={years} />}
            {activeTab === 'evolution' && <EvolutionTab data={data} />}
            {activeTab === 'recommend' && <RecommendTab data={data} />}
            {activeTab === 'predicted' && <PredictedTab data={data} />}
          </motion.div>
        </AnimatePresence>

        {/* Footer CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-primary" onClick={onReset} style={{ opacity: 0.75 }}>
            ← Analyze Another Subject
          </button>
        </div>
      </div>
    </main>
  );
}

/* ─── Tab: Exact Matches ─── */
function ExactTab({ data }) {
  const items = data.exact_matches ?? [];
  if (!items.length) return <Empty msg="No exact repeated questions found across the uploaded papers." />;

  return (
    <>
      <h2 className="section-title">🎯 Questions That Appeared Verbatim in Multiple Years</h2>
      {items.map((q, i) => (
        <motion.div
          key={i}
          className="question-card exact glass"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <p className="question-text">{q.question}</p>
          <div className="question-meta">
            {(q.years ?? []).map(y => (
              <span key={y} className="badge badge-cyan">{y}</span>
            ))}
            <span className="freq-badge">🔁 {q.frequency}× repeated</span>
          </div>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Tab: Semantic Matches ─── */
function SemanticTab({ data }) {
  const items = data.semantic_matches ?? [];
  if (!items.length) return <Empty msg="No semantically similar question groups detected." />;

  return (
    <>
      <h2 className="section-title">🔗 Same Topic, Different Wording</h2>
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="question-card semantic glass"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{s.pattern}</span>
            <span className="score-chip">⚡ {(s.similarity_score * 100).toFixed(0)}% similar</span>
          </div>
          <div className="variation-block">
            {Object.entries(s.variations ?? {}).map(([year, text]) => (
              <div key={year} className="variation-row">
                <span className="year-tag">{year}</span>
                <span className="variation-text">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Tab: Topic Frequency ─── */
function FrequencyTab({ data, years }) {
  const topics = data.topic_frequency ?? [];
  if (!topics.length) return <Empty msg="Topic frequency data unavailable." />;

  const sorted = [...topics].sort((a, b) => b.total - a.total);

  return (
    <>
      <h2 className="section-title">📊 Topic Frequency Across Years</h2>
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="freq-table">
          <thead>
            <tr>
              <th>Topic / Chapter</th>
              {years.map(y => <th key={y}>{y}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <td>{t.topic}</td>
                {years.map(y => (
                  <td key={y}>
                    {t.by_year?.[y] != null
                      ? <span className="freq-dot">{t.by_year[y]}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                ))}
                <td>{t.total}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Tab: Evolution Patterns ─── */
function EvolutionTab({ data }) {
  const ev = data.evolution_patterns ?? {};

  const cards = [
    { key: 'trending',   className: 'trending',   icon: '📈', title: 'Trending Up',    items: ev.trending   ?? [] },
    { key: 'declining',  className: 'declining',  icon: '📉', title: 'Declining',       items: ev.declining  ?? [] },
    { key: 'new_topics', className: 'new-topic',  icon: '🆕', title: 'New This Year',   items: ev.new_topics ?? [] },
    { key: 'consistent', className: 'consistent', icon: '✅', title: 'Always Present',  items: ev.consistent ?? [] },
  ];

  return (
    <>
      <h2 className="section-title">🔄 How Topics Have Evolved Over the Years</h2>
      <div className="patterns-grid">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            className={`pattern-card glass ${c.className}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <h4>{c.icon} {c.title}</h4>
            {c.items.length
              ? c.items.map((item, j) => <div key={j} className="pattern-item">{item}</div>)
              : <div className="pattern-item" style={{ fontStyle: 'italic' }}>None detected</div>}
          </motion.div>
        ))}
      </div>
    </>
  );
}

/* ─── Tab: Recommendations ─── */
function RecommendTab({ data }) {
  const recs = data.recommendations ?? [];
  if (!recs.length) return <Empty msg="No recommendations generated." />;

  return (
    <>
      <h2 className="section-title">💡 Your Personalized Study Recommendations</h2>
      {recs.map((r, i) => (
        <motion.div
          key={i}
          className="recommendation-card glass"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="rec-number">{i + 1}</div>
          <div className="rec-text">{r}</div>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Tab: Predicted Questions ─── */
function PredictedTab({ data }) {
  const preds = data.predicted_questions ?? [];
  if (!preds.length) return <Empty msg="No predicted questions generated." />;

  return (
    <>
      <h2 className="section-title">🔮 Most Likely Questions for Your Next Exam</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Based on frequency trends and topic evolution patterns across all analyzed papers.
      </p>
      {preds.map((q, i) => (
        <motion.div
          key={i}
          className="predicted-card glass"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <span className="predicted-rank">#{i + 1}</span>
          <span className="predicted-q-text">{q}</span>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Empty State ─── */
function Empty({ msg }) {
  return (
    <div className="empty-state glass" style={{ borderRadius: 'var(--radius-lg)', padding: 56 }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🌙</div>
      <p>{msg}</p>
    </div>
  );
}
