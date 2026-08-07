import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TrendChart from '../components/TrendChart';
import Card from '../components/Card';
import { 
  TrendingUp, 
  BookOpen, 
  BarChart3, 
  Loader2, 
  ArrowUpRight,
  Download
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { exportResearchTrendsPDF } from '../utils/pdfGenerator';

const Trends = () => {
  const toast = useToast();
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await api.trends.get();
        setTrendsData(data);
      } catch (err) {
        setError('Failed to retrieve research trends and analytics.');
        toast.error('Failed to retrieve research trends and analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={32} />
        <p>Aggregating historical research indexes...</p>
      </div>
    );
  }

  if (error || !trendsData) {
    return (
      <div className="error-state">
        <p>{error || 'An error occurred loading trends.'}</p>
      </div>
    );
  }

  const { domains, chartData, analytics } = trendsData;

  // 1. Prepare Line Chart Data for Growth Over Time
  const lineChartPayload = {
    labels: chartData.map(d => d.year),
    datasets: domains
      .filter(d => selectedDomain === 'All' || d === selectedDomain)
      .map((domain, index) => {
        // Dynamic colors
        const colors = [
          '#6366f1', // Indigo
          '#10b981', // Emerald
          '#06b6d4', // Cyan
          '#f59e0b', // Amber
          '#ec4899'  // Pink
        ];
        const color = colors[index % colors.length];

        return {
          label: domain,
          data: chartData.map(d => d[domain] || 0),
          borderColor: color,
          backgroundColor: `${color}15`,
          borderWidth: 3,
          tension: 0.35,
          fill: selectedDomain !== 'All', // Fill area under curve if single domain is selected
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6
        };
      })
  };

  // 2. Prepare Bar Chart Data for Domain Comparison in latest year
  const latestYearData = chartData[chartData.length - 1];
  const barChartPayload = {
    labels: domains,
    datasets: [
      {
        label: `Publications Count (${latestYearData.year})`,
        data: domains.map(d => latestYearData[d] || 0),
        backgroundColor: [
          'rgba(99, 102, 241, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(6, 182, 212, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(236, 72, 153, 0.85)'
        ],
        borderColor: [
          '#6366f1',
          '#10b981',
          '#06b6d4',
          '#f59e0b',
          '#ec4899'
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // Identify leading growth domain
  const fastestGrowing = [...analytics].sort((a, b) => b.growthRate - a.growthRate)[0];


  return (
    <div className="page-container animate-fade-in">
      
      {/* Metrics Summary */}
      <div className="dashboard-grid">
        <Card 
          title="Fastest Growing Domain"
          value={fastestGrowing?.domain || 'N/A'}
          icon={<TrendingUp size={20} style={{ color: 'var(--accent-success)' }} />}
          badgeText={`+${fastestGrowing?.growthRate}%`}
          badgeColor="success"
          description="Cumulative publication increase (2018-2026)"
        />
        
        <Card 
          title="Total Publications Indexed"
          value={analytics.reduce((sum, d) => sum + d.totalPublications, 0).toLocaleString()}
          icon={<BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />}
          description="Aggregated historical records"
        />

        <Card 
          title="Research Domains Tracked"
          value={domains.length}
          icon={<BarChart3 size={20} style={{ color: 'var(--accent-secondary)' }} />}
          description="Relational index categories"
        />
      </div>

      {/* Analytics Visualizations Layout */}
      <div className="analytics-grid">
        
        {/* Main Growth Line Chart */}
        <div className="glass-panel col-8">
          <div className="chart-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>Publication Production Trajectory</h3>
              <p>Historical research count index over time (2018-2026)</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => exportResearchTrendsPDF(trendsData)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Download size={16} /> Export PDF
              </button>
              <select 
                className="select-field"
                style={{ width: '220px', padding: '0.5rem' }}
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="All">All Domains Combined</option>
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <TrendChart type="line" data={lineChartPayload} height={320} />
        </div>

        {/* Current Standing Bar Chart */}
        <div className="glass-panel col-4">
          <h3>Domain Volume Share ({latestYearData.year})</h3>
          <p style={{ marginBottom: '1.5rem' }}>Relative scale of publication logs by field</p>
          <TrendChart type="bar" data={barChartPayload} height={320} />
        </div>

        {/* Analytics Growth Details Table */}
        {/* Analytics Growth Details Table */}
        <div className="glass-panel col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Domain Growth Matrix (2018 vs 2026)</h3>
              <p style={{ margin: 0 }}>Comparison of compound research output and publication scaling</p>
            </div>
          </div>
          
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Research Domain</th>
                  <th>2018 Count</th>
                  <th>2026 Count</th>
                  <th>Compound Growth Rate</th>
                  <th>Cumulative Output</th>
                  <th>Average Output / Year</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{row.domain}</strong>
                    </td>
                    <td>{row.startCount.toLocaleString()}</td>
                    <td>{row.endCount.toLocaleString()}</td>
                    <td>
                      <span className="growth-indicator-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-success)', fontWeight: '600' }}>
                        <ArrowUpRight size={14} />
                        +{row.growthRate}%
                      </span>
                    </td>
                    <td>{row.totalPublications.toLocaleString()}</td>
                    <td>{row.averagePublications.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live OpenAlex Scientific Works Explorer */}
        <div className="glass-panel col-12" style={{ marginTop: '1.5rem' }}>
          <OpenAlexWorksExplorer />
        </div>
      </div>
    </div>
  );
};

const OpenAlexWorksExplorer = () => {
  const [search, setSearch] = useState('artificial intelligence');
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWorks = async (queryStr) => {
    setLoading(true);
    try {
      const data = await api.trends.getWorks(queryStr);
      setWorks(data.works || []);
    } catch (err) {
      console.error('Failed to fetch OpenAlex works', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorks(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>OpenAlex API</span>
          <h3 style={{ margin: 0 }}>Scientific Research Publications</h3>
          <p style={{ margin: 0 }}>Explore real peer-reviewed works, preprints, authors, and DOIs</p>
        </div>
        <div className="search-bar-wrapper" style={{ width: '320px', marginBottom: 0 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search OpenAlex publications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : works.length === 0 ? (
        <p className="text-muted" style={{ padding: '1rem', textAlign: 'center' }}>No publication works found for "{search}".</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {works.map((w, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{w.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {Array.isArray(w.authors) ? w.authors.slice(0, 4).join(', ') : w.authors} • {w.journal} ({w.year || 'N/A'})
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {w.abstract.length > 200 ? `${w.abstract.substring(0, 200)}...` : w.abstract}
                  </p>
                </div>
                {w.doi || w.external_id ? (
                  <a 
                    href={w.doi || w.external_id} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    View DOI / Source ↗
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trends;
