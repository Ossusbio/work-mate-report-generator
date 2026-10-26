import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Power, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Table as TableIcon,
  LineChart as ChartIcon,
  Filter,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { fetchPowerSupplyTelemetry, sendPowerSupplyCommand, fetchPowerSupplyHistory } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
import './PowerSupplyControl.css';

// Flag to temporarily disable remote control commands to the power supplies
const IS_CONTROL_DISABLED = false;

export default function PowerSupplyControl() {
  const [subTab, setSubTab] = useState('realtime'); // 'realtime' | 'history'
  const [activeDeviceFilter, setActiveDeviceFilter] = useState('ALL'); // 'ALL' | 'PSU1' | 'PSU2'
  
  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    PSU1: { device: 'PSU1', vout: 0, iout: 0, power: 0, mode: 'CV', output_on: false, isOnline: false },
    PSU2: { device: 'PSU2', vout: 0, iout: 0, power: 0, mode: '--', output_on: false, isOnline: false }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  // Local control inputs state
  const [controls, setControls] = useState({
    PSU1: { voltage: 3.3, current: 1.0, output: false },
    PSU2: { voltage: 5.0, current: 1.0, output: false }
  });

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [timePreset, setTimePreset] = useState('1h'); // '15m' | '1h' | '3h' | '6h' | '24h' | 'custom'
  
  // Default date/time pickers
  const getIsoStringForInput = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [startDateInput, setStartDateInput] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return getIsoStringForInput(d);
  });
  const [endDateInput, setEndDateInput] = useState(() => getIsoStringForInput(new Date()));

  // Table pagination state
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 15;

  const toastTimeoutRef = useRef(null);
  const lastCommandTimeRef = useRef({ PSU1: 0, PSU2: 0 });

  const showToast = (message, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, isError });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  // Poll real-time telemetry
  const loadTelemetry = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);
    try {
      const res = await fetchPowerSupplyTelemetry();
      if (res && res.devices) {
        setTelemetry(res.devices);
        setLastUpdated(new Date().toLocaleTimeString());

        // Sync local output state with real hardware output_on (with 6s grace window for live commands)
        const nowMs = Date.now();
        setControls(prev => ({
          PSU1: {
            ...prev.PSU1,
            output: (nowMs - (lastCommandTimeRef.current.PSU1 || 0) < 6000)
              ? prev.PSU1.output
              : Boolean(res.devices.PSU1?.output_on),
          },
          PSU2: {
            ...prev.PSU2,
            output: (nowMs - (lastCommandTimeRef.current.PSU2 || 0) < 6000)
              ? prev.PSU2.output
              : Boolean(res.devices.PSU2?.output_on),
          }
        }));
      }
    } catch (err) {
      if (!isBackground) {
        showToast(`Failed to fetch telemetry: ${err.message}`, true);
      }
    } finally {
      if (!isBackground) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(() => loadTelemetry(true), 2500);
    return () => clearInterval(interval);
  }, [loadTelemetry]);

  // Load Historical data
  const loadHistoryData = useCallback(async (start, end, dev = 'ALL') => {
    setHistoryLoading(true);
    try {
      const res = await fetchPowerSupplyHistory({
        startDate: start,
        endDate: end,
        device: dev,
        limit: 10000
      });
      if (res && res.records) {
        setHistoryRecords(res.records);
        setTablePage(1);
      }
    } catch (err) {
      showToast(`Error fetching history: ${err.message}`, true);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Handle preset range change
  const applyPreset = (preset) => {
    setTimePreset(preset);
    const now = new Date();
    let start = new Date();

    if (preset === '15m') start.setMinutes(now.getMinutes() - 15);
    else if (preset === '1h') start.setHours(now.getHours() - 1);
    else if (preset === '3h') start.setHours(now.getHours() - 3);
    else if (preset === '6h') start.setHours(now.getHours() - 6);
    else if (preset === '24h') start.setHours(now.getHours() - 24);

    setStartDateInput(getIsoStringForInput(start));
    setEndDateInput(getIsoStringForInput(now));
    loadHistoryData(start.toISOString(), now.toISOString(), activeDeviceFilter);
  };

  // Initial history load when switching to history tab
  useEffect(() => {
    if (subTab === 'history' && historyRecords.length === 0) {
      applyPreset('1h');
    }
  }, [subTab]);

  const handleCustomQuery = () => {
    setTimePreset('custom');
    const startIso = new Date(startDateInput).toISOString();
    const endIso = new Date(endDateInput).toISOString();
    loadHistoryData(startIso, endIso, activeDeviceFilter);
  };

  // Handle command execution
  const executeCommand = async (device, action, value = null) => {
    if (IS_CONTROL_DISABLED) {
      showToast('Power supply control is temporarily disabled.', true);
      return;
    }
    setLoading(true);
    const nowMs = Date.now();

    // Optimistic UI update
    if (action === 'set_output') {
      const isEnable = Boolean(value);
      if (device === 'ALL') {
        lastCommandTimeRef.current.PSU1 = nowMs;
        lastCommandTimeRef.current.PSU2 = nowMs;
        setControls(prev => ({
          PSU1: { ...prev.PSU1, output: isEnable },
          PSU2: { ...prev.PSU2, output: isEnable }
        }));
      } else {
        if (lastCommandTimeRef.current[device] !== undefined) {
          lastCommandTimeRef.current[device] = nowMs;
        }
        setControls(prev => ({
          ...prev,
          [device]: { ...prev[device], output: isEnable }
        }));
      }
    } else if (action === 'emergency_stop') {
      if (device === 'ALL') {
        lastCommandTimeRef.current.PSU1 = nowMs;
        lastCommandTimeRef.current.PSU2 = nowMs;
        setControls(prev => ({
          PSU1: { ...prev.PSU1, output: false },
          PSU2: { ...prev.PSU2, output: false }
        }));
      } else {
        if (lastCommandTimeRef.current[device] !== undefined) {
          lastCommandTimeRef.current[device] = nowMs;
        }
        setControls(prev => ({
          ...prev,
          [device]: { ...prev[device], output: false }
        }));
      }
    }

    try {
      const res = await sendPowerSupplyCommand(device, action, value);
      if (res && res.success) {
        const actionLabel = action.replace('_', ' ').toUpperCase();
        const devLabel = device === 'ALL' ? 'ALL PSUs' : device;
        const valLabel = action === 'set_output' ? (value ? 'ON' : 'OFF') : (value !== null ? `: ${value}` : '');
        showToast(`✓ [${devLabel}] ${actionLabel} ${valLabel} executed`);

        setTimeout(() => loadTelemetry(true), 1500);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Prepare Chart.js data
  const chartData = useMemo(() => {
    if (!historyRecords || historyRecords.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Downsample if more than 300 points for smooth performance
    const step = Math.max(1, Math.floor(historyRecords.length / 300));
    const sampled = historyRecords.filter((_, idx) => idx % step === 0);

    const labels = sampled.map(r => {
      const d = new Date(r.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    });

    const datasets = [];

    // Filter points by PSU1
    if (activeDeviceFilter === 'ALL' || activeDeviceFilter === 'PSU1') {
      datasets.push({
        label: 'PSU 1 Voltage (V)',
        data: sampled.map(r => (r.device === 'PSU1' ? (r.output_on ? r.vout : 0) : null)),
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.05)',
        borderWidth: 2,
        pointRadius: sampled.length > 50 ? 0 : 2,
        yAxisID: 'yVoltage',
        tension: 0.2,
        spanGaps: true,
      });
      datasets.push({
        label: 'PSU 1 Current (A)',
        data: sampled.map(r => (r.device === 'PSU1' ? (r.output_on ? r.iout : 0) : null)),
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        borderWidth: 1.8,
        borderDash: [4, 4],
        pointRadius: sampled.length > 50 ? 0 : 2,
        yAxisID: 'yCurrent',
        tension: 0.2,
        spanGaps: true,
      });
    }

    // Filter points by PSU2
    if (activeDeviceFilter === 'ALL' || activeDeviceFilter === 'PSU2') {
      datasets.push({
        label: 'PSU 2 Voltage (V)',
        data: sampled.map(r => (r.device === 'PSU2' ? (r.output_on ? r.vout : 0) : null)),
        borderColor: '#9333EA',
        backgroundColor: 'rgba(147, 51, 234, 0.05)',
        borderWidth: 2,
        pointRadius: sampled.length > 50 ? 0 : 2,
        yAxisID: 'yVoltage',
        tension: 0.2,
        spanGaps: true,
      });
      datasets.push({
        label: 'PSU 2 Current (A)',
        data: sampled.map(r => (r.device === 'PSU2' ? (r.output_on ? r.iout : 0) : null)),
        borderColor: '#F59E0B',
        backgroundColor: 'transparent',
        borderWidth: 1.8,
        borderDash: [4, 4],
        pointRadius: sampled.length > 50 ? 0 : 2,
        yAxisID: 'yCurrent',
        tension: 0.2,
        spanGaps: true,
      });
    }

    return { labels, datasets };
  }, [historyRecords, activeDeviceFilter]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12, weight: 600 },
          color: '#334155',
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'monospace', size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { family: 'monospace', size: 11 }, color: '#64748B', maxTicksLimit: 12 }
      },
      yVoltage: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Voltage (V)', color: '#0284C7', font: { weight: 700 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#0284C7' },
        min: 0,
      },
      yCurrent: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Current (A)', color: '#059669', font: { weight: 700 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#059669' },
        min: 0,
      }
    }
  };

  // Export CSV
  const handleDownloadCSV = () => {
    if (!historyRecords || historyRecords.length === 0) {
      showToast('No data to export', true);
      return;
    }

    const headers = ['Timestamp_UTC', 'Timestamp_Local', 'Device', 'Voltage_V', 'Current_A', 'Power_W', 'Mode', 'Output_State'];
    const rows = historyRecords.map(r => {
      const d = new Date(r.timestamp);
      const isOutOn = Boolean(r.output_on);
      return [
        r.timestamp,
        d.toLocaleString(),
        r.device,
        isOutOn ? r.vout : 0,
        isOutOn ? r.iout : 0,
        isOutOn ? r.power : 0,
        isOutOn ? r.mode : 'OFF',
        isOutOn ? 'ON' : 'OFF'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `metravi_telemetry_${activeDeviceFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${historyRecords.length} records to CSV`);
  };

  // Paginated table records
  const paginatedRecords = useMemo(() => {
    const startIdx = (tablePage - 1) * rowsPerPage;
    return historyRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [historyRecords, tablePage]);

  const totalPages = Math.ceil(historyRecords.length / rowsPerPage) || 1;

  // Real-time PSU Card Renderer
  const renderPsuCard = (devKey, title, themeColor, borderAccent) => {
    const data = telemetry[devKey] || { vout: 0, iout: 0, power: 0, mode: '--', output_on: false, isOnline: false };
    const devCtrl = controls[devKey];
    const isOnline = Boolean(data.isOnline);

    return (
      <div 
        className="glass-panel psu-card" 
        style={{ 
          borderTop: `4px solid ${isOnline ? borderAccent : '#94A3B8'}`,
          opacity: isOnline ? 1 : 0.88 
        }}
      >
        {/* Header */}
        <div className="psu-card-header">
          <div className="psu-card-title-group">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isOnline ? `linear-gradient(135deg, ${borderAccent}, ${themeColor})` : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>{title}</h3>
              <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Topic Target: <code>{devKey}</code></div>
            </div>
          </div>

          <div className="psu-badge-group">
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: !isOnline ? 'rgba(100, 116, 139, 0.12)' : (devCtrl.output ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)'),
              color: !isOnline ? '#64748B' : (devCtrl.output ? '#059669' : '#dc2626'),
              border: `1px solid ${!isOnline ? 'rgba(100, 116, 139, 0.3)' : (devCtrl.output ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)')}`,
              whiteSpace: 'nowrap'
            }}>
              {!isOnline ? 'DISCONNECTED' : `OUTPUT ${devCtrl.output ? 'ON' : 'OFF'}`}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: !isOnline ? 'rgba(100, 116, 139, 0.08)' : (data.mode === 'CV' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(245, 158, 11, 0.15)'),
              color: !isOnline ? '#94A3B8' : (data.mode === 'CV' ? '#0284C7' : '#d97706'),
              border: `1px solid ${!isOnline ? 'rgba(100, 116, 139, 0.2)' : (data.mode === 'CV' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(245, 158, 11, 0.3)')}`,
              whiteSpace: 'nowrap'
            }}>
              {!isOnline ? '--' : (data.mode || 'CV')}
            </span>
          </div>
        </div>

        {/* Offline notice when physical hardware is not plugged into USB */}
        {!isOnline && (
          <div style={{
            background: 'rgba(241, 245, 249, 0.95)',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔌</span>
            <span><strong>{title}</strong> is not physically connected to USB. Controls are isolated to prevent interfering with other devices.</span>
          </div>
        )}

        {/* Digital Gauges */}
        <div className="psu-gauges-grid">
          <div className="psu-gauge-box">
            <div className="psu-gauge-label">Voltage</div>
            <div className="psu-gauge-value" style={{ color: '#0284C7' }}>
              {Number(data.vout || 0).toFixed(2)}<span className="psu-gauge-unit">V</span>
            </div>
            <div className="psu-gauge-subtext">Set: {devCtrl.voltage} V</div>
          </div>

          <div className="psu-gauge-box">
            <div className="psu-gauge-label">Current</div>
            <div className="psu-gauge-value" style={{ color: '#059669' }}>
              {Number(data.iout || 0).toFixed(3)}<span className="psu-gauge-unit">A</span>
            </div>
            <div className="psu-gauge-subtext">Limit: {devCtrl.current} A</div>
          </div>

          <div className="psu-gauge-box">
            <div className="psu-gauge-label">Power</div>
            <div className="psu-gauge-value" style={{ color: '#7C3AED' }}>
              {Number(data.power || 0).toFixed(1)}<span className="psu-gauge-unit">W</span>
            </div>
            <div className="psu-gauge-subtext">P = V &times; I</div>
          </div>
        </div>

        {/* Voltage Control */}
        <div className="psu-control-box">
          <div className="psu-control-header">
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E2219' }}>Voltage Setpoint (0 - 30 V)</label>
            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284C7' }}>{devCtrl.voltage} V</span>
          </div>

          <div className="psu-slider-row">
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="0.1" 
              value={devCtrl.voltage}
              disabled={!isOnline || IS_CONTROL_DISABLED}
              onChange={(e) => setControls(prev => ({
                ...prev,
                [devKey]: { ...prev[devKey], voltage: parseFloat(e.target.value) }
              }))}
              className="psu-slider-input"
              style={{ accentColor: (isOnline && !IS_CONTROL_DISABLED) ? borderAccent : '#94A3B8' }}
            />
            <input 
              type="number" 
              min="0" 
              max="30" 
              step="0.1" 
              value={devCtrl.voltage}
              disabled={!isOnline || IS_CONTROL_DISABLED}
              onChange={(e) => setControls(prev => ({
                ...prev,
                [devKey]: { ...prev[devKey], voltage: parseFloat(e.target.value) || 0 }
              }))}
              className="psu-number-input"
            />
            <button 
              className="btn btn-primary psu-apply-btn"
              onClick={() => executeCommand(devKey, 'set_voltage', parseFloat(devCtrl.voltage))}
              disabled={loading || !isOnline || IS_CONTROL_DISABLED}
              style={{ opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.5 : 1, cursor: IS_CONTROL_DISABLED ? 'not-allowed' : 'pointer' }}
              title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : 'Apply Voltage'}
            >
              Apply
            </button>
          </div>

          <div className="psu-presets-row">
            {[3.3, 5.0, 9.0, 12.0, 24.0].map(v => (
              <button
                key={v}
                className="psu-preset-pill"
                disabled={loading || !isOnline || IS_CONTROL_DISABLED}
                style={{ opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.45 : 1, cursor: IS_CONTROL_DISABLED ? 'not-allowed' : 'pointer' }}
                title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : `Set ${v}V`}
                onClick={() => {
                  setControls(prev => ({
                    ...prev,
                    [devKey]: { ...prev[devKey], voltage: v }
                  }));
                  executeCommand(devKey, 'set_voltage', v);
                }}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        {/* Current Control */}
        <div className="psu-control-box" style={{ marginBottom: '20px' }}>
          <div className="psu-control-header">
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E2219' }}>Current Limit (0 - 5 A)</label>
            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, color: isOnline ? '#059669' : '#94A3B8' }}>{devCtrl.current} A</span>
          </div>

          <div className="psu-slider-row">
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.05" 
              value={devCtrl.current}
              disabled={!isOnline || IS_CONTROL_DISABLED}
              onChange={(e) => setControls(prev => ({
                ...prev,
                [devKey]: { ...prev[devKey], current: parseFloat(e.target.value) }
              }))}
              className="psu-slider-input"
              style={{ accentColor: (isOnline && !IS_CONTROL_DISABLED) ? '#059669' : '#94A3B8' }}
            />
            <input 
              type="number" 
              min="0" 
              max="5" 
              step="0.05" 
              value={devCtrl.current}
              disabled={!isOnline || IS_CONTROL_DISABLED}
              onChange={(e) => setControls(prev => ({
                ...prev,
                [devKey]: { ...prev[devKey], current: parseFloat(e.target.value) || 0 }
              }))}
              className="psu-number-input"
            />
            <button 
              className="btn btn-primary psu-apply-btn"
              onClick={() => executeCommand(devKey, 'set_current', parseFloat(devCtrl.current))}
              disabled={loading || !isOnline || IS_CONTROL_DISABLED}
              style={{ opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.5 : 1, cursor: IS_CONTROL_DISABLED ? 'not-allowed' : 'pointer' }}
              title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : 'Apply Current'}
            >
              Apply
            </button>
          </div>

          <div className="psu-presets-row">
            {[0.5, 1.0, 2.0, 3.0, 5.0].map(i => (
              <button
                key={i}
                className="psu-preset-pill"
                disabled={loading || !isOnline || IS_CONTROL_DISABLED}
                style={{ opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.45 : 1, cursor: IS_CONTROL_DISABLED ? 'not-allowed' : 'pointer' }}
                title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : `Set ${i}A`}
                onClick={() => {
                  setControls(prev => ({
                    ...prev,
                    [devKey]: { ...prev[devKey], current: i }
                  }));
                  executeCommand(devKey, 'set_current', i);
                }}
              >
                {i}A
              </button>
            ))}
          </div>
        </div>

        {/* Output Controls: Dedicated ON, OFF, and Stop buttons */}
        <div className="psu-actions-grid">
          <button 
            className="psu-btn-on"
            onClick={() => executeCommand(devKey, 'set_output', 1)}
            disabled={loading || !isOnline || IS_CONTROL_DISABLED}
            style={{
              border: (isOnline && !IS_CONTROL_DISABLED && devCtrl.output) ? '2px solid #059669' : '1px solid rgba(0,0,0,0.12)',
              background: (isOnline && !IS_CONTROL_DISABLED && devCtrl.output) ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'rgba(255, 255, 255, 0.95)',
              color: (isOnline && !IS_CONTROL_DISABLED && devCtrl.output) ? '#ffffff' : (isOnline && !IS_CONTROL_DISABLED ? '#059669' : '#94A3B8'),
              boxShadow: (isOnline && !IS_CONTROL_DISABLED && devCtrl.output) ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.45 : 1,
              cursor: (!isOnline || IS_CONTROL_DISABLED) ? 'not-allowed' : 'pointer',
            }}
            title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : 'Turn ON'}
          >
            <Power size={18} />
            <span>Turn ON</span>
          </button>

          <button 
            className="psu-btn-off"
            onClick={() => executeCommand(devKey, 'set_output', 0)}
            disabled={loading || !isOnline || IS_CONTROL_DISABLED}
            style={{
              border: (isOnline && !IS_CONTROL_DISABLED && !devCtrl.output) ? '2px solid #dc2626' : '1px solid rgba(0,0,0,0.12)',
              background: (isOnline && !IS_CONTROL_DISABLED && !devCtrl.output) ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'rgba(255, 255, 255, 0.95)',
              color: (isOnline && !IS_CONTROL_DISABLED && !devCtrl.output) ? '#ffffff' : (isOnline && !IS_CONTROL_DISABLED ? '#dc2626' : '#94A3B8'),
              boxShadow: (isOnline && !IS_CONTROL_DISABLED && !devCtrl.output) ? '0 4px 14px rgba(220, 38, 38, 0.35)' : 'none',
              opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.45 : 1,
              cursor: (!isOnline || IS_CONTROL_DISABLED) ? 'not-allowed' : 'pointer',
            }}
            title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : 'Turn OFF'}
          >
            <Power size={18} />
            <span>Turn OFF</span>
          </button>

          <button 
            className="psu-btn-stop"
            onClick={() => executeCommand(devKey, 'emergency_stop')}
            disabled={loading || !isOnline || IS_CONTROL_DISABLED}
            style={{
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: (isOnline && !IS_CONTROL_DISABLED) ? '#dc2626' : '#94A3B8',
              opacity: (!isOnline || IS_CONTROL_DISABLED) ? 0.45 : 1,
              cursor: (!isOnline || IS_CONTROL_DISABLED) ? 'not-allowed' : 'pointer',
            }}
            title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : `Stop ${devKey}`}
          >
            Stop {devKey}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in psu-container">
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          padding: '14px 22px',
          borderRadius: '12px',
          background: toast.isError ? '#dc2626' : '#0284C7',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="glass-panel psu-header-panel">
        <div className="psu-header-content">
          <div className="psu-title-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Zap size={20} color="#0284C7" />
              <span style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hardware Console & Analytics
              </span>
            </div>
            <h2>
              Metravi Dual Power Supply System
            </h2>
            <p>
              Real-time remote control via Google Cloud Pub/Sub & telemetry analytics via BigQuery.
            </p>
          </div>

          <div className="psu-header-actions">
            <button 
              onClick={() => loadTelemetry(false)}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: '0.85rem', gap: '8px' }}
              title="Refresh telemetry"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{lastUpdated ? `Live: ${lastUpdated}` : 'Sync'}</span>
            </button>

            <button 
              onClick={() => executeCommand('ALL', 'emergency_stop')}
              disabled={loading || IS_CONTROL_DISABLED}
              className="psu-emergency-all-btn"
              style={{
                opacity: IS_CONTROL_DISABLED ? 0.45 : 1,
                cursor: IS_CONTROL_DISABLED ? 'not-allowed' : 'pointer'
              }}
              title={IS_CONTROL_DISABLED ? 'Power supply control is temporarily disabled' : 'Emergency Stop All'}
            >
              <AlertOctagon size={18} />
              <span>EMERGENCY ALL OFF</span>
            </button>
          </div>
        </div>

        {/* Primary View Switcher: Real-Time Control vs Historical Analytics */}
        <div className="psu-view-tabs">
          <button
            onClick={() => setSubTab('realtime')}
            className={`psu-view-tab-btn ${subTab === 'realtime' ? 'active' : ''}`}
          >
            <Sliders size={17} />
            <span>Real-Time Control</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`psu-view-tab-btn ${subTab === 'history' ? 'active' : ''}`}
          >
            <ChartIcon size={17} />
            <span>Historical Graphs & Raw Data</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME CONTROL TAB */}
      {/* ========================================================================= */}
      {subTab === 'realtime' && (
        <div>
          {/* Temporary Control Disabled Banner */}
          {IS_CONTROL_DISABLED && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#dc2626'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, color: '#dc2626' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#b91c1c' }}>
                  Power Supply Control is Temporarily Disabled
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>
                  Remote hardware commands (voltage, current, and power output controls) are temporarily locked. Real-time telemetry monitoring and historical graphs remain active.
                </span>
              </div>
            </div>
          )}

          {/* Target device filter in Real-Time */}
          <div className="psu-device-filter-bar">
            {[
              { id: 'ALL', label: 'Dual View (PSU 1 & 2)' },
              { id: 'PSU1', label: 'Metravi PSU 1 Only' },
              { id: 'PSU2', label: 'Metravi PSU 2 Only' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDeviceFilter(tab.id)}
                className="psu-device-filter-btn"
                style={{
                  border: activeDeviceFilter === tab.id ? '1px solid #0284C7' : '1px solid rgba(0,0,0,0.1)',
                  background: activeDeviceFilter === tab.id ? '#0284C7' : '#ffffff',
                  color: activeDeviceFilter === tab.id ? '#ffffff' : '#64748B',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`psu-cards-grid ${activeDeviceFilter !== 'ALL' ? 'single-column' : ''}`}>
            {(activeDeviceFilter === 'ALL' || activeDeviceFilter === 'PSU1') && renderPsuCard('PSU1', 'Metravi PSU 1', '#0284C7', '#0284C7')}
            {(activeDeviceFilter === 'ALL' || activeDeviceFilter === 'PSU2') && renderPsuCard('PSU2', 'Metravi PSU 2', '#9333EA', '#9333EA')}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORICAL GRAPHS & RAW DATA TAB */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="animate-fade-in">
          
          {/* Filter Bar */}
          <div className="glass-panel psu-history-filter-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="#0284C7" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2E2219' }}>Time & Device Filters</span>
              </div>

              {/* Preset Buttons */}
              <div className="psu-history-presets">
                {[
                  { id: '15m', label: 'Last 15m' },
                  { id: '1h', label: 'Last 1h' },
                  { id: '3h', label: 'Last 3h' },
                  { id: '6h', label: 'Last 6h' },
                  { id: '24h', label: 'Last 24h' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: timePreset === p.id ? '1px solid #0284C7' : '1px solid rgba(0,0,0,0.1)',
                      background: timePreset === p.id ? '#0284C7' : '#ffffff',
                      color: timePreset === p.id ? '#ffffff' : '#64748B',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs & Device Selector */}
            <div className="psu-history-inputs-grid">
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Start Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  End Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Power Supply Filter
                </label>
                <select
                  value={activeDeviceFilter}
                  onChange={(e) => {
                    const dev = e.target.value;
                    setActiveDeviceFilter(dev);
                    loadHistoryData(new Date(startDateInput).toISOString(), new Date(endDateInput).toISOString(), dev);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="ALL">All Power Supplies</option>
                  <option value="PSU1">Metravi PSU 1</option>
                  <option value="PSU2">Metravi PSU 2</option>
                </select>
              </div>

              <div className="psu-history-btn-group">
                <button
                  onClick={handleCustomQuery}
                  disabled={historyLoading}
                  className="btn btn-primary"
                  style={{ padding: '9px 18px', fontSize: '0.85rem', borderRadius: '8px', gap: '6px', minHeight: '38px' }}
                >
                  <RefreshCw size={15} className={historyLoading ? 'animate-spin' : ''} />
                  <span>Query Data</span>
                </button>

                <button
                  onClick={handleDownloadCSV}
                  disabled={historyRecords.length === 0}
                  className="btn btn-secondary"
                  style={{ padding: '9px 16px', fontSize: '0.85rem', borderRadius: '8px', gap: '6px', minHeight: '38px' }}
                  title="Export raw data to CSV file"
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Graph Card */}
          <div className="glass-panel psu-chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChartIcon size={20} color="#0284C7" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
                  Telemetry Trend (Voltage & Current)
                </h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                {historyRecords.length} records plotted
              </div>
            </div>

            <div className="psu-chart-canvas-container">
              {historyLoading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ marginRight: '8px' }} />
                  <span>Loading BigQuery telemetry records...</span>
                </div>
              ) : historyRecords.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  No telemetry records found for this time window. Try adjusting the date filter.
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Raw Data Table Card */}
          <div className="glass-panel psu-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TableIcon size={20} color="#0284C7" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
                  Raw BigQuery Telemetry Table
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Showing {paginatedRecords.length} of {historyRecords.length} rows
              </span>
            </div>

            <div className="psu-table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.03)', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Timestamp (Local)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Device</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#0284C7' }}>Voltage (V)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>Current (A)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#7C3AED' }}>Power (W)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Mode</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Output</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                        No records to display.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, i) => {
                      const d = new Date(r.timestamp);
                      return (
                        <tr 
                          key={i} 
                          style={{ 
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                            background: i % 2 === 0 ? '#ffffff' : 'rgba(0,0,0,0.015)' 
                          }}
                        >
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#334155' }}>
                            {d.toLocaleDateString()} {d.toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: r.device === 'PSU1' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(147, 51, 234, 0.12)',
                              color: r.device === 'PSU1' ? '#0284C7' : '#9333EA',
                            }}>
                              {r.device}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 700, color: r.output_on ? '#0284C7' : '#94A3B8' }}>
                            {(r.output_on ? r.vout : 0).toFixed(2)} V
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 700, color: r.output_on ? '#059669' : '#94A3B8' }}>
                            {(r.output_on ? r.iout : 0).toFixed(3)} A
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 700, color: r.output_on ? '#7C3AED' : '#94A3B8' }}>
                            {(r.output_on ? r.power : 0).toFixed(1)} W
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: !r.output_on ? 'rgba(148, 163, 184, 0.15)' : (r.mode === 'CV' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(245, 158, 11, 0.15)'),
                              color: !r.output_on ? '#64748B' : (r.mode === 'CV' ? '#0284C7' : '#d97706'),
                            }}>
                              {r.output_on ? r.mode : 'OFF'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: r.output_on ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                              color: r.output_on ? '#059669' : '#dc2626',
                            }}>
                              {r.output_on ? 'ON' : 'OFF'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Page {tablePage} of {totalPages}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setTablePage(p => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                    disabled={tablePage === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
