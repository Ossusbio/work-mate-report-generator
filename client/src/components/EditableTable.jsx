import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, FileText, Search, MapPin, Clock, FlaskConical, 
  Droplets, Database, Calendar, Info, Activity, ShieldAlert, Play,
  Edit, ArrowLeft, Eye, ImageIcon, CheckCircle, File, Sparkles, Zap, User, ExternalLink
} from 'lucide-react';
import { exportReport, fetchLiveTelemetry, fetchStreamMetadata } from '../services/api';
import { buildUnifiedChartData, buildUnifiedChartOptions, getStreamMetadata } from '../utils/chartHelpers';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const DEV_EMAILS = ['parth@ossusbio.com'];

function formatTimeAMPM(timeStr) {
  if (!timeStr) return '-';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const match = String(timeStr).match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${minutes} ${ampm}`;
  }
  return timeStr;
}

function formatToIST(isoDate) {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  } catch (e) {
    return isoDate;
  }
}

export default function EditableTable({ report, user, onEditReport, onUpdateSuccess }) {
  const [rows, setRows] = useState(report?.editedData || report?.bigqueryData || []);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [streamMetadata, setStreamMetadata] = useState({});

  const reportSite = report?.parameters?.site || report?.site || 'UCS';

  useEffect(() => {
    if (reportSite) {
      fetchStreamMetadata(reportSite).then(meta => {
        if (meta && Object.keys(meta).length > 0) {
          setStreamMetadata(meta);
        }
      }).catch(err => console.warn('Could not load stream metadata:', err));
    }
  }, [reportSite]);

  const currentUserEmail = (user?.email || '').toLowerCase();
  const isDevAdmin = DEV_EMAILS.includes(currentUserEmail);
  const isOwner = !report?.createdBy || (report.createdBy.toLowerCase() === currentUserEmail);
  const canEdit = isOwner || isDevAdmin;

  const reportRunName = (report?.parameters?.runName || report?.runName || report?.reportId || '').trim();

  useEffect(() => {
    if (report) {
      setRows(report.editedData || report.bigqueryData || []);
    }
  }, [report]);

  useEffect(() => {
    if (reportRunName) {
      document.title = reportRunName;
    }
    return () => {
      document.title = 'Operator Report Console';
    };
  }, [reportRunName]);

  if (!report) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#9ca3af' }}>No Active Report Selected</h3>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '8px' }}>
          Generate a new report or select one from Report History.
        </p>
      </div>
    );
  }

  const p = report.parameters || {};
  const runName = p.runName || '';
  const runOwner = p.runOwner || '';
  const runDuration = p.runDuration || '';
  const effluent = p.effluent || '';
  const effluentVolume = p.effluentVolume || '';
  const inoculation = p.inoculation || '';
  const runDescription = p.runDescription || '';
  const site = p.site || 'UCS';
  const autoRunId = report.runId || p.runId || '';
  const autoDateTime = p.dateTime || '';
  const electrode = p.electrodeDetails || {};
  const inference = p.inference || '';
  const additionalNotes = p.additionalNotes || '';
  const totalMixedGasProduction = p.totalMixedGasProduction || '';
  const totalH2Production = p.totalH2Production || '';
  
  const initialRunParams = p.initialRunParams || {
    startDate: '', startTime: '', endDate: '', endTime: '',
    breakStartDate: '', breakStartTime: '', breakEndDate: '', breakEndTime: ''
  };

  const selectedStreams = p.selectedStreams || { PT: [], EPU: [], Production: [] };
  const gcEntries = p.gcEntries || [];
  const waterEntries = p.waterEntries || [];
  const graphConfigs = p.graphConfigs || [];
  const includeRawData = p.includeRawData !== false;
  
  const isDraft = report?.status === 'DRAFT';


  const handleFetchTelemetry = async () => {
    setFetching(true);
    try {
      const res = await fetchLiveTelemetry(report.reportId);
      if (res.success && res.report) {
        if (onUpdateSuccess) onUpdateSuccess(res.report);
      }
    } catch (err) {
      alert('Failed to fetch telemetry data: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await exportReport(report.reportId, format, runName);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const filteredRows = rows.filter(r => {
    if (!search) return true;
    return Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
  });

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // Chart data builder (unified chart engine)
  const buildChartData = (config) => {
    return buildUnifiedChartData(config, rows, gcEntries, waterEntries, streamMetadata);
  };

  const buildChartOptions = (config) => {
    return buildUnifiedChartOptions(config, streamMetadata);
  };

  const imagesList = Array.isArray(p.referenceImages) ? p.referenceImages : (p.referenceImage ? (Array.isArray(p.referenceImage) ? p.referenceImage : [p.referenceImage]) : []);

  const hasElectrodeData = electrode && Object.values(electrode).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header & Actions */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={`badge ${isDraft ? 'badge-draft' : 'badge-success'}`}>
                {isDraft ? 'Draft Report' : 'Completed Run Report'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>
                {report.reportId}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {runName || report.runId}
            </h2>
            
            {/* Audit log trail */}
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
              Created by <strong style={{ color: '#38bdf8' }}>{report.createdBy || 'parth@ossusbio.com'}</strong> &bull; Last updated on {formatToIST(report.lastEditedAt || report.updatedAt || report.createdAt)}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {canEdit && (
              <button 
                onClick={onEditReport} 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                  gap: '8px'
                }}
              >
                <Edit size={16} />
                <span>Edit Report</span>
              </button>
            )}

            {rows.length === 0 && canEdit && (
              <button onClick={handleFetchTelemetry} disabled={fetching} className="btn btn-secondary" style={{ gap: '8px' }}>
                <Play size={16} /> <span>{fetching ? 'Fetching...' : 'Fetch Live Telemetry'}</span>
              </button>
            )}

            <button 
              onClick={() => {
                document.title = runName;
                window.print();
              }} 
              className="btn btn-primary" 
              style={{ 
                padding: '10px 20px', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                gap: '8px'
              }}
            >
              <FileText size={16} /> <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Parameters Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Info size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
            Operational Run Parameters
          </h3>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Run Name</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{runName || '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Run Owner</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8' }}>{runOwner || report.createdBy || '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Site Selection</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>{site}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Run Duration</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{runDuration || '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Effluent Type</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{effluent || '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Effluent Volume</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{effluentVolume ? `${effluentVolume} L` : '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Inoculation</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{inoculation || '-'}</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Run ID</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb', fontFamily: 'JetBrains Mono' }}>{autoRunId}</span>
          </div>
        </div>

        {runDescription && (
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Run Description</span>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{runDescription}</p>
          </div>
        )}

        {/* Timings Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Run start/end */}
          <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#10b981" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Run Duration Timings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Start Time</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 500 }}>
                  {initialRunParams.startDate} {formatTimeAMPM(initialRunParams.startTime)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>End Time</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 500 }}>
                  {initialRunParams.endDate} {formatTimeAMPM(initialRunParams.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Break exclusion window */}
          <div style={{ background: 'rgba(245, 158, 11, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>Break Exclusion Window</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Break Start</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 500 }}>
                  {initialRunParams.breakStartDate && initialRunParams.breakStartTime 
                    ? `${initialRunParams.breakStartDate} ${formatTimeAMPM(initialRunParams.breakStartTime)}` 
                    : 'None Configured'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Break End</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 500 }}>
                  {initialRunParams.breakEndDate && initialRunParams.breakEndTime 
                    ? `${initialRunParams.breakEndDate} ${formatTimeAMPM(initialRunParams.breakEndTime)}` 
                    : 'None Configured'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Electrode Details Panel */}
      {hasElectrodeData && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Zap size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
              Electrode & Cell Specifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {electrode.electrodeType && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Type of Electrode</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.electrodeType}</span>
              </div>
            )}
            {electrode.electricalConnection && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Connection</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.electricalConnection}</span>
              </div>
            )}
            {electrode.numElectrodes && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>No. of Electrodes</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.numElectrodes}</span>
              </div>
            )}
            {electrode.coatingType && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Coating</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.coatingType}</span>
              </div>
            )}
            {electrode.currentDensityM2 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>A/m²</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.currentDensityM2}</span>
              </div>
            )}
            {electrode.currentDensityM3 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>A/m³</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.currentDensityM3}</span>
              </div>
            )}
            {electrode.anodeArea && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Anode m²</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.anodeArea}</span>
              </div>
            )}
            {electrode.cathodeArea && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Cathode m²</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.cathodeArea}</span>
              </div>
            )}
            {electrode.areaPerVolume && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>m²/m³</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.areaPerVolume}</span>
              </div>
            )}
            {electrode.kwhr && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>KWhr</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.kwhr}</span>
              </div>
            )}
            {electrode.faradaicEfficiency && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>FE%</span>
                <span style={{ fontSize: '0.88rem', color: '#e5e7eb', fontWeight: 600 }}>{electrode.faradaicEfficiency}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary & Observations Panel */}
      {(totalMixedGasProduction || totalH2Production || inference || additionalNotes) && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Sparkles size={18} color="#f43f5e" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
              Run Summary & Technical Observations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {totalMixedGasProduction && (
                <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Total Mixed Gas Production</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f3e8ff' }}>{totalMixedGasProduction} Litres</span>
                </div>
              )}
              {totalH2Production && (
                <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Total H₂ Production</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e0f2fe' }}>{totalH2Production} Litres</span>
                </div>
              )}
            </div>

            {inference && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Inference from Operator</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{inference}</p>
              </div>
            )}

            {additionalNotes && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Additional Operational Notes</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Datastreams & Reference Docs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Datastreams card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Database size={16} color="#8b5cf6" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Selected Data Columns</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>PT Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.PT && selectedStreams.PT.length > 0 ? selectedStreams.PT.map(s => (
                  <span key={s} className="badge badge-info" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>None Selected</span>}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>EPU Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.EPU && selectedStreams.EPU.length > 0 ? selectedStreams.EPU.map(s => (
                  <span key={s} className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>None Selected</span>}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Production Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.Production && selectedStreams.Production.length > 0 ? selectedStreams.Production.map(s => (
                  <span key={s} className="badge badge-draft" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>None Selected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Reference visual & doc card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <ImageIcon size={16} color="#06b6d4" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Reference Visuals & Attachments</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Snapshots */}
            <div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Run Snapshots ({imagesList.length}/3)
              </span>
              {imagesList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, gap: '12px' }}>
                  {imagesList.map((img, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ width: '100%', height: '90px', borderRadius: '6px', overflow: 'hidden', background: '#000', marginBottom: '6px' }}>
                        <img src={img.url} alt={`Snapshot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <a href={img.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span>Open Image #{idx + 1}</span>
                        <ExternalLink size={10} />
                      </a>
                      {img.description && (
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic' }}>
                          "{img.description}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
                  No Visuals Attached
                </div>
              )}
            </div>

            {/* Document attachment */}
            <div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Attached PDF/Document</span>
              {(p.uploadedDoc || report.uploadedDoc) ? (() => {
                const docObj = p.uploadedDoc || report.uploadedDoc;
                // Always use our backend streaming proxy URL to avoid raw GCS NoSuchKey XML errors
                const linkUrl = `https://grafana-494005.web.app/api/reports/${report.reportId}/document`;
                const filename = docObj.name || docObj.filename || 'Attached Document';

                return (
                  <div>
                    {/* Web UI View */}
                    <div className="no-print" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <File size={16} color="#3b82f6" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: 600 }}>
                            {filename}
                          </span>
                          {(docObj?.note || docObj?.description || p?.docNote) && (
                            <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>
                              Note: {docObj?.note || docObj?.description || p?.docNote}
                            </span>
                          )}
                        </div>
                      </div>
                      <a 
                        href={linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '0.78rem', gap: '6px', textDecoration: 'none', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                      >
                        <span>Open Document</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* PDF / Print View: Short, clean link in PDF download */}
                    <div className="print-only" style={{ display: 'none', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '10px 14px', margin: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#0369a1', fontSize: '9.5pt' }}>📎 Attached Document:</strong>
                          <div>
                            <span style={{ color: '#0f172a', fontSize: '9.5pt', fontWeight: 600 }}>{filename}</span>
                            {(docObj?.note || docObj?.description || p?.docNote) && (
                              <span style={{ color: '#64748b', fontSize: '8.5pt', marginLeft: '6px', fontStyle: 'italic' }}>
                                ({docObj?.note || docObj?.description || p?.docNote})
                              </span>
                            )}
                          </div>
                        </div>
                        <a 
                          href={linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#0284c7', textDecoration: 'underline', fontSize: '9.5pt', fontWeight: 'bold' }}
                        >
                          📄 Open Document
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
                  No Document Attached
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* GC & Water Sample Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* GC Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <FlaskConical size={16} color="#06b6d4" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>GC Gas Samples</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#06b6d4' }}>Run</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#06b6d4' }}>Time</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#06b6d4' }}>H₂ (%)</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#06b6d4' }}>CO₂ (%)</th>
                </tr>
              </thead>
              <tbody>
                {gcEntries.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#38bdf8' }}>{e.label}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{formatTimeAMPM(e.sampleTime)}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{e.h2Pct || '-'}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{e.co2Pct || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Water Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Droplets size={16} color="#10b981" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Water Quality Samples</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#10b981' }}>Run</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#10b981' }}>Time</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#10b981' }}>pH</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#10b981' }}>TDS (ppm)</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#10b981' }}>EC (mS/cm)</th>
                </tr>
              </thead>
              <tbody>
                {waterEntries.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#34d399' }}>{e.label}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{formatTimeAMPM(e.sampleTime)}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{e.ph || '-'}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{e.tds || '-'}</td>
                    <td style={{ padding: '8px', color: '#d1d5db' }}>{e.ec || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Generated Charts */}
      {graphConfigs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
          {graphConfigs.map((gc) => {
            const data = buildChartData(gc);
            if (!data) return null;
            const options = buildChartOptions(gc);
            return (
              <div key={gc.id} className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', color: '#f3f4f6' }}>
                  {gc.title}
                </h4>
                <div style={{ height: '340px' }}>
                  {gc.xAxis === 'Date' ? (
                    <Bar data={data} options={options} />
                  ) : (
                    <Line data={data} options={options} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

            {/* Raw Run Telemetry Data Section */}
      {rows.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Web View Table & Actions */}
          <div className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="#ec4899" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                  Raw Telemetry Data ({filteredRows.length} data points)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={`/api/reports/${report.reportId}/export?format=csv`} 
                  download={`${report.runId || 'report'}_raw_data.csv`}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px', textDecoration: 'none', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                >
                  <FileText size={14} color="#38bdf8" />
                  <span>Download Raw CSV</span>
                </a>
                <a 
                  href={`/api/reports/${report.reportId}/export?format=excel`} 
                  download={`${report.runId || 'report'}.xlsx`}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px', textDecoration: 'none', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <FileSpreadsheet size={14} color="#10b981" />
                  <span>Export Excel</span>
                </a>
              </div>
            </div>

            <div style={{ maxHeight: '450px', overflow: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.8)', position: 'sticky', top: 0, zIndex: 1 }}>
                    {columns.map(col => (
                      <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'rgba(17,24,39,0.3)' : 'transparent' }}>
                      {columns.map((col, ci) => (
                        <td key={ci} style={{ padding: '6px 12px', color: '#d1d5db', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono' }}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF / Print View: Clean concise CSV link */}
          <div className="print-only" style={{ display: 'none', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', margin: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#0f172a', fontSize: '10pt' }}>📊 Raw Run Telemetry Data</strong>
                <span style={{ color: '#64748b', fontSize: '9pt' }}>({rows.length} total logged data points)</span>
              </div>
              <a 
                href={`https://grafana-494005.web.app/api/reports/${report.reportId}/export?format=csv`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#0284c7', textDecoration: 'underline', fontSize: '9.5pt', fontWeight: 'bold' }}
              >
                📥 Download Raw CSV
              </a>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
