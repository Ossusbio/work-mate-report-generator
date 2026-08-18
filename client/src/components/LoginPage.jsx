import React, { useState } from 'react';
import { Briefcase, AlertCircle } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup
} from '../services/firebase';

export default function LoginPage({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailAllowed = (emailToCheck) => {
    if (!emailToCheck) return false;
    const clean = emailToCheck.trim().toLowerCase();
    return clean.endsWith('@ossusbio.com');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase Auth client is not properly initialized.');
      }
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = res.user.email;

      if (!isEmailAllowed(userEmail)) {
        throw new Error(`Access Denied: ${userEmail} is not authorized. Only @ossusbio.com domain emails have access.`);
      }

      onLoginSuccess({ 
        email: userEmail, 
        uid: res.user.uid,
        displayName: res.user.displayName
      });
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Google Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '460px', width: '100%', padding: '40px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
            marginBottom: '16px'
          }}>
            <Briefcase size={34} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">
            WORK MATE
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>
            Operator Report Management System
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f43f5e',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '1rem',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'brightness(1.5)' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{loading ? 'Logging you in...' : 'Sign in with Google'}</span>
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', margin: '20px 0 0 0', lineHeight: 1.5 }}>
          Authorized operator access strictly restricted to <strong style={{ color: '#38bdf8' }}>@ossusbio.com</strong> domain accounts.
        </p>

      </div>
    </div>
  );
}
