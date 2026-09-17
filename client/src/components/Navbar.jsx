import React from 'react';
import { LogOut, User, Briefcase, ArrowLeft, Code2, UserCircle, FileText, Zap } from 'lucide-react';

export default function Navbar({ user, onLogout, showBack, onBack, mode, onModeToggle, isDeveloper, activeNav = 'reports', onNavChange }) {
  const username = user?.displayName || user?.email?.split('@')[0] || 'Operator';
  const isDev = mode === 'developer';

  const handleToggle = () => {
    if (!isDev && !isDeveloper) {
      alert('Developer mode is restricted. Please contact an authorized developer to grant your account access.');
      return;
    }
    onModeToggle(isDev ? 'user' : 'developer');
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 28px', marginBottom: '28px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Back button + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem', marginRight: '4px' }}
              title="Back to Home"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <Briefcase size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }} className="gradient-text">
              WORK MATE
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
              Operator Report Console &bull; <span style={{ color: '#059669', fontWeight: 600 }}>v3.0</span>
            </div>
          </div>
        </div>

        {/* Center: Module Switcher (Reports vs Power Supply) */}
        {onNavChange && (
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-warm-border)' }}>
            <button
              onClick={() => onNavChange('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeNav === 'reports' ? '#ffffff' : 'transparent',
                color: activeNav === 'reports' ? '#0284C7' : '#64748B',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeNav === 'reports' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FileText size={15} />
              <span>Reports</span>
            </button>

            <button
              onClick={() => onNavChange('power-supply')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeNav === 'power-supply' ? '#ffffff' : 'transparent',
                color: activeNav === 'power-supply' ? '#0284C7' : '#64748B',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeNav === 'power-supply' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={15} color="#0284C7" />
              <span>Power Supply</span>
            </button>
          </div>
        )}

        {/* Right: Mode Toggle + User Info + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Mode Toggle */}
          <div 
            onClick={handleToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              cursor: isDeveloper ? 'pointer' : 'not-allowed',
              opacity: isDeveloper ? 1 : 0.6,
              border: isDev ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid var(--color-warm-border)',
              background: isDev ? 'rgba(2, 132, 199, 0.12)' : 'rgba(255, 253, 249, 0.9)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease',
              userSelect: 'none'
            }}
            title={isDeveloper ? 'Toggle Developer/User Mode' : 'Developer mode is restricted to authorized accounts'}
          >
            {isDev ? <Code2 size={14} color="#0284C7" /> : <UserCircle size={14} color="#64748B" />}
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isDev ? '#0284C7' : '#64748B' }}>
              {isDev ? 'Dev Mode' : 'User Mode'}
            </span>
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: isDev ? 'linear-gradient(135deg, #38BDF8, #0284C7)' : 'rgba(2, 132, 199, 0.25)',
              position: 'relative', transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff',
                position: 'absolute', top: '2px',
                left: isDev ? '18px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* User Info Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 253, 249, 0.95)',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: '1px solid var(--color-warm-border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <User size={15} color="#0284C7" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2E2219' }}>
              {username}
            </span>
            <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>|</span>
            <span className="navbar-user-email" style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'JetBrains Mono' }}>
              {user?.email}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#f43f5e' }}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}
