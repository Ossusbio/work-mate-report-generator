import React, { useState } from 'react';
import { Plus, Trash2, Clock, FlaskConical, Droplets, Eye } from 'lucide-react';

/**
 * DynamicSampleTable - Reusable multi-entry sample log table
 * Used for both GC (Gas Chromatography) and Water Sample entries
 * Supports T1, T2, T3... time-series entries during a run
 */
export default function DynamicSampleTable({ type, entries, onChange, disabled = false }) {
  const isGC = type === 'gc';
  const title = isGC ? 'Gas Chromatography (GC) Samples' : 'Water Quality Samples';
  const Icon = isGC ? FlaskConical : Droplets;
  const accentColor = isGC ? '#06b6d4' : '#10b981';

  // Columns config
  const columns = isGC
    ? [
        { key: 'sampleTime', label: 'Time Taken', type: 'time', placeholder: '10:30' },
        { key: 'h2Pct', label: 'H₂ (%)', type: 'number', placeholder: '68.5' },
        { key: 'co2Pct', label: 'CO₂ (%)', type: 'number', placeholder: '31.2' },
        { key: 'sampleName', label: 'Sample Name', type: 'text', placeholder: 'GC-SAMP-01' },
      ]
    : [
        { key: 'sampleTime', label: 'Time Taken', type: 'time', placeholder: '10:30' },
        { key: 'ph', label: 'pH', type: 'number', placeholder: '7.2' },
        { key: 'tds', label: 'TDS (ppm)', type: 'number', placeholder: '420' },
        { key: 'ec', label: 'EC (mS/cm)', type: 'number', placeholder: '650' },
        { key: 'sampleName', label: 'Sample Name', type: 'text', placeholder: 'WATER-OUT-01' },
      ];

  const createEmptyEntry = () => {
    const entry = { id: `${type}-${Date.now()}`, label: `T${entries.length + 1}` };
    columns.forEach(col => { entry[col.key] = ''; });
    return entry;
  };

  const handleAdd = () => {
    onChange([...entries, createEmptyEntry()]);
  };

  const handleRemove = (index) => {
    if (entries.length <= 1) return;
    const updated = entries.filter((_, i) => i !== index);
    // Re-label T1, T2, T3...
    updated.forEach((e, i) => { e.label = `T${i + 1}`; });
    onChange(updated);
  };

  const handleCellChange = (index, key, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.5)',
      borderRadius: '14px',
      border: `1px solid ${accentColor}25`,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: `${accentColor}08`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={18} color={accentColor} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h4>
          <span className="badge" style={{
            background: `${accentColor}20`,
            color: accentColor,
            border: `1px solid ${accentColor}40`,
            fontSize: '0.7rem'
          }}>
            {entries.length} {entries.length === 1 ? 'sample' : 'samples'} logged
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '0.8rem',
            color: accentColor,
            borderColor: `${accentColor}40`,
            background: `${accentColor}10`
          }}
        >
          <Plus size={14} />
          <span>Add Sample (T{entries.length + 1})</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <table style={{ width: '100%', minWidth: isGC ? '520px' : '640px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
              <th style={{
                padding: '10px 16px',
                color: accentColor,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textAlign: 'center',
                width: '60px'
              }}>
                Run
              </th>
              {columns.map(col => (
                <th key={col.key} style={{
                  padding: '10px 14px',
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textAlign: 'left'
                }}>
                  {col.label}
                </th>
              ))}
              <th style={{ padding: '10px 14px', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.id || idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* T-Label (T1, T2, T3...) */}
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${accentColor}20`,
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: `1px solid ${accentColor}40`
                  }}>
                    {entry.label}
                  </span>
                </td>

                {/* Data Cells */}
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '6px 10px' }}>
                    <input
                      type={col.type === 'number' ? 'number' : col.type === 'time' ? 'time' : 'text'}
                      step={col.type === 'number' ? '0.01' : undefined}
                      className="form-input"
                      placeholder={col.placeholder}
                      value={entry[col.key] || ''}
                      onChange={(e) => handleCellChange(idx, col.key, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        background: entry[col.key] ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)',
                        borderColor: entry[col.key] ? `${accentColor}30` : 'rgba(255, 255, 255, 0.08)'
                      }}
                    />
                  </td>
                ))}

                {/* Remove Button */}
                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    disabled={entries.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: entries.length <= 1 ? 'not-allowed' : 'pointer',
                      color: entries.length <= 1 ? '#374151' : '#f43f5e',
                      opacity: entries.length <= 1 ? 0.3 : 0.6,
                      padding: '6px',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (entries.length > 1) e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { if (entries.length > 1) e.currentTarget.style.opacity = 0.6; }}
                    title="Remove this sample entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Last Entry Summary Footer */}
      {entries.length > 0 && entries[entries.length - 1] && (() => {
        const last = entries[entries.length - 1];
        const hasData = columns.some(c => last[c.key]);
        if (!hasData) return null;

        return (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: `${accentColor}05`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#9ca3af'
          }}>
            <Eye size={14} color={accentColor} />
            <span style={{ fontWeight: 500, color: accentColor }}>Last entry ({last.label}):</span>
            {columns.map(col => (
              last[col.key] ? (
                <span key={col.key} style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}>
                  {col.label}: <strong style={{ color: '#e5e7eb' }}>{last[col.key]}</strong>
                </span>
              ) : null
            ))}
          </div>
        );
      })()}
    </div>
  );
}
