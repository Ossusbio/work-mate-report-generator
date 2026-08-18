import React from 'react';
import { Zap } from 'lucide-react';

const FIELDS = [
  { key: 'electrodeType', label: 'Type of Electrode', type: 'text', placeholder: 'e.g. DSA, MMO, Graphite' },
  { key: 'electricalConnection', label: 'Electrical Connection', type: 'text', placeholder: 'e.g. Monopolar, Bipolar' },
  { key: 'numElectrodes', label: 'No. of Electrodes/Cells', type: 'number', placeholder: 'e.g. 12' },
  { key: 'coatingType', label: 'Coating Type', type: 'text', placeholder: 'e.g. RuO2, IrO2, Pt' },
  { key: 'currentDensityM2', label: 'A/m\u00B2 (Current Density)', type: 'number', step: '0.01', placeholder: 'e.g. 50' },
  { key: 'currentDensityM3', label: 'A/m\u00B3 (Volumetric CD)', type: 'number', step: '0.01', placeholder: 'e.g. 100' },
  { key: 'anodeArea', label: 'Anode m\u00B2', type: 'number', step: '0.001', placeholder: 'e.g. 0.5' },
  { key: 'cathodeArea', label: 'Cathode m\u00B2', type: 'number', step: '0.001', placeholder: 'e.g. 0.5' },
  { key: 'areaPerVolume', label: 'm\u00B2/m\u00B3', type: 'number', step: '0.01', placeholder: 'e.g. 25' },
  { key: 'kwhr', label: 'KWhr', type: 'number', step: '0.01', placeholder: 'e.g. 5.2' },
  { key: 'faradaicEfficiency', label: 'FE%', type: 'number', step: '0.1', placeholder: 'e.g. 85' },
];

export default function ElectrodeDetails({ electrode, onChange, disabled = false }) {
  const handleChange = (key, value) => {
    if (disabled) return;
    onChange({ ...electrode, [key]: value });
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Zap size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Electrode Configuration</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '20px', lineHeight: 1.5 }}>
          Enter electrode and cell specifications for this run. All fields are optional.
        </p>

        <div className="responsive-grid-3" style={{ gap: '16px' }}>
          {FIELDS.map(f => (
            <div key={f.key} className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{f.label}</label>
              <input
                type={f.type}
                step={f.step}
                className="form-input"
                placeholder={f.placeholder}
                value={electrode?.[f.key] || ''}
                onChange={(e) => handleChange(f.key, f.type === 'number' ? e.target.value : e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
