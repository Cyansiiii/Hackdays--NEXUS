import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILES = 8;

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
    <main className="page">
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
              className="error-box glass"
              style={{ marginBottom: 24 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          className="upload-form glass"
          style={{ padding: 32, borderRadius: 'var(--radius-xl)' }}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Subject */}
          <div className="form-group">
            <label>Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Engineering Mathematics, Physics, DBMS…"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Drop Zone */}
          <div className="form-group">
            <label>Question Papers (PDF)</label>
            <div
              className={`dropzone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <span className="dropzone-icon">📄</span>
              <p className="dropzone-title">Drop PDFs here or click to browse</p>
              <p className="dropzone-sub">Upload 2–{MAX_FILES} question papers from different years</p>
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
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <div className="file-name">{entry.file.name}</div>
                      <div className="file-size">{fmtSize(entry.file.size)}</div>
                    </div>
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
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => handleRemove(entry.id)}
                      title="Remove file"
                    >✕</button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}
            whileHover={{ scale: 1.01 }}
          >
            <button
              type="submit"
              className="btn-primary"
              disabled={fileEntries.length < 2 || !subject.trim()}
              style={{ padding: '16px 48px', fontSize: 16 }}
            >
              ✦ Analyze with Gemini
            </button>
          </motion.div>

          {fileEntries.length < 2 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Upload at least 2 papers to start analysis
            </p>
          )}
        </motion.form>

        {/* Feature Pills */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 32 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: '🎯', text: 'Exact question matches' },
            { icon: '🔗', text: 'Semantic patterns' },
            { icon: '📊', text: 'Topic frequency' },
            { icon: '🔮', text: 'Predicted questions' },
          ].map(f => (
            <div key={f.text} className="glass" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 100,
              fontSize: 13, color: 'var(--text-secondary)',
            }}>
              {f.icon} {f.text}
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
