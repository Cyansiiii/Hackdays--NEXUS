import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Flame,
  Layers3,
  Lightbulb,
  RefreshCw,
  ScanSearch,
  SearchX,
  Sparkles,
  Target,
} from 'lucide-react';

const TABS = [
  { id: 'exact',       icon: Target,       label: 'Exact Matches' },
  { id: 'semantic',    icon: ScanSearch,   label: 'Similar Questions' },
  { id: 'frequency',   icon: Layers3,      label: 'Topic Heatmap' },
  { id: 'evolution',   icon: RefreshCw,    label: 'Patterns' },
  { id: 'recommend',   icon: Lightbulb,    label: 'Recommendations' },
  { id: 'predicted',   icon: BrainCircuit, label: 'Predictions' },
];

export default function ResultsPage({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('exact');

  if (!data) return <div className="page"><p>No data.</p></div>;

  const years = data.years_analyzed ?? [];

  return (
    <main className="page results-page">
      <div className="results-container">

        {/* Header */}
        <motion.div
          className="results-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            <span className="gradient-text">{data.subject}</span> Analysis
          </h1>
          <div className="results-meta">
            <span className="meta-pill"><CalendarDays size={15} /> Years: {years.join(', ')}</span>
            <span className="meta-pill"><CircleHelp size={15} /> {data.total_questions_analyzed} questions analyzed</span>
            <span className="meta-pill"><Target size={15} /> {(data.exact_matches ?? []).length} exact matches found</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
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
        <div className="results-footer">
          <button className="btn-secondary" onClick={onReset}>
            <ArrowLeft size={17} /> Analyze Another Subject
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
      <h2 className="section-title"><Target size={20} /> Questions That Appeared Verbatim in Multiple Years</h2>
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
            <span className="freq-badge"><RefreshCw size={13} /> {q.frequency}x repeated</span>
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
      <h2 className="section-title"><ScanSearch size={20} /> Same Topic, Different Wording</h2>
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="question-card semantic glass"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="semantic-heading">
            <span>{s.pattern}</span>
            <span className="score-chip"><Sparkles size={12} /> {(s.similarity_score * 100).toFixed(0)}% similar</span>
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
      <h2 className="section-title"><Layers3 size={20} /> Topic Frequency Across Years</h2>
      <div className="table-shell">
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
    { key: 'trending',   className: 'trending',   icon: ArrowUpRight,   title: 'Trending Up',    items: ev.trending   ?? [] },
    { key: 'declining',  className: 'declining',  icon: ArrowDownRight, title: 'Declining',      items: ev.declining  ?? [] },
    { key: 'new_topics', className: 'new-topic',  icon: Flame,          title: 'New This Year',  items: ev.new_topics ?? [] },
    { key: 'consistent', className: 'consistent', icon: CheckCircle2,   title: 'Always Present', items: ev.consistent ?? [] },
  ];

  return (
    <>
      <h2 className="section-title"><RefreshCw size={20} /> How Topics Have Evolved Over the Years</h2>
      <div className="patterns-grid">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              className={`pattern-card ${c.className}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <h4><Icon size={17} /> {c.title}</h4>
              {c.items.length
                ? c.items.map((item, j) => <div key={j} className="pattern-item">{item}</div>)
                : <div className="pattern-item" style={{ fontStyle: 'italic' }}>None detected</div>}
            </motion.div>
          );
        })}
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
      <h2 className="section-title"><Lightbulb size={20} /> Your Personalized Study Recommendations</h2>
      {recs.map((r, i) => (
        <motion.div
          key={i}
          className="recommendation-card"
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
      <h2 className="section-title"><BrainCircuit size={20} /> Most Likely Questions for Your Next Exam</h2>
      <p className="section-subtitle">
        Based on frequency trends and topic evolution patterns across all analyzed papers.
      </p>
      {preds.map((q, i) => (
        <motion.div
          key={i}
          className="predicted-card"
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
    <div className="empty-state">
      <SearchX size={40} />
      <p>{msg}</p>
    </div>
  );
}
