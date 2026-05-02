import { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ResultsPage from './pages/ResultsPage';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [phase, setPhase] = useState('upload'); // 'upload' | 'loading' | 'results'
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async ({ subject, files }) => {
    setPhase('loading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      const years = files.map(f => f.year);
      formData.append('years', JSON.stringify(years));
      files.forEach(f => formData.append('files', f.file));

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errData.detail || 'Analysis failed');
      }

      const data = await res.json();
      setResults(data);
      setPhase('results');
    } catch (err) {
      setError(err.message);
      setPhase('upload');
    }
  };

  const handleReset = () => {
    setPhase('upload');
    setResults(null);
    setError(null);
  };

  return (
    <>
      <Navbar onReset={handleReset} showReset={phase === 'results'} />
      {phase === 'upload'   && <UploadPage onAnalyze={handleAnalyze} error={error} />}
      {phase === 'loading'  && <LoadingPage />}
      {phase === 'results'  && <ResultsPage data={results} onReset={handleReset} />}
    </>
  );
}
