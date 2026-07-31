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

          <TrendChart type="line" data={lineChartPayload} height={320} />
        </div>

        {/* Current Standing Bar Chart */}
        <div className="glass-panel col-4">
          <h3>Domain Volume Share ({latestYearData.year})</h3>
          <p style={{ marginBottom: '1.5rem' }}>Relative scale of publication logs by field</p>
          <TrendChart type="bar" data={barChartPayload} height={320} />
        </div>

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
      </div>
    </div>
  );
};

export default Trends;
