import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  FileText,
  Layers3,
  ScanSearch,
  Sparkles,
  Target,
  UploadCloud,
  WandSparkles,
  X,
} from 'lucide-react';
import SpectraNoise from '../components/SpectraNoise';

const MAX_FILES = 8;
const UPLOAD_SPECTRA_COLORS = ['#040706', '#89ff00', '#173718'];

export default function UploadPage({ onAnalyze, error }) {
  const [subject, setSubject] = useState('');
  const [fileEntries, setFileEntries] = useState([]); // [{id, file, year}]
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) return;
    setFileEntries(prev => {
      const remaining = MAX_FILES - prev.length;
      const toAdd = pdfs.slice(0, remaining).map((f, i) => ({
        id: Date.now() + i,
        file: f,
        year: new Date().getFullYear() - (prev.length + i),
      }));
      return [...prev, ...toAdd];
    });
  }, []);

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = id => setFileEntries(p => p.filter(f => f.id !== id));

  const handleYearChange = (id, val) => {
    setFileEntries(p => p.map(f => f.id === id ? { ...f, year: val } : f));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!subject.trim()) return alert('Please enter a subject name');
    if (fileEntries.length < 2) return alert('Upload at least 2 question papers');
    const missingYear = fileEntries.some(f => !String(f.year).match(/^\d{4}$/));
    if (missingYear) return alert('Each file needs a valid 4-digit year');
    onAnalyze({ subject: subject.trim(), files: fileEntries });
  };

  const fmtSize = bytes => bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

  return (
    <main className="page upload-page">
      <div className="upload-container">
        {/* Hero */}
        <motion.div
          className="upload-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>
            Analyze <span className="gradient-text">Question Papers</span>
            <br />with AI Intelligence
          </h1>
          <p>
            Upload PDFs from multiple years. Gemini reads all of them simultaneously and surfaces
            patterns, predictions & your personalized study plan.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-box"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="upload-workspace">
          {/* Form */}
          <motion.form
            className="upload-form premium-card"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Subject */}
            <div className="form-group">
              <div className="field-label-row">
                <label>Subject Name</label>
                <span className="field-hint">Required</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Engineering Mathematics, Physics, DBMS..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Drop Zone */}
            <div className="form-group">
              <div className="field-label-row">
                <label>Question Papers (PDF)</label>
                <span className="field-hint">{fileEntries.length}/{MAX_FILES}</span>
              </div>
              <div
                className={`dropzone${dragOver ? ' drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="file-input"
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
                <div className="dropzone-icon">
                  <UploadCloud size={34} strokeWidth={1.8} />
                </div>
                <p className="dropzone-title">Drop PDFs here or click to browse</p>
                <p className="dropzone-sub">Upload 2-{MAX_FILES} papers from different years</p>
              </div>
            </div>

            {/* File List */}
            <AnimatePresence>
              {fileEntries.length > 0 && (
                <motion.div
                  className="file-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {fileEntries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      className="file-entry"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <span className="file-icon"><FileText size={20} /></span>
                      <div className="file-info">
                        <div className="file-name">{entry.file.name}</div>
                        <div className="file-size">{fmtSize(entry.file.size)}</div>
                      </div>
                      <label className="year-field">
                        <CalendarDays size={14} />
                        <input
                          type="number"
                          className="file-year-input"
                          value={entry.year}
                          onChange={e => handleYearChange(entry.id, e.target.value)}
                          min="2000"
                          max="2030"
                          placeholder="Year"
                          title="Enter the exam year for this paper"
                        />
                      </label>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => handleRemove(entry.id)}
                        title="Remove file"
                        aria-label={`Remove ${entry.file.name}`}
                      >
                        <X size={17} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="form-footer">
              <button
                type="submit"
                className="btn-primary btn-wide"
                disabled={fileEntries.length < 2 || !subject.trim()}
              >
                <WandSparkles size={18} /> Analyze with Gemini <ArrowRight size={18} />
              </button>
              {fileEntries.length < 2 && (
                <p className="helper-text">Upload at least 2 papers to start analysis</p>
              )}
            </div>
          </motion.form>

          <motion.aside
            className="spectra-panel"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <SpectraNoise
              className="spectra-canvas"
              noiseIntensity={0.23}
              scanlineIntensity={0.06}
              warpAmount={0.8}
              colors={UPLOAD_SPECTRA_COLORS}
            />
            <div className="spectra-panel-overlay" />
            <div className="spectra-content">
              <span className="spectra-kicker"><Sparkles size={14} /> SpectraNoise workspace</span>
              <h2>Every paper becomes a pattern map.</h2>
              <p>
                NEXUS compares repeated wording, topic drift, and likely exam focus from the PDFs you add.
              </p>

              <div className="insight-grid">
                {[
                  { icon: Target, label: 'Exact matches', value: 'Verbatim repeats' },
                  { icon: ScanSearch, label: 'Semantic scan', value: 'Same idea, new wording' },
                  { icon: Layers3, label: 'Topic heatmap', value: 'Frequency by year' },
                  { icon: BrainCircuit, label: 'Predictions', value: 'Next-paper signals' },
                ].map(({ icon: Icon, label, value }) => (
                  <div className="insight-card" key={label}>
                    <Icon size={18} />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Feature Pills */}
        <motion.div
          className="feature-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Target, text: 'Exact question matches' },
            { icon: ScanSearch, text: 'Semantic patterns' },
            { icon: Layers3, text: 'Topic frequency' },
            { icon: BrainCircuit, text: 'Predicted questions' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="feature-pill">
              <Icon size={15} /> {text}
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
