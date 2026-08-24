import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, Clock, MapPin, ArrowRight, X } from 'lucide-react';

export default function BigQueryFetchAlertModal({
  open,
  onClose,
  onNavigateTab,
  site = 'UCS',
  initialRunParams = {},
  selectedStreamsCount = 0,
  dataFrequency = '',
  errorMessage = ''
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const { startDate, startTime, endDate, endTime, breakStartTime, breakEndTime } = initialRunParams || {};

  const timeWindowDisplay = (startTime || endTime)
    ? `${startDate || 'Today'} ${startTime || '00:00'} → ${endDate || startDate || 'Today'} ${endTime || '23:59'}`
    : 'No specific time filter set (Full Day)';

  const modalContent = (
    <div className="modal-backdrop-fixed" onClick={onClose}>
      <div
        className="glass-panel modal-dialog-fixed"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '26px 28px',
          maxWidth: '540px',
          borderTop: '4px solid #f59e0b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={22} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fef3c7' }}>
              No BigQuery Telemetry Found
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              BigQuery returned 0 telemetry records for this time window
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Query Context Summary Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#38bdf8" /> Site Table:
            </span>
            <span style={{ fontWeight: 600, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
              Datas.{site}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#f59e0b" /> Queried Window:
            </span>
            <span style={{ fontWeight: 500, color: '#f3f4f6', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
              {timeWindowDisplay}
            </span>
          </div>
          {breakStartTime && breakEndTime && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#9ca3af' }}>Break Excluded:</span>
              <span style={{ color: '#fb7185', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
                {breakStartTime} → {breakEndTime}
              </span>
            </div>
          )}
        </div>

        {/* Potential Reasons & Why It Happened */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Possible Reasons:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#e5e7eb',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#f59e0b' }}>1. No telemetry recorded during this period:</strong> The reactor or IoT gateway was not active or data was not stored in BigQuery table <code>{site}</code> at this time.
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#e5e7eb',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#f59e0b' }}>2. Date or time range mismatch:</strong> The start/end date or 24-hour time entered in <strong>Step 1</strong> might be before or after the actual physical run.
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#e5e7eb',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#f59e0b' }}>3. Site selection:</strong> Verify if the run occurred on <strong>UCS</strong>, <strong>SMP 3RX Skid</strong>, or <strong>SDR</strong>.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          {onNavigateTab && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onNavigateTab('basic');
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                padding: '9px 18px',
                fontSize: '0.85rem',
                gap: '6px',
                border: 'none'
              }}
            >
              <span>Edit Date & Time (Step 1)</span>
              <ArrowRight size={15} />
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '9px 16px', fontSize: '0.85rem' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
