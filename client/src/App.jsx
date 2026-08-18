import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import OperatorForm from './components/OperatorForm';
import EditableTable from './components/EditableTable';
import ReportHistory from './components/ReportHistory';
import DeveloperPanel from './components/DeveloperPanel';
import LoginPage from './components/LoginPage';
import { Plus, Sparkles } from 'lucide-react';
import { fetchReport, fetchMyRole } from './services/api';

const DEFAULT_DEV_EMAILS = ['parth@ossusbio.com'];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '32px', textAlign: 'center', borderTop: '3px solid #ef4444' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '1.3rem' }}>Something went wrong</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [mode, setMode] = useState('user');
  const [view, setView] = useState('home'); // 'home' | 'wizard' | 'editor'
  const [currentReport, setCurrentReport] = useState(null);

  // Fetch dynamic role from backend
  useEffect(() => {
    if (user && user.email) {
      fetchMyRole().then(res => {
        if (res && res.role) {
          setUserRole(res.role);
        }
      }).catch(err => console.warn('Could not fetch role:', err));
    } else {
      setUserRole('user');
      setMode('user');
    }
  }, [user]);

  // ===== Browser Back Button Support =====
  const navigateTo = useCallback((newView, report = null) => {
    window.history.pushState({ view: newView }, '', '');
    setView(newView);
    if (report !== undefined) setCurrentReport(report);
  }, []);

  useEffect(() => {
    window.history.replaceState({ view: 'home' }, '', '');

    const handlePopState = (e) => {
      const state = e.state;
      if (state && state.view) {
        setView(state.view);
        if (state.view === 'home') setCurrentReport(null);
      } else {
        setView('home');
        setCurrentReport(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const isDeveloper = userRole === 'developer' || DEFAULT_DEV_EMAILS.includes(user?.email?.toLowerCase());

  const handleNewReport = () => {
    setCurrentReport(null);
    navigateTo('wizard', null);
  };

  const handleReportGenerated = (reportData) => {
    setCurrentReport(reportData);
    navigateTo('editor', reportData);
  };

  const handleSelectReport = async (reportData) => {
    try {
      let fullReport = reportData;
      if (reportData.reportId) {
        try {
          fullReport = await fetchReport(reportData.reportId);
        } catch (e) {
          console.warn('Could not fetch full report, using history item:', e);
        }
      }
      setCurrentReport(fullReport);
      if (fullReport.status === 'DRAFT') {
        navigateTo('wizard', fullReport);
      } else {
        navigateTo('editor', fullReport);
      }
    } catch (err) {
      console.error('Error selecting report:', err);
      setCurrentReport(reportData);
      navigateTo(reportData.status === 'DRAFT' ? 'wizard' : 'editor', reportData);
    }
  };

  const handleBackToHome = () => {
    navigateTo('home', null);
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (newMode === 'developer') {
      navigateTo('home', null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Navbar
        user={user}
        onLogout={() => { setUser(null); setView('home'); setMode('user'); }}
        showBack={view !== 'home'}
        onBack={handleBackToHome}
        mode={mode}
        onModeToggle={handleModeToggle}
        isDeveloper={isDeveloper}
      />

      <main style={{ padding: '0 12px' }}>
        <ErrorBoundary>
          {/* Developer Mode */}
          {mode === 'developer' && isDeveloper && (
            <DeveloperPanel user={user} />
          )}

          {/* User Mode */}
          {mode === 'user' && (
            <>
              {/* HOMEPAGE */}
              {view === 'home' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                  
                  {/* Hero Section */}
                  <div className="glass-panel" style={{ 
                    padding: '36px', 
                    marginBottom: '32px', 
                    borderLeft: '4px solid #3b82f6',
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(30, 41, 55, 0.6) 100%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Sparkles size={20} color="#f59e0b" />
                          <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Dashboard
                          </span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                          Welcome, <span className="gradient-text">{user?.displayName || user?.email?.split('@')[0]}</span>
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                          Create a new run report or browse your past reports below.
                        </p>
                      </div>

                      <button
                        onClick={handleNewReport}
                        className="btn btn-primary"
                        style={{ 
                          padding: '16px 32px', 
                          fontSize: '1.1rem', 
                          borderRadius: '16px',
                          boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          gap: '10px'
                        }}
                      >
                        <Plus size={22} strokeWidth={2.5} />
                        <span>New Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Report History */}
                  <ReportHistory onSelectReport={handleSelectReport} user={user} />
                </div>
              )}

              {/* WIZARD */}
              {view === 'wizard' && (
                <OperatorForm 
                  key={currentReport?.reportId || 'new-report-wizard'}
                  report={currentReport}
                  user={user}
                  onReportGenerated={handleReportGenerated} 
                  onCancel={handleBackToHome}
                />
              )}

              {/* EDITOR */}
              {view === 'editor' && (
                <EditableTable
                  key={currentReport?.reportId || 'new-report-editor'}
                  report={currentReport}
                  user={user}
                  onEditReport={() => navigateTo('wizard', currentReport)}
                  onUpdateSuccess={(updated) => {
                    if (updated && updated.status === 'COMPLETED') {
                      setCurrentReport(null);
                      navigateTo('home', null);
                    } else {
                      setCurrentReport(updated);
                    }
                  }}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
