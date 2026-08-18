import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Database, HardDrive, Shield, RefreshCw, Server, Terminal, 
  CheckCircle2, XCircle, Clock, Users, UserCheck, UserX, UserPlus, Trash2, Search, ShieldCheck
} from 'lucide-react';
import { fetchUsersList, updateUserRole, removeUserRole } from '../services/api';

const API_BASE = '/api';

export default function DeveloperPanel({ user }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  // User Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [newEmail, setNewEmail] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [grantRoleType, setGrantRoleType] = useState('developer');
  const [userActionMsg, setUserActionMsg] = useState('');

  const addLog = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLogs(prev => [...prev.slice(-100), { ts, msg, type }]);
  };

  const fetchHealth = async () => {
    setLoading(true);
    addLog('Polling health endpoint...');
    try {
      const token = user?.uid ? await (await import('../services/firebase')).auth?.currentUser?.getIdToken() : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/health/detailed`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data);
      setLastChecked(new Date());
      addLog('Health check completed successfully', 'success');
    } catch (err) {
      addLog(`Health check failed: ${err.message}`, 'error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchUsersList();
      setUsersList(list || []);
    } catch (err) {
      console.warn('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    loadUsers();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleToggleRole = async (targetEmail, currentRole) => {
    const newRole = currentRole === 'developer' ? 'user' : 'developer';
    // Optimistic UI update
    setUsersList(prev => prev.map(u => u.email === targetEmail ? { ...u, role: newRole } : u));
    addLog(`Updating role for ${targetEmail} -> ${newRole}...`);

    try {
      await updateUserRole(targetEmail, newRole);
      addLog(`Successfully updated ${targetEmail} to ${newRole}`, 'success');
      setUserActionMsg(`Updated ${targetEmail} to ${newRole} mode`);
      setTimeout(() => setUserActionMsg(''), 4000);
    } catch (err) {
      // Revert on error
      setUsersList(prev => prev.map(u => u.email === targetEmail ? { ...u, role: currentRole } : u));
      addLog(`Failed to update role: ${err.message}`, 'error');
      alert('Error updating user role: ' + err.message);
    }
  };

  const handleGrantNewUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.trim()) return;
    const clean = newEmail.trim().toLowerCase();
    if (!clean.endsWith('@ossusbio.com')) {
      alert('Email must end with @ossusbio.com');
      return;
    }

    setAddingUser(true);
    try {
      await updateUserRole(clean, grantRoleType);
      addLog(`Granted ${grantRoleType === 'developer' ? 'Developer' : 'Standard User'} access to ${clean}`, 'success');
      setNewEmail('');
      setUserActionMsg(`Granted ${grantRoleType === 'developer' ? 'Developer' : 'Standard User'} access to ${clean}`);
      loadUsers();
      setTimeout(() => setUserActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to grant access: ' + err.message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (targetEmail) => {
    if (targetEmail === 'parth@ossusbio.com') {
      alert('Cannot remove primary developer account.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${targetEmail} from user access database?`)) {
      return;
    }

    setUsersList(prev => prev.filter(u => u.email !== targetEmail));
    addLog(`Removing user ${targetEmail}...`);

    try {
      await removeUserRole(targetEmail);
      addLog(`Successfully removed ${targetEmail}`, 'success');
      setUserActionMsg(`Removed ${targetEmail}`);
      setTimeout(() => setUserActionMsg(''), 4000);
    } catch (err) {
      addLog(`Failed to remove user: ${err.message}`, 'error');
      alert('Error removing user: ' + err.message);
      loadUsers();
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.displayName && u.displayName.toLowerCase().includes(q));
  });

  const StatusDot = ({ ok }) => (
    <div style={{
      width: '10px', height: '10px', borderRadius: '50%',
      background: ok ? '#10b981' : '#ef4444',
      boxShadow: ok ? '0 0 8px rgba(16,185,129,0.6)' : '0 0 8px rgba(239,68,68,0.6)',
      flexShrink: 0
    }} />
  );

  const ServiceCard = ({ name, icon: Icon, color, status, details }) => (
    <div className="glass-panel" style={{ padding: '20px', borderLeft: `3px solid ${status ? '#10b981' : '#ef4444'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <Icon size={20} color={color} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{name}</span>
        <div style={{ marginLeft: 'auto' }}><StatusDot ok={status} /></div>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{details || (status ? 'Connected' : 'Disconnected')}</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal color="#f59e0b" />
              <span>Developer Dashboard & Access Control</span>
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
              Control operator roles, monitor live system connections, and inspect debug logs
            </p>
          </div>
          <button onClick={() => { fetchHealth(); loadUsers(); }} disabled={loading} className="btn btn-secondary" style={{ gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Checking...' : 'Refresh All'}</span>
          </button>
        </div>
      </div>

      {/* USER ACCESS MANAGEMENT CARD */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} color="#8b5cf6" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                User & Developer Access Management
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '2px 0 0 0' }}>
                Control who has Developer Mode access vs Standard User Mode
              </p>
            </div>
          </div>

          {userActionMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>{userActionMsg}</span>
            </div>
          )}
        </div>

        {/* Add User Bar */}
        <form onSubmit={handleGrantNewUser} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="email"
              className="form-input"
              placeholder="Grant access to email (e.g. operator@ossusbio.com)..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <select
            className="form-input"
            value={grantRoleType}
            onChange={(e) => setGrantRoleType(e.target.value)}
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="developer">Developer Role</option>
            <option value="user">Standard User Role</option>
          </select>
          <button
            type="submit"
            disabled={addingUser || !newEmail}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.85rem', gap: '6px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          >
            <UserPlus size={16} />
            <span>{addingUser ? 'Granting...' : `Grant ${grantRoleType === 'developer' ? 'Developer' : 'User'} Access`}</span>
          </button>
        </form>

        {/* Role Explanation Note */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>ℹ️ Access Roles Explained:</div>
          <div><strong style={{ color: '#fbbf24' }}>Developer:</strong> Full administrative access. Can manage user roles, view developer debug logs, run direct sensor diagnostics, and edit any reports.</div>
          <div><strong style={{ color: '#60a5fa' }}>Standard User:</strong> Regular operator access. Can generate new reports, view existing reports, and download PDF & CSV datasets, but cannot access system admin settings or role management.</div>
        </div>

        {/* User Search & Table */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: roleFilter === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderColor: roleFilter === 'all' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
              color: roleFilter === 'all' ? '#c084fc' : '#9ca3af'
            }}
          >
            All Team Members ({usersList.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('developer')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: roleFilter === 'developer' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              borderColor: roleFilter === 'developer' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
              color: roleFilter === 'developer' ? '#fbbf24' : '#9ca3af'
            }}
          >
            Developers ({usersList.filter(u => u.role === 'developer').length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('user')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: roleFilter === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              borderColor: roleFilter === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              color: roleFilter === 'user' ? '#60a5fa' : '#9ca3af'
            }}
          >
            Standard Users ({usersList.filter(u => u.role === 'user').length})
          </button>
        </div>

        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search operator email or name..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
          />
        </div>

        {loadingUsers ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '0.85rem' }}>
            Loading user access list...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '0.85rem' }}>
            No users found matching search.
          </div>
        ) : (
          <div style={{ maxHeight: '350px', overflow: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.8)', position: 'sticky', top: 0, zIndex: 1 }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>User / Email</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Display Name</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Current Access</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Access Toggle</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isDev = u.role === 'developer';
                  return (
                    <tr key={u.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isDev ? 'rgba(139, 92, 246, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', color: '#e5e7eb', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                        {u.displayName || '-'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${isDev ? 'badge-info' : 'badge-draft'}`} style={{ fontSize: '0.72rem', background: isDev ? 'rgba(139, 92, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)', color: isDev ? '#a78bfa' : '#9ca3af', border: isDev ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(107, 114, 128, 0.3)' }}>
                          {isDev ? 'Developer Mode' : 'User Mode'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u.email, u.role)}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              gap: '6px',
                              background: isDev ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              borderColor: isDev ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                              color: isDev ? '#f87171' : '#34d399'
                            }}
                            title={isDev ? 'Revoke developer mode' : 'Grant developer mode'}
                          >
                            {isDev ? <UserX size={13} /> : <UserCheck size={13} />}
                            <span>{isDev ? 'Set to User' : 'Set to Developer'}</span>
                          </button>
                          {u.email !== 'parth@ossusbio.com' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.email)}
                              className="btn btn-secondary"
                              style={{
                                padding: '6px 8px',
                                fontSize: '0.78rem',
                                background: 'rgba(239, 68, 68, 0.05)',
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171'
                              }}
                              title="Remove from access list"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Status Grid */}
      <div className="responsive-grid-2" style={{ marginBottom: '24px', gap: '16px' }}>
        <ServiceCard
          name="Firebase Firestore"
          icon={Database}
          color="#f59e0b"
          status={health?.firestore?.connected}
          details={health?.firestore?.details || 'Checking...'}
        />
        <ServiceCard
          name="BigQuery"
          icon={Activity}
          color="#3b82f6"
          status={health?.bigquery?.connected}
          details={health?.bigquery?.details || 'Checking...'}
        />
        <ServiceCard
          name="Google Cloud Storage"
          icon={HardDrive}
          color="#10b981"
          status={health?.gcs?.connected}
          details={health?.gcs?.details || 'Checking...'}
        />
        <ServiceCard
          name="Firebase Auth"
          icon={Shield}
          color="#8b5cf6"
          status={health?.auth?.connected}
          details={health?.auth?.details || 'Checking...'}
        />
      </div>

      {/* Server Environment */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="#06b6d4" />
          Server Environment
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {health?.environment ? Object.entries(health.environment).map(([key, val]) => (
            <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>{key}</div>
              <div style={{ fontSize: '0.85rem', color: '#e5e7eb', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>{val}</div>
            </div>
          )) : (
            <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Loading server info...</div>
          )}
        </div>
      </div>

      {/* Recent API Logs */}
      {health?.recentRequests && health.recentRequests.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#8b5cf6" />
            Recent API Requests
          </h3>
          <div style={{ maxHeight: '250px', overflow: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.6)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Method</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Path</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600 }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {health.recentRequests.map((req, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px 12px', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>{req.time}</td>
                    <td style={{ padding: '6px 12px', color: req.method === 'DELETE' ? '#ef4444' : '#38bdf8', fontWeight: 600 }}>{req.method}</td>
                    <td style={{ padding: '6px 12px', color: '#d1d5db', fontFamily: 'JetBrains Mono' }}>{req.path}</td>
                    <td style={{ padding: '6px 12px', color: req.status < 400 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{req.status}</td>
                    <td style={{ padding: '6px 12px', color: '#9ca3af' }}>{req.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debug Console */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#f59e0b" />
          Debug Console
          {lastChecked && (
            <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 400, marginLeft: 'auto' }}>
              Last check: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          )}
        </h3>
        <div
          ref={logRef}
          style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '8px',
            padding: '12px',
            maxHeight: '260px',
            overflow: 'auto',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.75rem',
            lineHeight: 1.8
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#6b7280' }}>Waiting for events...</div>
          ) : logs.map((log, i) => (
            <div key={i} style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#10b981' : '#9ca3af' }}>
              <span style={{ color: '#6b7280' }}>[{log.ts}]</span> {log.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
