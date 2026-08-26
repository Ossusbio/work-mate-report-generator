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
          background: '#FFFDF9',
          border: '1px solid var(--color-warm-border)',
          borderTop: '5px solid #2563EB',
          boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.2), 0 0 25px rgba(219, 234, 254, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={22} color="#2563EB" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
              No BigQuery Telemetry Found
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
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
              color: '#64748B',
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
          background: 'rgba(235, 243, 254, 0.55)',
          border: '1px solid var(--color-warm-border)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <MapPin size={14} color="#2563EB" /> Site Table:
            </span>
            <span style={{ fontWeight: 700, color: '#2563EB', fontFamily: 'JetBrains Mono' }}>
              Datas.{site}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Clock size={14} color="#0284C7" /> Queried Window:
            </span>
            <span style={{ fontWeight: 600, color: '#2E2219', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
              {timeWindowDisplay}
            </span>
          </div>
          {breakStartTime && breakEndTime && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Break Excluded:</span>
              <span style={{ color: '#B45309', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', fontWeight: 600 }}>
                {breakStartTime} → {breakEndTime}
              </span>
            </div>
          )}
        </div>

        {/* Potential Reasons & Why It Happened */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Possible Reasons:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: '#FFFDF9',
              border: '1px solid var(--color-warm-border)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#2E2219',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#2563EB' }}>1. No telemetry recorded during this period:</strong> The reactor or IoT gateway was not active or data was not stored in BigQuery table <code style={{ color: '#2E2219', background: 'rgba(235, 243, 254, 0.8)', padding: '2px 4px', borderRadius: '4px' }}>{site}</code> at this time.
            </div>

            <div style={{
              background: '#FFFDF9',
              border: '1px solid var(--color-warm-border)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#2E2219',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#2563EB' }}>2. Date or time range mismatch:</strong> The start/end date or 24-hour time entered in <strong style={{ color: '#2E2219' }}>Step 1</strong> might be before or after the actual physical run.
            </div>

            <div style={{
              background: '#FFFDF9',
              border: '1px solid var(--color-warm-border)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.83rem',
              color: '#2E2219',
              lineHeight: 1.45
            }}>
              <strong style={{ color: '#2563EB' }}>3. Site selection:</strong> Verify if the run occurred on <strong style={{ color: '#2E2219' }}>UCS</strong>, <strong style={{ color: '#2E2219' }}>SMP 3RX Skid</strong>, or <strong style={{ color: '#2E2219' }}>SDR</strong>.
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
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#ffffff',
                padding: '9px 18px',
                fontSize: '0.85rem',
                gap: '6px',
                border: 'none',
                fontWeight: 600
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
            style={{ padding: '9px 16px', fontSize: '0.85rem', color: '#2E2219', borderColor: 'var(--color-warm-border)', fontWeight: 600 }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
