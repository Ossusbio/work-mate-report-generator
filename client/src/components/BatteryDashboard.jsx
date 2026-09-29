import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  BatteryCharging,
  Zap,
  Activity,
  RefreshCw,
  Clock,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Cpu
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
import { fetchEmsTelemetry, fetchEmsHistory } from '../services/api';
import './BatteryDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function BatteryDashboard() {
  const [subTab, setSubTab] = useState('realtime'); // 'realtime' | 'history'
  const [telemetry, setTelemetry] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // History tab states
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [timePreset, setTimePreset] = useState('1h');
  const [startDateInput, setStartDateInput] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endDateInput, setEndDateInput] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const pollTimerRef = useRef(null);

  // Fetch real-time telemetry from API
  const loadTelemetry = useCallback(async () => {
    try {
      const res = await fetchEmsTelemetry();
      if (res && res.success) {
        setTelemetry(res.telemetry);
        setIsOnline(Boolean(res.isOnline));
        setLastSeen(res.lastSeenSeconds || 0);
        if (res.history) {
          setRecentHistory(res.history);
        }
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn('Error polling EMS telemetry:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    loadTelemetry();
    if (autoRefresh) {
      pollTimerRef.current = setInterval(loadTelemetry, 5000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [autoRefresh, loadTelemetry]);

  // Load history records
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      let start = null;
      let end = null;
      const now = new Date();

      if (timePreset === '15m') {
        start = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
      } else if (timePreset === '1h') {
        start = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      } else if (timePreset === '3h') {
        start = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
      } else if (timePreset === '6h') {
        start = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
      } else if (timePreset === '24h') {
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      } else if (timePreset === 'custom') {
        start = new Date(startDateInput).toISOString();
        end = new Date(endDateInput).toISOString();
      }

      const res = await fetchEmsHistory({ startDate: start, endDate: end, limit: 1000 });
      if (res && res.success) {
        setHistoryRecords(res.records || []);
      }
    } catch (err) {
      console.error('Failed to load EMS history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [timePreset, startDateInput, endDateInput]);

  useEffect(() => {
    if (subTab === 'history') {
      loadHistory();
    }
  }, [subTab, loadHistory]);

  // Real-time mini sparkline chart data
  const realtimeChartData = useMemo(() => {
    if (!recentHistory || recentHistory.length === 0) return null;

    const labels = recentHistory.map(r => {
      const d = new Date(r.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });

    const stackVoltages = recentHistory.map(r => r.stackVoltage || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Total Stack Voltage (V)',
          data: stackVoltages,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
        }
      ]
    };
  }, [recentHistory]);

  // History full chart data
  const historyChartData = useMemo(() => {
    if (!historyRecords || historyRecords.length === 0) return null;

    const labels = historyRecords.map(r => {
      const d = new Date(r.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const stackVoltages = historyRecords.map(r => r.stackVoltage || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Stack Voltage (V)',
          data: stackVoltages,
          borderColor: '#0284C7',
          backgroundColor: 'rgba(2, 132, 199, 0.06)',
          fill: true,
          tension: 0.2,
          pointRadius: historyRecords.length > 100 ? 0 : 2,
          yAxisID: 'y'
        }
      ]
    };
  }, [historyRecords]);

  // Export CSV
  const handleExportCsv = () => {
    if (!historyRecords || historyRecords.length === 0) return;
    const headers = ['Timestamp', 'Device', 'Stack_V', 'Sum_Of_Cells_V', 'Delta_V', 'Temp_C', 'Cell_1', 'Cell_2', 'Cell_3', 'Cell_4', 'Cell_5', 'Cell_6', 'Cell_7', 'Cell_8', 'Cell_9', 'Cell_10', 'Cell_11', 'Cell_12'];
    const rows = historyRecords.map(r => {
      const c = r.cells || [];
      return [
        r.timestamp,
        r.deviceId,
        r.stackVoltage,
        r.sumOfCells,
        r.deltaV,
        r.internalTemp ?? '',
        ...Array.from({ length: 12 }, (_, i) => c[i]?.voltage ?? 0)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ems_battery_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cells = telemetry?.cells || Array.from({ length: 12 }, (_, i) => ({ id: i + 1, voltage: 0, isActive: false }));
  const maxCell = telemetry?.maxCell || { id: 1, voltage: 0 };
  const minCell = telemetry?.minCell || { id: 1, voltage: 0 };

  return (
    <div className="ems-container animate-fade-in">
      {/* Top Banner / Header */}
      <div className="ems-header-panel">
        <div className="ems-title-group">
          <div className="ems-badge-row">
            <span className={`ems-tag ${isOnline ? 'ems-tag-online' : 'ems-tag-offline'}`}>
              <div className={isOnline ? 'ems-status-pulse' : 'ems-status-pulse-offline'} />
              {isOnline ? 'LIVE STREAMING' : 'OFFLINE'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              Device: <strong style={{ color: '#1E293B' }}>{telemetry?.deviceId || 'EMS_01'}</strong>
            </span>
            {lastUpdated && (
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {lastUpdated.toLocaleTimeString()} ({lastSeen}s ago)
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BatteryCharging size={28} color="#10B981" />
            EMS Battery Monitor
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
            Real-time LTC6811 12-cell BMS telemetry from STM32 via USB &amp; Google BigQuery
          </p>
        </div>

        {/* Action Buttons & Sub-tab Switcher */}
        <div className="ems-header-actions">
          {/* Sub-Tab Navigation */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setSubTab('realtime')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: subTab === 'realtime' ? '#ffffff' : 'transparent',
                color: subTab === 'realtime' ? '#10B981' : '#64748B',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: subTab === 'realtime' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Real-time
            </button>
            <button
              onClick={() => setSubTab('history')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: subTab === 'history' ? '#ffffff' : 'transparent',
                color: subTab === 'history' ? '#0284C7' : '#64748B',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: subTab === 'history' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              History &amp; Trends
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          {subTab === 'realtime' && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="ems-btn ems-btn-secondary"
              title={autoRefresh ? 'Pause 5s auto-polling' : 'Resume 5s auto-polling'}
            >
              {autoRefresh ? <Pause size={14} color="#10B981" /> : <Play size={14} color="#64748B" />}
              <span>{autoRefresh ? '5s Auto' : 'Paused'}</span>
            </button>
          )}

          {/* Manual Refresh */}
          <button
            onClick={subTab === 'realtime' ? loadTelemetry : loadHistory}
            className="ems-btn ems-btn-primary"
            disabled={loading || historyLoading}
          >
            <RefreshCw size={14} className={loading || historyLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME TAB CONTENT */}
      {subTab === 'realtime' && (
        <>
          {/* Key Metrics Grid */}
          <div className="ems-stats-grid">
            {/* Total Stack Voltage */}
            <div className="ems-stat-card">
              <div className="ems-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                <Zap size={24} color="#10B981" />
              </div>
              <div className="ems-stat-content">
                <span className="ems-stat-label">Stack Voltage</span>
                <span className="ems-stat-value" style={{ color: '#059669' }}>
                  {(telemetry?.stackVoltage ?? 0).toFixed(4)} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>V</span>
                </span>
                <span className="ems-stat-subtext">Sum of cells: {(telemetry?.sumOfCells ?? 0).toFixed(4)} V</span>
              </div>
            </div>

            {/* Active Cells */}
            <div className="ems-stat-card">
              <div className="ems-stat-icon-wrapper" style={{ background: 'rgba(2, 132, 199, 0.12)' }}>
                <Layers size={24} color="#0284C7" />
              </div>
              <div className="ems-stat-content">
                <span className="ems-stat-label">Active Cells</span>
                <span className="ems-stat-value">
                  {telemetry?.activeCellCount ?? 0} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>/ 12</span>
                </span>
                <span className="ems-stat-subtext">{12 - (telemetry?.activeCellCount ?? 0)} empty / unpopulated</span>
              </div>
            </div>

            {/* Max Cell */}
            <div className="ems-stat-card">
              <div className="ems-stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
                <ArrowUpRight size={24} color="#0284C7" />
              </div>
              <div className="ems-stat-content">
                <span className="ems-stat-label">Max Cell (C{maxCell.id})</span>
                <span className="ems-stat-value" style={{ color: '#0284C7' }}>
                  {maxCell.voltage.toFixed(4)} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>V</span>
                </span>
                <span className="ems-stat-subtext">Highest voltage in pack</span>
              </div>
            </div>

            {/* Delta V Imbalance */}
            <div className="ems-stat-card">
              <div className="ems-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <Activity size={24} color="#D97706" />
              </div>
              <div className="ems-stat-content">
                <span className="ems-stat-label">Delta V (Imbalance)</span>
                <span className="ems-stat-value" style={{ color: (telemetry?.deltaV ?? 0) > 0.05 ? '#D97706' : '#1E293B' }}>
                  {((telemetry?.deltaV ?? 0) * 1000).toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>mV</span>
                </span>
                <span className="ems-stat-subtext">Min: C{minCell.id} ({minCell.voltage.toFixed(4)} V)</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="ems-stat-card">
              <div className="ems-stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                <Thermometer size={24} color="#DC2626" />
              </div>
              <div className="ems-stat-content">
                <span className="ems-stat-label">Die Temperature</span>
                <span className="ems-stat-value">
                  {telemetry?.internalTemp !== null && telemetry?.internalTemp !== undefined ? `${telemetry.internalTemp.toFixed(1)}°C` : '--'}
                </span>
                <span className="ems-stat-subtext">NTC: {telemetry?.ntcTemp !== null && telemetry?.ntcTemp !== undefined ? `${telemetry.ntcTemp.toFixed(1)}°C` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 12 Individual Cell Voltages */}
          <div className="ems-section-title">
            <h3>
              <Layers size={18} color="#10B981" />
              Individual Cell Voltages (12-Cell Pack)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Green: Active (&gt;0.5V) &bull; Gray: Unconnected / Shunted (0V)
            </span>
          </div>

          <div className="ems-cells-grid">
            {cells.map(cell => {
              const isActive = cell.isActive;
              const isMax = isActive && cell.id === maxCell.id && (telemetry?.activeCellCount ?? 0) > 1;
              const isMin = isActive && cell.id === minCell.id && (telemetry?.activeCellCount ?? 0) > 1;
              
              // 4.2V is typical Li-ion 100% capacity
              const percentage = Math.min(100, Math.max(0, (cell.voltage / 4.2) * 100));

              let cardClass = 'ems-cell-card';
              if (isActive) cardClass += ' ems-cell-card-active';
              else cardClass += ' ems-cell-card-empty';
              if (isMax) cardClass += ' ems-cell-card-max';
              if (isMin) cardClass += ' ems-cell-card-min';

              return (
                <div key={cell.id} className={cardClass}>
                  <div className="ems-cell-header">
                    <span className="ems-cell-label">Cell {String(cell.id).padStart(2, '0')}</span>
                    {isMax && <span className="ems-cell-pill ems-pill-max">MAX</span>}
                    {isMin && <span className="ems-cell-pill ems-pill-min">MIN</span>}
                    {!isMax && !isMin && isActive && <span className="ems-cell-pill ems-pill-active">ACTIVE</span>}
                    {!isActive && <span className="ems-cell-pill ems-pill-empty">0V</span>}
                  </div>

                  <div className="ems-cell-voltage">
                    {cell.voltage.toFixed(4)} <span style={{ fontSize: '0.82rem', color: '#64748B' }}>V</span>
                  </div>

                  <div className="ems-cell-bar-bg">
                    <div
                      className="ems-cell-bar-fill"
                      style={{
                        width: `${isActive ? percentage : 0}%`,
                        background: isMax ? '#0284C7' : isMin ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* System & Hardware Diagnostics */}
          <div className="ems-section-title">
            <h3>
              <Cpu size={18} color="#0284C7" />
              LTC6811 Diagnostics &amp; Supplies
            </h3>
          </div>

          <div className="ems-diag-grid">
            <div className="ems-diag-card">
              <div className="ems-diag-label">Analog Supply (VREG)</div>
              <div className="ems-diag-val" style={{ color: (telemetry?.analogSupply ?? 0) > 4.5 ? '#059669' : '#1E293B' }}>
                {(telemetry?.analogSupply ?? 0).toFixed(4)} V
              </div>
            </div>

            <div className="ems-diag-card">
              <div className="ems-diag-label">Digital Supply (VD)</div>
              <div className="ems-diag-val" style={{ color: (telemetry?.digitalSupply ?? 0) > 2.8 ? '#059669' : '#1E293B' }}>
                {(telemetry?.digitalSupply ?? 0).toFixed(4)} V
              </div>
            </div>

            <div className="ems-diag-card">
              <div className="ems-diag-label">REF2 Reference Voltage</div>
              <div className="ems-diag-val" style={{ color: (telemetry?.ref2Voltage ?? 0) > 2.5 ? '#059669' : '#1E293B' }}>
                {(telemetry?.ref2Voltage ?? 0).toFixed(4)} V
              </div>
            </div>

            <div className="ems-diag-card">
              <div className="ems-diag-label">GPIO1 / Auxiliary Sensor</div>
              <div className="ems-diag-val">
                {(telemetry?.gpio1Voltage ?? 0).toFixed(4)} V
              </div>
            </div>

            <div className="ems-diag-card">
              <div className="ems-diag-label">Status Register</div>
              <div className="ems-diag-val" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} />
                {telemetry?.statusFlags || 'NORMAL'}
              </div>
            </div>
          </div>

          {/* Live Mini Chart */}
          {realtimeChartData && (
            <div className="ems-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: '#1E293B', fontSize: '1rem', fontWeight: 700 }}>
                  Recent Stack Voltage Trend (Last 30 Readings)
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>5s live stream</span>
              </div>
              <div className="ems-chart-container">
                <Line
                  data={realtimeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0,0,0,0.04)' }
                      },
                      x: {
                        grid: { display: false }
                      }
                    },
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* HISTORY & TRENDS TAB CONTENT */}
      {subTab === 'history' && (
        <div className="animate-fade-in">
          {/* Controls Bar */}
          <div className="ems-card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              {/* Presets */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['15m', '1h', '3h', '6h', '24h', 'custom'].map(p => (
                  <button
                    key={p}
                    onClick={() => setTimePreset(p)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: timePreset === p ? '#0284C7' : '#ffffff',
                      color: timePreset === p ? '#ffffff' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {timePreset === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="datetime-local"
                    value={startDateInput}
                    onChange={e => setStartDateInput(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                  <span style={{ color: '#94A3B8' }}>to</span>
                  <input
                    type="datetime-local"
                    value={endDateInput}
                    onChange={e => setEndDateInput(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                  <button
                    onClick={loadHistory}
                    className="ems-btn ems-btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    Apply Range
                  </button>
                </div>
              )}

              {/* CSV Export */}
              <button
                onClick={handleExportCsv}
                className="ems-btn ems-btn-secondary"
                disabled={historyRecords.length === 0}
              >
                <Download size={14} />
                <span>Export CSV ({historyRecords.length} rows)</span>
              </button>
            </div>
          </div>

          {/* Historical Trend Chart */}
          {historyChartData && (
            <div className="ems-card-panel">
              <h4 style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '1.05rem', fontWeight: 700 }}>
                Historical Voltage Telemetry ({timePreset.toUpperCase()})
              </h4>
              <div className="ems-chart-container">
                <Line
                  data={historyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        title: { display: true, text: 'Stack Voltage (V)' }
                      },
                      x: {
                        grid: { display: false }
                      }
                    },
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="ems-card-panel">
            <h4 style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '1.05rem', fontWeight: 700 }}>
              Telemetry Data Log ({historyRecords.length} records)
            </h4>
            <div className="ems-table-wrapper">
              <table className="ems-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Device</th>
                    <th>Stack Voltage</th>
                    <th>Sum of Cells</th>
                    <th>Delta V</th>
                    <th>Die Temp</th>
                    <th>Cell 01</th>
                    <th>Cell 02</th>
                    <th>Cell 03</th>
                    <th>Cell 04</th>
                    <th>Cell 05</th>
                    <th>Cell 06</th>
                    <th>Cell 07</th>
                    <th>Cell 08</th>
                    <th>Cell 09</th>
                    <th>Cell 10</th>
                    <th>Cell 11</th>
                    <th>Cell 12</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.slice().reverse().map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#64748B' }}>{new Date(r.timestamp).toLocaleString()}</td>
                      <td><strong>{r.deviceId}</strong></td>
                      <td style={{ color: '#059669', fontWeight: 600 }}>{r.stackVoltage.toFixed(4)} V</td>
                      <td>{r.sumOfCells.toFixed(4)} V</td>
                      <td>{(r.deltaV * 1000).toFixed(1)} mV</td>
                      <td>{r.internalTemp !== null ? `${r.internalTemp.toFixed(1)}°C` : '--'}</td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const cell = r.cells?.[i];
                        const v = cell?.voltage ?? 0;
                        return (
                          <td key={i} style={{ color: v > 0.1 ? '#059669' : '#94A3B8' }}>
                            {v.toFixed(4)} V
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
