import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';

export default function InvalidParametersModal({ open, errors = [], onClose, onNavigateTab }) {
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

  if (!open || !errors || errors.length === 0) return null;

  const modalContent = (
    <div className="modal-backdrop-fixed" onClick={onClose}>
      <div
        className="glass-panel modal-dialog-fixed"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '28px',
          maxWidth: '520px',
          borderTop: '4px solid #f43f5e',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 20px rgba(244, 63, 94, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} color="#f43f5e" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fecdd3' }}>
              Invalid Parameters Detected
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              {errors.length} issue{errors.length > 1 ? 's' : ''} must be resolved to generate the report
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
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
          {errors.map((err, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                <AlertCircle size={17} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#fb7185', letterSpacing: '0.04em' }}>
                    {err.stepLabel || 'Parameter Error'}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#f3f4f6', marginTop: '2px', fontWeight: 500 }}>
                    {err.message}
                  </div>
                </div>
              </div>

              {err.tabKey && onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab(err.tabKey);
                    onClose();
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    gap: '4px',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    flexShrink: 0
                  }}
                  title={`Go to ${err.stepLabel}`}
                >
                  <span>Fix</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)'
            }}
          >
            Review & Fix Parameters
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
