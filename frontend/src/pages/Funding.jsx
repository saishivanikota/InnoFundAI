import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Loader2,
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Info,
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { exportFundingPDF } from '../utils/pdfGenerator';

const Funding = () => {
  const { user, profile } = useAuth();
  const toast = useToast();
  
  // Funding list states
  const [opportunities, setOpportunities] = useState([]);
  const [meta, setMeta] = useState({ domains: [], countries: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 6, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Recommendations states
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [sort, setSort] = useState('funding_amount');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  // Detail Modal states
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch opportunities on filter/page change
  useEffect(() => {
    const fetchFunding = async () => {
      setLoading(true);
      setError('');
      try {
        const filters = {
          search,
          domain: selectedDomain,
          country: selectedCountry,
          minAmount,
          maxAmount,
          deadlineBefore,
          sort,
          order,
          page,
          limit: 6
        };
        const data = await api.funding.list(filters);
        setOpportunities(data.opportunities);
        setPagination(data.pagination);
        setMeta(data.meta);
      } catch (err) {
        setError('Failed to load funding opportunities.');
        toast.error('Failed to load funding opportunities.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchFunding();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedDomain, selectedCountry, minAmount, maxAmount, deadlineBefore, sort, order, page]);

  // Fetch recommendations if user is logged in
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !profile) return;
      setRecsLoading(true);
      setRecsError('');
      try {
        const data = await api.funding.getRecommendations();
        setRecommendations(data.recommendations);
      } catch (err) {
        if (err.status !== 404) {
          setRecsError('Could not retrieve recommendations.');
        }
      } finally {
        setRecsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, profile]);

  const handleOpenDetails = (opp) => {
    setSelectedOpp(opp);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDomain('');
    setSelectedCountry('');
    setMinAmount('');
    setMaxAmount('');
    setDeadlineBefore('');
    setSort('funding_amount');
    setOrder('DESC');
    setPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // Get remaining days until deadline
  const getDaysRemaining = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  return (
    <div className="page-container animate-fade-in">
      
      {/* 1. Recommendations Banner */}
      {user ? (
        profile ? (
          recommendations.length > 0 && (
            <div className="recommendations-container" style={{ marginBottom: '2rem' }}>
              <div className="recommendations-header">
                <Sparkles className="rec-icon" size={20} />
                <h3>Tailored Recommendations for {profile.full_name}</h3>
                <span className="badge badge-success">Domain: {profile.research_domain}</span>
              </div>
              
              <div className="recommendations-grid">
                {recommendations.map(opp => (
                  <div key={opp.id} className="glass-panel rec-card interactive" onClick={() => handleOpenDetails(opp)}>
                    <div className="rec-card-body">
                      <h4>{opp.title}</h4>
                      <p className="rec-card-org">{opp.organization}</p>
                      <div className="rec-card-footer">
                        <span className="rec-amount">{formatCurrency(opp.funding_amount)}</span>
                        <span className="rec-days"><Clock size={12} /> {getDaysRemaining(opp.deadline)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="glass-panel alert-banner primary" style={{ marginBottom: '2rem' }}>
            <Sparkles size={24} />
            <div className="alert-banner-text">
              <h4>Unlock AI-Powered Recommendations</h4>
              <p>Set up your domain and preferences inside your profile to get high-value funding matches.</p>
            </div>
            <a href="/profile" className="btn btn-primary">Configure Profile</a>
          </div>
        )
      ) : (
        <div className="glass-panel alert-banner" style={{ marginBottom: '2rem', borderLeftColor: 'var(--accent-primary)' }}>
          <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
          <div className="alert-banner-text">
            <h4>Personalized Opportunities Await</h4>
            <p>Sign In or Register to build an innovation profile and receive targeted funding matches.</p>
          </div>
          <a href="/login" className="btn btn-secondary">Sign In Now</a>
        </div>
      )}

      {/* 2. Advanced Search & Filtering Layout */}
      <div className="search-filter-grid">
        
        {/* Sidebar Filters */}
        <div className="glass-panel filter-panel">
          <div className="filter-header">
            <Filter size={18} />
            <h3>Advanced Filters</h3>
            <button className="clear-btn" onClick={handleClearFilters}>Reset</button>
          </div>

          <div className="filter-body">
            <div className="form-group">
              <label>Domain</label>
              <select 
                className="select-field"
                value={selectedDomain}
                onChange={(e) => { setSelectedDomain(e.target.value); setPage(1); }}
              >
                <option value="">All Domains</option>
                {meta.domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Country</label>
              <select 
                className="select-field"
                value={selectedCountry}
                onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
              >
                <option value="">All Countries</option>
                {meta.countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Funding Range (USD)</label>
              <div className="range-inputs">
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
                />
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Deadline Before</label>
              <input 
                type="date" 
                className="input-field"
                value={deadlineBefore}
                onChange={(e) => { setDeadlineBefore(e.target.value); setPage(1); }}
              />
            </div>

            <div className="form-group">
              <label>Sort By</label>
              <select 
                className="select-field"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="funding_amount">Funding Amount</option>
                <option value="deadline">Deadline Date</option>
                <option value="title">Title</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <div className="form-group">
              <label>Order</label>
              <select 
                className="select-field"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Listing */}
        <div className="listing-panel">
          <div className="search-bar-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="search-bar-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="input-field search-input" 
                placeholder="Search opportunity title, awarding body, description keywords..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => exportFundingPDF(opportunities, { search, domain: selectedDomain })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Download size={16} /> Export PDF
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={32} />
              <p>Scanning relational database...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="empty-state">
              <Info size={36} />
              <h4>No Opportunities Found</h4>
              <p>No records matched your search parameters. Try broadening your filter attributes.</p>
              <button className="btn btn-secondary" onClick={handleClearFilters}>Reset Parameters</button>
            </div>
          ) : (
            <>
              <div className="opportunities-list-grid">
                {opportunities.map(opp => (
                  <div key={opp.id} className="glass-panel opportunity-list-card">
                    <div className="opp-card-header">
                      <div className="opp-card-badge-line">
                        <span className="badge badge-primary">{opp.research_domain}</span>
                        <span className="opp-card-location"><MapPin size={12} /> {opp.country}</span>
                      </div>
                      <h3>{opp.title}</h3>
                      <p className="opp-org">{opp.organization}</p>
                    </div>

                    <div className="opp-card-body">
                      <p className="opp-snippet">
                        {opp.description.length > 120 ? `${opp.description.substring(0, 120)}...` : opp.description}
                      </p>
                    </div>

                      <div className="opp-card-footer" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div className="opp-stats" style={{ flex: 1 }}>
                          <div className="opp-amount">
                            <DollarSign size={16} />
                            <span>{formatCurrency(opp.funding_amount)}</span>
                          </div>
                          <div className="opp-days">
                            <Calendar size={14} />
                            <span>{getDaysRemaining(opp.deadline)}</span>
                          </div>
                        </div>
                        
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenDetails(opp)}>
                          Details
                        </button>
                        {opp.url && (
                          <a 
                            href={opp.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            title="Open Official Source Document"
                          >
                            <span>Apply</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="pagination-wrapper">
                <button 
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map(pNum => (
                    <button
                      key={pNum}
                      className={`page-number-btn ${pagination.page === pNum ? 'active' : ''}`}
                      onClick={() => setPage(pNum)}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Detail Dialog Drawer Modal */}
      {selectedOpp && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={selectedOpp.title}
        >
          <div className="opp-details-modal-body">
            <div className="opp-meta-row">
              <div className="opp-meta-item">
                <span className="opp-meta-label">Awarding Body</span>
                <span className="opp-meta-value">{selectedOpp.organization}</span>
              </div>
              <div className="opp-meta-item">
                <span className="opp-meta-label">Domain Area</span>
                <span className="badge badge-primary">{selectedOpp.research_domain}</span>
              </div>
              <div className="opp-meta-item">
                <span className="opp-meta-label">Country</span>
                <span className="opp-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {selectedOpp.country}
                </span>
              </div>
            </div>

            <div className="opp-description-box">
              <h4>Opportunity Description</h4>
              <p>{selectedOpp.description}</p>
            </div>

            <div className="opp-metrics-row">
              <div className="metric-box">
                <DollarSign size={20} className="metric-icon" />
                <div className="metric-text">
                  <span className="metric-label">Funding Amount</span>
                  <h3 className="metric-val">{formatCurrency(selectedOpp.funding_amount)}</h3>
                </div>
              </div>
              
              <div className="metric-box">
                <Calendar size={20} className="metric-icon" />
                <div className="metric-text">
                  <span className="metric-label">Application Deadline</span>
                  <h3 className="metric-val">{formatDate(selectedOpp.deadline)}</h3>
                  <span className="metric-sublabel" style={{ color: 'var(--accent-warning)', fontWeight: '600' }}>
                    ({getDaysRemaining(selectedOpp.deadline)})
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions-panel">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close Window</button>
              <a 
                href={selectedOpp.url || 'https://www.grants.gov/search-grants'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary" 
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Apply on Official Portal</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Funding;
