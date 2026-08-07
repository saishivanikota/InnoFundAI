import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import TrendChart from '../components/TrendChart';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2,
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  FileText,
  PieChart,
  BarChart3,
  Award,
  Loader2,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { exportPatentsPDF } from '../utils/pdfGenerator';

const Patents = () => {
  const toast = useToast();
  // Patents list states
  const [patents, setPatents] = useState([]);
  const [meta, setMeta] = useState({ domains: [], countries: [], statuses: [], years: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats states
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filtering states
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sort, setSort] = useState('year');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  // Detail Modal states
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch stats once
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const data = await api.patents.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load patent stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch patents on filter/page change
  useEffect(() => {
    const fetchPatents = async () => {
      setLoading(true);
      setError('');
      try {
        const filters = {
          search,
          domain: selectedDomain,
          country: selectedCountry,
          status: selectedStatus,
          year: selectedYear,
          sort,
          order,
          page,
          limit: 10
        };
        const data = await api.patents.list(filters);
        setPatents(data.patents);
        setPagination(data.pagination);
        setMeta(data.meta);
      } catch (err) {
        setError('Failed to load patent records.');
        toast.error('Failed to load patent records.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPatents();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedDomain, selectedCountry, selectedStatus, selectedYear, sort, order, page]);

  const handleOpenDetails = (patent) => {
    setSelectedPatent(patent);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDomain('');
    setSelectedCountry('');
    setSelectedStatus('');
    setSelectedYear('');
    setSort('year');
    setOrder('DESC');
    setPage(1);
  };
  return (
    <div className="page-container animate-fade-in">
      
      {/* 1. Patent Statistics Dashboard */}
      {!statsLoading && stats && (
        <div className="stats-dashboard" style={{ marginBottom: '2rem' }}>
          <div className="stats-header">
            <h3>Patent Intelligence Overview</h3>
          </div>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel metric-box">
              <FileText size={20} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-label">Total Patents Tracked</span>
                <h3 className="metric-val">{stats.summary.total}</h3>
              </div>
            </div>
            <div className="glass-panel metric-box">
              <Award size={20} className="metric-icon" style={{ color: 'var(--success-color)' }} />
              <div className="metric-text">
                <span className="metric-label">Granted Patents</span>
                <h3 className="metric-val">{stats.summary.granted}</h3>
              </div>
            </div>
            <div className="glass-panel metric-box">
              <PieChart size={20} className="metric-icon" style={{ color: 'var(--warning-color)' }} />
              <div className="metric-text">
                <span className="metric-label">Pending Applications</span>
                <h3 className="metric-val">{stats.summary.pending}</h3>
              </div>
            </div>
          </div>
          
          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-panel chart-container">
              <h4 style={{ marginBottom: '1rem' }}>Patents by Technology Domain</h4>
              <TrendChart 
                type="doughnut" 
                height={250}
                data={{
                  labels: stats.byDomain.map(d => d.domain),
                  datasets: [{
                    data: stats.byDomain.map(d => d.count),
                    backgroundColor: [
                      '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
                    ],
                    borderWidth: 0
                  }]
                }} 
              />
            </div>
            <div className="glass-panel chart-container">
              <h4 style={{ marginBottom: '1rem' }}>Patents by Year</h4>
              <TrendChart 
                type="bar" 
                height={250}
                data={{
                  labels: stats.byYear.map(d => d.year),
                  datasets: [{
                    label: 'Patents Issued/Filed',
                    data: stats.byYear.map(d => d.count),
                    backgroundColor: '#6366f1',
                    borderRadius: 4
                  }]
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Advanced Search & Filtering Layout */}
      <div className="search-filter-grid">
        
        {/* Sidebar Filters */}
        <div className="glass-panel filter-panel">
          <div className="filter-header">
            <Filter size={18} />
            <h3>Refine Patents</h3>
            <button className="clear-btn" onClick={handleClearFilters}>Reset</button>
          </div>

          <div className="filter-body">
            <div className="form-group">
              <label>Technology Domain</label>
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
              <label>Status</label>
              <select 
                className="select-field"
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              >
                <option value="">Any Status</option>
                {meta.statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select 
                className="select-field"
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
              >
                <option value="">Any Year</option>
                {meta.years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sort By</label>
              <select 
                className="select-field"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="year">Filing/Issue Year</option>
                <option value="title">Patent Title</option>
                <option value="organization">Organization</option>
                <option value="status">Status</option>
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

        <div className="listing-panel">
          <div className="search-bar-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="search-bar-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="input-field search-input" 
                placeholder="Search patent title, ID, organization, or inventor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => exportPatentsPDF(patents, stats)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Download size={16} /> Export PDF
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={32} />
              <p>Scanning patent database...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : patents.length === 0 ? (
            <div className="empty-state">
              <Info size={36} />
              <h4>No Patents Found</h4>
              <p>No records matched your search parameters. Try broadening your filter attributes.</p>
              <button className="btn btn-secondary" onClick={handleClearFilters}>Reset Parameters</button>
            </div>
          ) : (
            <>
              <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem' }}>Patent ID</th>
                      <th style={{ padding: '1rem' }}>Title</th>
                      <th style={{ padding: '1rem' }}>Organization</th>
                      <th style={{ padding: '1rem' }}>Year</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patents.map(patent => (
                      <tr key={patent.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--accent-primary)' }}>{patent.patent_id}</td>
                        <td style={{ padding: '1rem' }}>{patent.title.length > 50 ? `${patent.title.substring(0, 50)}...` : patent.title}</td>
                        <td style={{ padding: '1rem' }}>{patent.organization}</td>
                        <td style={{ padding: '1rem' }}>{patent.year}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${patent.status === 'Granted' ? 'badge-success' : 'badge-warning'}`}>
                            {patent.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenDetails(patent)}>
                            Details
                          </button>
                          {patent.url && (
                            <a 
                              href={patent.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-primary btn-sm"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title="Open Official Patent Document"
                            >
                              <span>Doc</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      {selectedPatent && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={`Patent Details: ${selectedPatent.patent_id}`}
        >
          <div className="opp-details-modal-body">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{selectedPatent.title}</h3>
            <div className="opp-meta-row">
              <div className="opp-meta-item">
                <span className="opp-meta-label">Assignee Organization</span>
                <span className="opp-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={14} /> {selectedPatent.organization}</span>
              </div>
              <div className="opp-meta-item">
                <span className="opp-meta-label">Technology Domain</span>
                <span className="badge badge-primary">{selectedPatent.technology_domain}</span>
              </div>
              <div className="opp-meta-item">
                <span className="opp-meta-label">Jurisdiction</span>
                <span className="opp-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {selectedPatent.country}
                </span>
              </div>
            </div>

            <div className="opp-description-box" style={{ marginTop: '1.5rem' }}>
              <h4>Inventors</h4>
              <p>{selectedPatent.inventor}</p>
            </div>

            <div className="opp-metrics-row" style={{ marginTop: '1.5rem' }}>
              <div className="metric-box">
                <Calendar size={20} className="metric-icon" />
                <div className="metric-text">
                  <span className="metric-label">Year of Issue/Filing</span>
                  <h3 className="metric-val">{selectedPatent.year}</h3>
                </div>
              </div>
              
              <div className="metric-box">
                <Award size={20} className="metric-icon" />
                <div className="metric-text">
                  <span className="metric-label">Current Status</span>
                  <h3 className="metric-val">{selectedPatent.status}</h3>
                </div>
              </div>
            </div>

            <div className="modal-actions-panel">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close Window</button>
              <a 
                href={selectedPatent.url || `https://patents.google.com/patent/${selectedPatent.patent_id.replace('-', '')}/en`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>View Official Patent Document</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Patents;
