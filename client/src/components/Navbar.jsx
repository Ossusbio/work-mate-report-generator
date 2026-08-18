import React from 'react';
import { LogOut, User, Briefcase, ArrowLeft, Code2, UserCircle } from 'lucide-react';

export default function Navbar({ user, onLogout, showBack, onBack, mode, onModeToggle, isDeveloper }) {
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Briefcase size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }} className="gradient-text">
              WORK MATE
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
              Operator Report Console &bull; <span style={{ color: '#10b981', fontWeight: 600 }}>v3.0</span>
            </div>
          </div>
        </div>

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
              border: isDev ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: isDev ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s ease',
              userSelect: 'none'
            }}
            title={isDeveloper ? 'Toggle Developer/User Mode' : 'Developer mode is restricted to authorized accounts'}
          >
            {isDev ? <Code2 size={14} color="#f59e0b" /> : <UserCircle size={14} color="#9ca3af" />}
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isDev ? '#f59e0b' : '#9ca3af' }}>
              {isDev ? 'Dev Mode' : 'User Mode'}
            </span>
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: isDev ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.12)',
              position: 'relative', transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '2px',
                left: isDev ? '18px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </div>
          </div>

          {/* User Info Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <User size={15} color="#3b82f6" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
              {username}
            </span>
            <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>|</span>
            <span className="navbar-user-email" style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>
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
