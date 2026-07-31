import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, 
  History, 
  Copy, 
  Check, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Wrench, 
  Users, 
  Compass, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const AI = () => {
  const toast = useToast();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.ai.history();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load AI history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea || idea.trim().length < 10) {
      toast.error('Please enter an idea with at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.ai.analyze(idea);
      setActiveAnalysis(response.result);
      toast.success('Analysis generated successfully!');
      // Reload history
      fetchHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to generate innovation insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    setActiveAnalysis(item.result);
    setIdea(item.prompt);
  };

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(sectionId);
    toast.success(`${sectionId} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSectionText = (title, items) => {
    if (Array.isArray(items)) {
      return `${title}:\n` + items.map(i => `• ${i}`).join('\n');
    }
    return `${title}:\n${items}`;
  };

  const copyAll = () => {
    if (!activeAnalysis) return;
    const text = [
      formatSectionText('Commercialization', activeAnalysis.commercialization),
      formatSectionText('Potential Industries', activeAnalysis.industries),
      formatSectionText('Funding Suggestions', activeAnalysis.funding),
      formatSectionText('Improvements', activeAnalysis.improvements),
      formatSectionText('Research Impact', activeAnalysis.impact),
      formatSectionText('Possible Collaborators', activeAnalysis.collaborators),
      formatSectionText('TRL Suggestion', activeAnalysis.trl)
    ].join('\n\n');

    copyToClipboard(text, 'Full Analysis');
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="ai-layout">
        
        {/* Left Side: Input and History */}
        <div className="ai-sidebar-pane">
          <div className="glass-panel" style={{ marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={20} className="text-primary" style={{ color: 'var(--accent-primary)' }} />
              AI Innovation Strategy
            </h3>
            <p style={{ marginBottom: '1.25rem' }}>
              Enter your research or commercialization idea. Gemini will analyze industry potentials, funding routes, and collaborators.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="idea-input">Describe Your Research Idea</label>
                <textarea
                  id="idea-input"
                  className="textarea-field"
                  placeholder="e.g. A lightweight machine learning algorithm optimized for edge IoT devices to predict grid system anomaly surges..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  style={{ minHeight: '130px', fontFamily: 'inherit', fontSize: '0.88rem' }}
                  disabled={loading}
                />
                <span className="text-muted" style={{ fontSize: '0.75rem', alignSelf: 'flex-end', marginTop: '0.25rem' }}>
                  {idea.trim().length} chars (minimum 10)
                </span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading || idea.trim().length < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Analyzing Innovation...
                  </>
                ) : (
                  <>
                    Run Innovation Analysis
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <History size={18} />
              Recent Ideas
            </h3>
            
            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>No previous ideas submitted.</p>
              </div>
            ) : (
              <div className="ai-history-list" style={{ overflowY: 'auto', flex: 1 }}>
                {history.map((item) => (
                  <button 
                    key={item.id} 
                    className="ai-history-item"
                    onClick={() => handleSelectHistory(item)}
                  >
                    <span className="ai-history-prompt">{item.prompt}</span>
                    <span className="ai-history-date">{new Date(item.created_at).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Analysis Display */}
        <div className="ai-workspace-pane">
          {loading ? (
            <div className="glass-panel ai-skeleton-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
              <Loader2 className="animate-spin text-primary" size={40} style={{ color: 'var(--accent-primary)' }} />
              <div style={{ textAlign: 'center' }}>
                <h4>Formulating Commercialization Pathway...</h4>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>Synthesizing industry clusters, mapping Technology Readiness Levels (TRL), and analyzing active funding pools.</p>
              </div>
              <div className="skeleton-line-pulse" style={{ width: '80%', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
              <div className="skeleton-line-pulse" style={{ width: '70%', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
              <div className="skeleton-line-pulse" style={{ width: '60%', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
            </div>
          ) : !activeAnalysis ? (
            <div className="glass-panel ai-empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '500px', textAlign: 'center', padding: '3rem' }}>
              <div className="ai-empty-icon-wrap" style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <Sparkles size={36} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3>No Innovation Strategy Formulated</h3>
              <p className="text-muted" style={{ maxWidth: '420px', marginTop: '0.5rem' }}>
                Submit a research concept in the input panel to leverage the Gemini API engine for actionable IP, collaborator networks, and funding optimization paths.
              </p>
            </div>
          ) : (
            <div className="ai-results-wrapper animate-fade-in">
              <div className="ai-results-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1.25rem 1.5rem' }}>
                <div>
                  <span className="badge badge-success" style={{ marginBottom: '0.25rem' }}> Gemini Strategy Report </span>
                  <h3 style={{ margin: 0 }}>Innovation Portfolio Analysis</h3>
                </div>
                <button className="btn btn-secondary" onClick={copyAll} style={{ gap: '0.5rem' }}>
                  <Copy size={16} />
                  Copy Full Report
                </button>
              </div>

              {/* Research Impact Card */}
              <div className="glass-panel" style={{ marginBottom: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Compass size={18} style={{ color: 'var(--accent-secondary)' }} />
                  Scientific & Commercial Impact
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {activeAnalysis.impact}
                </p>
              </div>

              {/* 2x2 Grid of structured findings */}
              <div className="ai-grid">
                
                {/* Commercialization Suggestions */}
                <div className="glass-panel flex-column-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Lightbulb size={18} style={{ color: 'var(--accent-warning)' }} />
                      Commercialization Routes
                    </h4>
                    <button 
                      className="btn-icon-only" 
                      onClick={() => copyToClipboard(activeAnalysis.commercialization.join('\n'), 'Commercialization')}
                      title="Copy Section"
                    >
                      {copiedId === 'Commercialization' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <ul className="ai-bullets">
                    {activeAnalysis.commercialization.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Target Industries */}
                <div className="glass-panel flex-column-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
                      Target Industries & Applications
                    </h4>
                    <button 
                      className="btn-icon-only" 
                      onClick={() => copyToClipboard(activeAnalysis.industries.join('\n'), 'Industries')}
                      title="Copy Section"
                    >
                      {copiedId === 'Industries' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <ul className="ai-bullets">
                    {activeAnalysis.industries.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Funding Opportunities */}
                <div className="glass-panel flex-column-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <DollarSign size={18} style={{ color: 'var(--accent-success)' }} />
                      Recommended Funding Streams
                    </h4>
                    <button 
                      className="btn-icon-only" 
                      onClick={() => copyToClipboard(activeAnalysis.funding.join('\n'), 'Funding')}
                      title="Copy Section"
                    >
                      {copiedId === 'Funding' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <ul className="ai-bullets">
                    {activeAnalysis.funding.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="glass-panel flex-column-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Wrench size={18} style={{ color: 'var(--accent-teal)' }} />
                      Key Improvement Vectors
                    </h4>
                    <button 
                      className="btn-icon-only" 
                      onClick={() => copyToClipboard(activeAnalysis.improvements.join('\n'), 'Improvements')}
                      title="Copy Section"
                    >
                      {copiedId === 'Improvements' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <ul className="ai-bullets">
                    {activeAnalysis.improvements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Collaborators and TRL */}
              <div className="ai-flex-row" style={{ marginTop: '1rem' }}>
                <div className="glass-panel" style={{ flex: 1 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                    Potential Collaborators
                  </h4>
                  <ul className="ai-bullets">
                    {activeAnalysis.collaborators.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="glass-panel" style={{ flex: 1.2 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <ShieldAlert size={18} style={{ color: 'var(--accent-warning)' }} />
                    TRL Assessment & Scale-Up Path
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {activeAnalysis.trl}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AI;
