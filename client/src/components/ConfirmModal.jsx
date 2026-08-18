import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger }) {
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

  const modalContent = (
    <div className="modal-backdrop-fixed" onClick={onCancel}>
      <div
        className="glass-panel modal-dialog-fixed"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '28px',
          borderTop: danger ? '3px solid #ef4444' : '3px solid #f59e0b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertTriangle size={22} color={danger ? '#ef4444' : '#f59e0b'} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title || 'Confirm Action'}</h3>
          <button onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              background: danger ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined
            }}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
