import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/Card';
import TrendChart from '../components/TrendChart';
import { 
  Users, 
  Award, 
  Globe, 
  BookOpen, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [patentStats, setPatentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [scoring, setScoring] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardData, patentData] = await Promise.all([
          api.dashboard.getStats(),
          api.patents.getStats()
        ]);
        setStats(dashboardData);
        setPatentStats(patentData);
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Fetch recommendations if logged in and profile exists
  useEffect(() => {
    const fetchRecs = async () => {
      if (!user || !profile) return;
      setRecsLoading(true);
      try {
        const data = await api.funding.getRecommendations();
        setRecommendations(data.recommendations.slice(0, 3)); // top 3
      } catch (err) {
        console.error('Error fetching dashboard recommendations:', err);
      } finally {
        setRecsLoading(false);
      }
    };
    fetchRecs();
  }, [user, profile]);

  // Fetch scoring if logged in and profile exists
  useEffect(() => {
    const fetchScoring = async () => {
      if (!user || !profile) return;
      setScoringLoading(true);
      try {
        const data = await api.ai.getScoring();
        setScoring(data);
      } catch (err) {
        console.error('Error fetching dashboard scoring data:', err);
      } finally {
        setScoringLoading(false);
      }
    };
    fetchScoring();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '70vh' }}>
        <Loader2 className="animate-spin" size={32} />
        <p>Loading analytics engine...</p>
      </div>
    );
  }

  if (error || !stats || !patentStats) {
    return (
      <div className="error-state">
        <p>{error || 'An error occurred loading the dashboard.'}</p>
      </div>
    );
  }

  const { summary, fundingDistribution, publicationsByDomain, researchGrowth } = stats;

  // 1. Funding Distribution Chart Data (Doughnut)
  const fundingChartData = {
    labels: fundingDistribution.map(item => item.domain),
    datasets: [
      {
        data: fundingDistribution.map(item => item.totalFunding),
        backgroundColor: [
          '#6366f1', // Indigo
          '#10b981', // Emerald
          '#06b6d4', // Cyan
          '#f59e0b', // Amber
          '#ec4899'  // Pink
        ],
        borderWidth: 1.5,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f172a' : '#ffffff',
        hoverOffset: 4
      }
    ]
  };

  // 2. Publications by Domain Chart Data (Bar)
  const publicationsChartData = {
    labels: publicationsByDomain.map(item => item.domain),
    datasets: [
      {
        label: 'Publications in Latest Year',
        data: publicationsByDomain.map(item => item.publications),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // 3. Research Growth Over Time Chart Data (Line/Area)
  const growthChartData = {
    labels: researchGrowth.map(item => item.year),
    datasets: [
      {
        label: 'Global Publications Index',
        data: researchGrowth.map(item => item.totalPublications),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointRadius: 4
      }
    ]
  };

  // 4. Patents by Technology (Pie/Doughnut)
  const patentTechChartData = {
    labels: patentStats.byDomain.map(item => item.domain),
    datasets: [
      {
        data: patentStats.byDomain.map(item => item.count),
        backgroundColor: [
          '#0d9488', // Teal
          '#0ea5e9', // Sky Blue
          '#6366f1', // Indigo
          '#10b981', // Emerald
          '#f59e0b'  // Amber
        ],
        borderWidth: 1.5,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f172a' : '#ffffff'
      }
    ]
  };

  // 5. Patents by Year (Bar)
  const patentYearChartData = {
    labels: patentStats.byYear.map(item => item.year),
    datasets: [
      {
        label: 'Patents Registered',
        data: patentStats.byYear.map(item => item.count),
        backgroundColor: 'rgba(13, 148, 136, 0.8)', // Teal opacity
        borderColor: '#0d9488',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // 6. Top Patent Organizations (Bar)
  const patentOrgsChartData = {
    labels: patentStats.topOrgs.map(item => item.organization),
    datasets: [
      {
        label: 'Patents Count',
        data: patentStats.topOrgs.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="page-container animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner glass-panel" style={{ marginBottom: '2rem' }}>
        <div className="hero-left">
          <h2>Welcome to Research Funding & Innovation Intel</h2>
          <p>
            Secure funding insights, domain trends, and tailored resource discovery for institutional researchers.
          </p>
          {user ? (
            !profile && (
              <Link to="/profile" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                Create Research Profile <ArrowRight size={16} />
              </Link>
            )
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-secondary">Create Account</Link>
            </div>
          )}
        </div>
        <div className="hero-right-icon">
          <Sparkles size={64} className="banner-sparkle" />
        </div>
      </div>

      {/* Overview Cards (5 Clean Cards) */}
      <div className="dashboard-grid">
        <Card 
          title="Total Researchers"
          value={summary.totalResearchers}
          icon={<Users size={22} style={{ color: 'var(--accent-primary)' }} />}
          description="Active research profile logs"
        />
        <Card 
          title="Funding Opportunities"
          value={summary.fundingOpportunities}
          icon={<Award size={22} style={{ color: 'var(--accent-secondary)' }} />}
          description="Indexed active awards"
        />
        <Card 
          title="Research Domains"
          value={summary.uniqueDomains}
          icon={<Globe size={22} style={{ color: 'var(--accent-warning)' }} />}
          description="Fields with active funding"
        />
        <Card 
          title="Total Publications"
          value={summary.totalPublications.toLocaleString()}
          icon={<BookOpen size={22} style={{ color: 'var(--accent-success)' }} />}
          description="Cumulative publications cataloged"
        />
        <Card 
          title="Total Patents"
          value={patentStats.summary.total}
          icon={<FileText size={22} style={{ color: 'var(--accent-teal)' }} />}
          description={`${patentStats.summary.granted} Granted / ${patentStats.summary.pending} Pending`}
        />
      </div>

      {/* Main Charts & Matching Rows */}
      <div className="analytics-grid">
        
        {/* Growth over time line chart */}
        <div className="glass-panel col-8">
          <h3>Research Growth Trajectory</h3>
          <p style={{ marginBottom: '1.5rem' }}>Cumulative indexed publication volume growth over time</p>
          <TrendChart type="line" data={growthChartData} height={280} />
        </div>

        {/* Funding budget distribution doughnut */}
        <div className="glass-panel col-4">
          <h3>Funding Share by Domain</h3>
          <p style={{ marginBottom: '1.5rem' }}>Total award budgets allocated across research fields</p>
          <TrendChart type="doughnut" data={fundingChartData} height={280} />
        </div>

        {/* Patents by Tech distribution */}
        <div className="glass-panel col-4">
          <h3>Patents by Technology</h3>
          <p style={{ marginBottom: '1.5rem' }}>Patent applications grouped by research domain</p>
          <TrendChart type="doughnut" data={patentTechChartData} height={260} />
        </div>

        {/* Patents by Year bar chart */}
        <div className="glass-panel col-4">
          <h3>Patents by Year</h3>
          <p style={{ marginBottom: '1.5rem' }}>Annual volume of registered and pending patents</p>
          <TrendChart type="bar" data={patentYearChartData} height={260} />
        </div>

        {/* Top Patent Orgs */}
        <div className="glass-panel col-4">
          <h3>Top Patent Organizations</h3>
          <p style={{ marginBottom: '1.5rem' }}>Entities leading in patent filings and innovation</p>
          <TrendChart type="bar" data={patentOrgsChartData} height={260} options={{ indexAxis: 'y' }} />
        </div>

        {/* Domain publication shares */}
        <div className="glass-panel col-6">
          <h3>Publications Volume by Field</h3>
          <p style={{ marginBottom: '1.5rem' }}>Comparing current output scales across active fields</p>
          <TrendChart type="bar" data={publicationsChartData} height={260} />
        </div>

        {/* Contextual Action Items / Recommendations */}
        <div className="glass-panel col-6 flex-column-container">
          <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Tailored Funding Matches</h3>
            {profile && <Link to="/funding" className="view-more-link">View All <ChevronRight size={14} /></Link>}
          </div>

          {!user ? (
            <div className="dashboard-prompt-box">
              <p>Please sign in to view recommendations tailored to your specific scientific background.</p>
              <Link to="/login" className="btn btn-secondary" style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}>Sign In</Link>
            </div>
          ) : !profile ? (
            <div className="dashboard-prompt-box">
              <p>Configure your researcher credentials to match with high-value domain grants.</p>
              <Link to="/profile" className="btn btn-secondary" style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}>Set Profile</Link>
            </div>
          ) : recsLoading ? (
            <div className="dashboard-prompt-box" style={{ justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="dashboard-prompt-box">
              <p>No immediate funding opportunities cataloged matching your specific domain: <strong>{profile.research_domain}</strong>.</p>
            </div>
          ) : (
            <div className="dashboard-recs-list">
              {recommendations.map(opp => (
                <Link to="/funding" key={opp.id} className="dashboard-rec-item">
                  <div className="rec-item-left">
                    <span className="rec-item-title">{opp.title}</span>
                    <span className="rec-item-org">{opp.organization}</span>
                  </div>
                  <div className="rec-item-right">
                    <span className="rec-item-amount">{formatCurrency(opp.funding_amount)}</span>
                    <span className="badge badge-primary rec-item-badge">{opp.country}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Innovation Score Panel */}
        {user && profile && (
          <div className="glass-panel col-12" style={{ marginTop: '1.5rem', width: '100%' }}>
            <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.25rem', backgroundColor: 'var(--accent-success)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>AI Validation</span>
                <h3 style={{ margin: 0 }}>Innovation Readiness Index</h3>
              </div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Updated dynamically based on research profile, patent landscapes, and funding opportunities</span>
            </div>

            {scoringLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : scoring ? (
              <div className="scoring-dashboard-layout" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                
                {/* Left side: circular progress and details */}
                <div className="scoring-gauge-box" style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '1rem' }}>
                    <svg width="100%" height="100%" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--bg-tertiary)"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeDasharray={`${scoring.overall}, 100`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{scoring.overall}%</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Index Score</span>
                    </div>
                  </div>
                  <h4>Innovation Readiness Category</h4>
                  <p className="text-secondary" style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                    {scoring.overall >= 85 ? "Strategic Commercial Grade (TRL 5+)" : 
                     scoring.overall >= 75 ? "Advanced Proof of Concept (TRL 3-4)" : 
                     "Early Stage Concept (TRL 1-2)"}
                  </p>
                </div>

                {/* Right side: component progress bars */}
                <div className="scoring-progress-details" style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                  
                  {/* Research Novelty */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Research Novelty (30% weight)</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{scoring.breakdown.researchNovelty} / 100</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scoring.breakdown.researchNovelty}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Patent Strength */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Patent Strength (20% weight)</span>
                      <span style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{scoring.breakdown.patentStrength} / 100</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scoring.breakdown.patentStrength}%`, height: '100%', background: 'var(--accent-secondary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Technology Readiness */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Technology Readiness (15% weight)</span>
                      <span style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>{scoring.breakdown.technologyReadiness} / 100</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scoring.breakdown.technologyReadiness}%`, height: '100%', background: 'var(--accent-teal)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Market Potential */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Market Potential (20% weight)</span>
                      <span style={{ color: 'var(--accent-success)', fontWeight: '600' }}>{scoring.breakdown.marketPotential} / 100</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scoring.breakdown.marketPotential}%`, height: '100%', background: 'var(--accent-success)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Funding Relevance */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Funding Relevance (15% weight)</span>
                      <span style={{ color: 'var(--accent-warning)', fontWeight: '600' }}>{scoring.breakdown.fundingRelevance} / 100</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scoring.breakdown.fundingRelevance}%`, height: '100%', background: 'var(--accent-warning)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <p>Failed to load scoring metrics.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
