import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { History, Calendar, MapPin, Search, Edit3, Trash2, Eye, User, Filter, X, Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { fetchReportHistory, exportReport, deleteReport } from '../services/api';
import ConfirmModal from './ConfirmModal';

const DEV_EMAILS = ['parth@ossusbio.com'];

export default function ReportHistory({ onSelectReport, user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exportingId, setExportingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [openDownloadMenuId, setOpenDownloadMenuId] = useState(null);

  const handleDownload = async (reportId, format, reportObj) => {
    setDownloadingId(`${reportId}-${format}`);
    const runName = (reportObj?.parameters?.runName || reportObj?.runName || reportId || 'Report').trim();
    try {
      if (format === 'pdf') {
        document.title = runName;
        onSelectReport(reportObj);
        setTimeout(() => {
          window.print();
        }, 600);
      } else {
        await exportReport(reportId, format, runName);
      }
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloadingId(null);
      setOpenDownloadMenuId(null);
    }
  };
  const [deleting, setDeleting] = useState(false);

  const currentUserEmail = (user?.email || '').toLowerCase();
  const isDevAdmin = DEV_EMAILS.includes(currentUserEmail);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchReportHistory();
      setReports(data || []);
    } catch (err) {
      console.warn("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId, format) => {
    setExportingId(reportId);
    try {
      await exportReport(reportId, format);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportingId(null);
    }
  };

  const openDeleteModal = (report) => {
    setDeleteTarget(report);
    setDeleteEmail(user?.email || '');
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteEmail.trim()) {
      setDeleteError('Please enter your operator email address');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await deleteReport(deleteTarget.reportId, deleteEmail.trim());
      setDeleteTarget(null);
      loadHistory();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  // Get unique owner list for filter dropdown
  const uniqueOwners = Array.from(new Set(
    reports.map(r => r.createdBy || r.parameters?.runOwner || r.lastEditedBy).filter(Boolean)
  )).sort();

  const filtered = reports.filter((r) => {
    const params = r.parameters || {};
    const owner = r.createdBy || params.runOwner || r.lastEditedBy || '';
    const runName = params.runName || '';
    const reportDate = r.createdAt ? new Date(r.createdAt) : null;

    // Search text filter
    if (search) {
      const text = `${r.reportId} ${r.runId} ${params.site} ${runName} ${params.effluent} ${owner}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
    }

    // Owner filter
    if (ownerFilter && owner.toLowerCase() !== ownerFilter.toLowerCase()) {
      return false;
    }

    // Date range filter
    if (fromDate && reportDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (reportDate < from) return false;
    }
    if (toDate && reportDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (reportDate > to) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setOwnerFilter('');
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters = search || ownerFilter || fromDate || toDate;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Title & Filters Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History color="#3b82f6" />
              <span>Operator Report History</span>
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '4px' }}>
              Access, edit drafts, and download reports. Drafts can only be edited by their creator.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f43f5e', gap: '4px' }}>
                <X size={14} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          
          {/* Run Name / Text Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search by Name / ID</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search run name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Owner Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Creator / Owner</label>
            <select
              className="form-select"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            >
              <option value="">All Owners / Creators</option>
              {uniqueOwners.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>From Date</label>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Date To */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>To Date</label>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          Loading report history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          No past report runs found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((r) => {
            const p = r.parameters || {};
            const creator = r.createdBy || p.runOwner || r.lastEditedBy || 'parth@ossusbio.com';
            const isCreator = !r.createdBy || (r.createdBy.toLowerCase() === currentUserEmail);
            const canEdit = isCreator || isDevAdmin;

            return (
              <div key={r.reportId} className="glass-panel glass-card-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge badge-info">{r.runId || r.reportId}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
                    {p.runName || 'Run Report'}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="#3b82f6" />
                      <span>{p.site}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="#8b5cf6" />
                      <span>Duration: {p.runDuration || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="#10b981" />
                      <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>Owner: {p.runOwner ? `${p.runOwner} (${creator})` : creator}</span>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {deleteTarget?.reportId === r.reportId ? (
                    <div className="animate-fade-in" style={{
                      background: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '10px',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px' }}>
                        <Trash2 size={15} color="#ef4444" />
                        <span>Confirm Report Deletion</span>
                      </div>

                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', color: '#d1d5db', marginBottom: '4px' }}>
                          Confirm Operator Email:
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="your.name@ossusbio.com"
                          value={deleteEmail}
                          onChange={(e) => setDeleteEmail(e.target.value)}
                          style={{ fontSize: '0.82rem', padding: '6px 10px', width: '100%', boxSizing: 'border-box' }}
                          autoFocus
                        />
                      </div>
                      
                      {deleteError && (
                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600 }}>
                          ⚠️ {deleteError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                          disabled={deleting}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          disabled={deleting || !deleteEmail.trim()}
                          className="btn btn-primary"
                          style={{
                            flex: 1.3,
                            padding: '6px 10px',
                            fontSize: '0.78rem',
                            background: !deleteEmail.trim() ? '#4b5563' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            cursor: !deleteEmail.trim() ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {deleting ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                      {/* View / Edit Action */}
                      {r.status === 'DRAFT' ? (
                        canEdit ? (
                          <button
                            onClick={() => onSelectReport(r)}
                            className="btn btn-secondary"
                            style={{ flex: 1.2, fontSize: '0.8rem', padding: '8px 12px', borderColor: 'rgba(245, 158, 11, 0.4)', gap: '6px' }}
                            title="Edit Draft parameters"
                          >
                            <Edit3 size={14} color="#f59e0b" />
                            <span style={{ color: '#f59e0b' }}>Edit Draft</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectReport(r)}
                            className="btn btn-secondary"
                            style={{ flex: 1.2, fontSize: '0.8rem', padding: '8px 12px', borderColor: 'rgba(107, 114, 128, 0.4)', gap: '6px' }}
                            title="View Draft (Read Only)"
                          >
                            <Eye size={14} color="#9ca3af" />
                            <span style={{ color: '#9ca3af' }}>View Draft</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => onSelectReport(r)}
                          className="btn btn-secondary"
                          style={{ flex: 1.2, fontSize: '0.8rem', padding: '8px 12px', borderColor: 'rgba(59, 130, 246, 0.4)', gap: '6px' }}
                          title={canEdit ? "View & Edit Report details" : "View Report"}
                        >
                          <Eye size={14} color="#3b82f6" />
                          <span style={{ color: '#3b82f6' }}>{canEdit ? 'View / Edit' : 'View'}</span>
                        </button>
                      )}

                      {/* Download Dropdown Action - Accessible to EVERYONE */}
                      <div style={{ position: 'relative', flex: 1.2 }}>
                        <button
                          type="button"
                          onClick={() => setOpenDownloadMenuId(openDownloadMenuId === r.reportId ? null : r.reportId)}
                          className="btn btn-secondary"
                          style={{
                            width: '100%',
                            fontSize: '0.8rem',
                            padding: '8px 10px',
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            color: '#10b981',
                            gap: '6px',
                            justifyContent: 'space-between'
                          }}
                          title="Download Report (Excel / PDF / CSV)"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Download size={14} color="#10b981" />
                            <span>Download</span>
                          </div>
                          <ChevronDown size={12} color="#10b981" />
                        </button>

                        {/* Download Menu Popup */}
                        {openDownloadMenuId === r.reportId && (
                          <>
                            <div
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                              onClick={() => setOpenDownloadMenuId(null)}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 6px)',
                              right: 0,
                              minWidth: '180px',
                              background: '#1e293b',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              padding: '6px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                              zIndex: 999,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <button
                                type="button"
                                onClick={() => handleDownload(r.reportId, 'excel', r)}
                                disabled={downloadingId !== null}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#e2e8f0',
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FileSpreadsheet size={15} color="#10b981" />
                                <span>{downloadingId === `${r.reportId}-excel` ? 'Exporting...' : 'Excel Workbook (.xlsx)'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownload(r.reportId, 'pdf', r)}
                                disabled={downloadingId !== null}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#e2e8f0',
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FileText size={15} color="#38bdf8" />
                                <span>PDF Report (.pdf)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownload(r.reportId, 'csv', r)}
                                disabled={downloadingId !== null}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#e2e8f0',
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FileText size={15} color="#f59e0b" />
                                <span>{downloadingId === `${r.reportId}-csv` ? 'Exporting...' : 'Raw Telemetry (.csv)'}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Delete Action (only for owner/developer) */}
                      {canEdit && (
                        <button
                          onClick={() => { setDeleteTarget(r); setDeleteEmail(user?.email || ''); setDeleteError(''); }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '8px', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
                          title="Delete Report"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>
  );
}