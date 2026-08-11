import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Award, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  BrainCircuit, 
  Compass,
  Globe2
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Landing Top Navigation */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <BrainCircuit size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              InnoFund AI
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Innovation Platform
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Comprehensive Research Funding & Innovation Ecosystem
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Accelerate Innovation from Concept to Global Commercial Market
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '850px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Empowering Researchers, Faculty, Universities, Startups, Entrepreneurs, Incubators, Government Agencies, and R&D Teams with AI-driven funding discovery, patent landscape analysis, and technology readiness evaluation.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{
            padding: '0.9rem 2.25rem',
            fontSize: '1.05rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          }}>
            Explore Innovation Ecosystem <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{
            padding: '0.9rem 2rem',
            fontSize: '1.05rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Sign In to Platform
          </Link>
        </div>

        {/* Live Metrics Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem',
          padding: '2rem',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#818cf8', margin: 0 }}>$150M+</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Global Grants & Capital</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', margin: 0 }}>50,000+</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Indexed Patents & IP Assets</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f43f5e', margin: 0 }}>98.4%</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Domain Match Accuracy</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>24/7</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI TRL & Innovation Intelligence</span>
          </div>
        </div>
      </section>

      {/* Key Feature Pillars */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Built for the Entire Innovation Ecosystem</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Tailored tools for Universities, Startups, Faculty, Industry R&D, Incubators, and Government Sponsors.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Card 1 */}
          <div style={{
            padding: '2rem',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Smart Funding Matcher</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Discover grants, venture funds, seed awards, and government contracts aligned with your sector, stage, and criteria.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            padding: '2rem',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>AI Innovation & TRL Analysis</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Evaluate Technology Readiness Levels (TRL), analyze market potential, and generate actionable commercialization roadmaps.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            padding: '2rem',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Patent & IP Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Explore global patent filings, analyze corporate assignee trends, track technical domains, and validate prior art.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            padding: '2rem',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Trend & Growth Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Track technical output across key disciplines (AI, Energy, Quantum, Health, Robotics) to capture high-priority opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(15, 23, 42, 0.6)'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Scale Your Innovation Impact?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '650px', margin: '0 auto 2rem' }}>
          Join researchers, universities, startups, and R&D leaders accessing real-time funding discovery, patent intelligence, and AI tools.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>
          Get Started Free
        </Link>
      </section>
    </div>
  );
};

export default Landing;
