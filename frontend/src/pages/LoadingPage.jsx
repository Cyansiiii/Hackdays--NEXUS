import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { label: 'Uploading PDFs to Gemini File API…', dur: 4000 },
  { label: 'Gemini is reading all papers simultaneously…', dur: 6000 },
  { label: 'Extracting exact and semantic matches…', dur: 5000 },
  { label: 'Building topic frequency map…', dur: 4000 },
  { label: 'Predicting questions & generating study plan…', dur: 4000 },
];

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = [];
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      elapsed += step.dur;
      const t = setTimeout(() => {
        setCurrentStep(s => Math.max(s, i + 1));
      }, elapsed);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="loading-page">
      {/* Spinning orb */}
      <motion.div
        className="loading-orb"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        style={{ animation: 'none' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Gemini is analyzing your papers…</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 10, textAlign: 'center' }}>
          Sit tight — Gemini 1.5 Flash is reading all your PDFs natively
          and finding patterns across years.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="loading-steps">
        <AnimatePresence>
          {STEPS.map((step, i) => {
            const status =
              i < currentStep ? 'done' :
              i === currentStep ? 'active' : 'pending';

            return (
              <motion.div
                key={i}
                className={`loading-step ${status}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <span style={{ fontSize: 16 }}>
                  {status === 'done' ? '✅' : status === 'active' ? '⚡' : '○'}
                </span>
                <span>{step.label}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        This may take 20–60 seconds depending on paper length
      </p>
    </div>
  );
}
