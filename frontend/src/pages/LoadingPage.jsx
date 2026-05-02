import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Zap } from 'lucide-react';
import SpectraNoise from '../components/SpectraNoise';

const STEPS = [
  { label: 'Uploading PDFs to Gemini File API…', dur: 4000 },
  { label: 'Gemini is reading all papers simultaneously…', dur: 6000 },
  { label: 'Extracting exact and semantic matches…', dur: 5000 },
  { label: 'Building topic frequency map…', dur: 4000 },
  { label: 'Predicting questions & generating study plan…', dur: 4000 },
];

const LOADING_SPECTRA_COLORS = ['#050509', '#d44df0', '#ff7a3d'];

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
    <main className="page loading-page">
      <section className="loading-card premium-card">
        <div className="loading-noise">
          <SpectraNoise
            className="spectra-canvas"
            speed={0.62}
            noiseIntensity={0.2}
            scanlineIntensity={0.05}
            colors={LOADING_SPECTRA_COLORS}
          />
        </div>

        <motion.div
          className="loading-mark"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={28} />
        </motion.div>

        <motion.div
          className="loading-copy"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Gemini is analyzing your papers...</h2>
          <p>
            Gemini 2.5 Flash is reading your PDFs natively and finding patterns across years.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="loading-steps">
          <AnimatePresence>
            {STEPS.map((step, i) => {
              const status =
                i < currentStep ? 'done' :
                i === currentStep ? 'active' : 'pending';
              const Icon = status === 'done' ? CheckCircle2 : status === 'active' ? Zap : Circle;

              return (
                <motion.div
                  key={i}
                  className={`loading-step ${status}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Icon size={17} />
                  <span>{step.label}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <p className="helper-text">This may take 20-60 seconds depending on paper length</p>
      </section>
    </main>
  );
}
