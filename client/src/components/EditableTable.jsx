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
              <span style={{ fontSize: '0.85rem', color: '#6E5A4B', fontFamily: 'JetBrains Mono' }}>
                {report.reportId}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2E2219' }}>
              {runName || report.runId}
            </h2>
            
            {/* Audit log trail */}
            <p style={{ fontSize: '0.8rem', color: '#6E5A4B', marginTop: '6px' }}>
              Created by <strong style={{ color: '#7C5A3E' }}>{report.createdBy || 'parth@ossusbio.com'}</strong> &bull; Last updated on {formatToIST(report.lastEditedAt || report.updatedAt || report.createdAt)}
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
                  background: 'linear-gradient(135deg, #7C5A3E 0%, #A37A55 100%)',
                  border: 'none',
                  color: '#ffffff',
                  gap: '8px',
                  fontWeight: 600
                }}
              >
                <Edit size={16} color="#ffffff" />
                <span>Edit Report</span>
              </button>
            )}

            {rows.length === 0 && canEdit && (
              <button onClick={handleFetchTelemetry} disabled={fetching} className="btn btn-secondary" style={{ gap: '8px', color: '#7C5A3E', borderColor: 'var(--color-warm-border)' }}>
                <Play size={16} color="#7C5A3E" /> <span>{fetching ? 'Fetching...' : 'Fetch Live Telemetry'}</span>
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
                background: 'linear-gradient(135deg, #5E7A60 0%, #466048 100%)',
                border: 'none',
                color: '#ffffff',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <FileText size={16} color="#ffffff" /> <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Parameters Panel */}
      <div className="glass-panel print-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-warm-border)' }}>
          <Info size={18} color="#7C5A3E" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
            Operational Run Parameters
          </h3>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Run Name</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219' }}>{runName || '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Run Owner</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7C5A3E' }}>{runOwner || report.createdBy || '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Site Selection</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#5E7A60' }}>{site}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Run Duration</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219' }}>{runDuration || '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Effluent Type</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219' }}>{effluent || '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Effluent Volume</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219' }}>{effluentVolume ? `${effluentVolume} L` : '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Inoculation</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219' }}>{inoculation || '-'}</span>
          </div>

          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Run ID</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E2219', fontFamily: 'JetBrains Mono' }}>{autoRunId}</span>
          </div>
        </div>

        {runDescription && (
          <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-warm-border)', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Run Description</span>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#2E2219', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{runDescription}</p>
          </div>
        )}

        {/* Timings Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Run start/end */}
          <div style={{ background: 'rgba(94, 122, 96, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(94, 122, 96, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#5E7A60" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5E7A60' }}>Run Duration Timings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Start Time</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>
                  {initialRunParams.startDate} {formatTimeAMPM(initialRunParams.startTime)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>End Time</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>
                  {initialRunParams.endDate} {formatTimeAMPM(initialRunParams.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Break exclusion window */}
          <div style={{ background: 'rgba(196, 146, 79, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(196, 146, 79, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#C4924F" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C4924F' }}>Break Exclusion Window</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Break Start</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>
                  {initialRunParams.breakStartDate && initialRunParams.breakStartTime 
                    ? `${initialRunParams.breakStartDate} ${formatTimeAMPM(initialRunParams.breakStartTime)}` 
                    : 'None Configured'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Break End</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>
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
        <div className="glass-panel print-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <Zap size={18} color="#7C5A3E" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
              Electrode & Cell Specifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {electrode.electrodeType && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Type of Electrode</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.electrodeType}</span>
              </div>
            )}
            {electrode.electricalConnection && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Connection</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.electricalConnection}</span>
              </div>
            )}
            {electrode.numElectrodes && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>No. of Electrodes</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.numElectrodes}</span>
              </div>
            )}
            {electrode.coatingType && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Coating</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.coatingType}</span>
              </div>
            )}
            {electrode.currentDensityM2 && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>A/m²</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.currentDensityM2}</span>
              </div>
            )}
            {electrode.currentDensityM3 && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>A/m³</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.currentDensityM3}</span>
              </div>
            )}
            {electrode.anodeArea && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Anode m²</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.anodeArea}</span>
              </div>
            )}
            {electrode.cathodeArea && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>Cathode m²</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.cathodeArea}</span>
              </div>
            )}
            {electrode.areaPerVolume && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>m²/m³</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.areaPerVolume}</span>
              </div>
            )}
            {electrode.kwhr && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>KWhr</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.kwhr}</span>
              </div>
            )}
            {electrode.faradaicEfficiency && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: '#6E5A4B', display: 'block', fontWeight: 600 }}>FE%</span>
                <span style={{ fontSize: '0.88rem', color: '#2E2219', fontWeight: 700 }}>{electrode.faradaicEfficiency}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary & Observations Panel */}
      {(totalMixedGasProduction || totalH2Production || inference || additionalNotes) && (
        <div className="glass-panel print-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <Sparkles size={18} color="#7C5A3E" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
              Run Summary & Technical Observations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {totalMixedGasProduction && (
                <div style={{ background: 'rgba(196, 146, 79, 0.1)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(196, 146, 79, 0.35)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#C4924F', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Total Mixed Gas Production</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E2219' }}>{totalMixedGasProduction} Litres</span>
                </div>
              )}
              {totalH2Production && (
                <div style={{ background: 'rgba(94, 122, 96, 0.1)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(94, 122, 96, 0.35)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#5E7A60', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Total H₂ Production</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E2219' }}>{totalH2Production} Litres</span>
                </div>
              )}
            </div>

            {inference && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.75rem', color: '#7C5A3E', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Inference from Operator</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#2E2219', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{inference}</p>
              </div>
            )}

            {additionalNotes && (
              <div style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-warm-border)' }}>
                <span style={{ fontSize: '0.75rem', color: '#C4924F', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Additional Operational Notes</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#2E2219', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Datastreams & Reference Docs */}
      <div className="print-row-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Datastreams card */}
        <div className="glass-panel print-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <Database size={16} color="#7C5A3E" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>Selected Data Columns</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#7C5A3E', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>PT Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.PT && selectedStreams.PT.length > 0 ? selectedStreams.PT.map(s => (
                  <span key={s} className="badge" style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(124, 90, 62, 0.12)', color: '#7C5A3E', border: '1px solid rgba(124, 90, 62, 0.3)', fontWeight: 600 }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6E5A4B' }}>None Selected</span>}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#C4924F', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>EPU Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.EPU && selectedStreams.EPU.length > 0 ? selectedStreams.EPU.map(s => (
                  <span key={s} className="badge" style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(196, 146, 79, 0.12)', color: '#C4924F', border: '1px solid rgba(196, 146, 79, 0.3)', fontWeight: 600 }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6E5A4B' }}>None Selected</span>}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#5E7A60', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Production Columns</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedStreams.Production && selectedStreams.Production.length > 0 ? selectedStreams.Production.map(s => (
                  <span key={s} className="badge" style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(94, 122, 96, 0.12)', color: '#5E7A60', border: '1px solid rgba(94, 122, 96, 0.3)', fontWeight: 600 }}>{s}</span>
                )) : <span style={{ fontSize: '0.82rem', color: '#6E5A4B' }}>None Selected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Reference visual & doc card */}
        <div className="glass-panel print-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <ImageIcon size={16} color="#7C5A3E" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>Reference Visuals & Attachments</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Snapshots */}
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Run Snapshots ({imagesList.length}/3)
              </span>
              {imagesList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, gap: '12px' }}>
                  {imagesList.map((img, idx) => (
                    <div key={idx} style={{ background: '#FFFDF9', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-warm-border)' }}>
                      <div style={{ width: '100%', height: '90px', borderRadius: '6px', overflow: 'hidden', background: '#FAF6EE', marginBottom: '6px' }}>
                        <img src={img.url} alt={`Snapshot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <a href={img.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#7C5A3E', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                        <span>Open Image #{idx + 1}</span>
                        <ExternalLink size={10} />
                      </a>
                      {img.description && (
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#6E5A4B', fontStyle: 'italic' }}>
                          "{img.description}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '1px dashed var(--color-warm-border)', borderRadius: '8px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E5A4B', fontSize: '0.8rem' }}>
                  No Visuals Attached
                </div>
              )}
            </div>

            {/* Document attachment */}
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6E5A4B', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Attached PDF/Document</span>
              {(p.uploadedDoc || report.uploadedDoc) ? (() => {
                const docObj = p.uploadedDoc || report.uploadedDoc;
                // Always use our backend streaming proxy URL to avoid raw GCS NoSuchKey XML errors
                const linkUrl = `https://grafana-494005.web.app/api/reports/${report.reportId}/document`;
                const filename = docObj.name || docObj.filename || 'Attached Document';

                return (
                  <div>
                    {/* Web UI View */}
                    <div className="no-print" style={{ background: 'rgba(239, 232, 216, 0.45)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-warm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <File size={16} color="#7C5A3E" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: '#2E2219', fontWeight: 600 }}>
                            {filename}
                          </span>
                          {(docObj?.note || docObj?.description || p?.docNote) && (
                            <span style={{ fontSize: '0.78rem', color: '#6E5A4B', fontStyle: 'italic' }}>
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
                        style={{ padding: '6px 14px', fontSize: '0.78rem', gap: '6px', textDecoration: 'none', color: '#7C5A3E', borderColor: 'var(--color-warm-border)', fontWeight: 600 }}
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
                <div style={{ border: '1px dashed var(--color-warm-border)', borderRadius: '8px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E5A4B', fontSize: '0.8rem' }}>
                  No Document Attached
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* GC & Water Sample Tables */}
      <div className="print-row-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* GC Table */}
        <div className="glass-panel print-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <FlaskConical size={16} color="#7C5A3E" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>GC Gas Samples</h4>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-warm-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(124, 90, 62, 0.12)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7C5A3E', fontWeight: 700 }}>Run</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7C5A3E', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7C5A3E', fontWeight: 700 }}>H₂ (%)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7C5A3E', fontWeight: 700 }}>CO₂ (%)</th>
                </tr>
              </thead>
              <tbody>
                {gcEntries.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-warm-border)', background: idx % 2 === 0 ? 'rgba(239, 232, 216, 0.35)' : '#FFFDF9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#7C5A3E' }}>{e.label}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{formatTimeAMPM(e.sampleTime)}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{e.h2Pct || '-'}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{e.co2Pct || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Water Table */}
        <div className="glass-panel print-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--color-warm-border)' }}>
            <Droplets size={16} color="#5E7A60" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>Water Quality Samples</h4>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-warm-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(94, 122, 96, 0.12)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#5E7A60', fontWeight: 700 }}>Run</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#5E7A60', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#5E7A60', fontWeight: 700 }}>pH</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#5E7A60', fontWeight: 700 }}>TDS (ppm)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#5E7A60', fontWeight: 700 }}>EC (mS/cm)</th>
                </tr>
              </thead>
              <tbody>
                {waterEntries.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-warm-border)', background: idx % 2 === 0 ? 'rgba(239, 232, 216, 0.35)' : '#FFFDF9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#5E7A60' }}>{e.label}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{formatTimeAMPM(e.sampleTime)}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{e.ph || '-'}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{e.tds || '-'}</td>
                    <td style={{ padding: '8px 10px', color: '#2E2219', fontWeight: 500 }}>{e.ec || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Generated Charts */}
      {graphConfigs.length > 0 && (
        <div className="charts-print-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
          {graphConfigs.map((gc) => {
            const data = buildChartData(gc);
            if (!data) return null;
            const options = buildChartOptions(gc);
            return (
              <div key={gc.id} className="glass-panel print-chart-card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: '#2E2219' }}>
                  {gc.title}
                </h4>
                <div className="chart-canvas-box" style={{ height: '340px' }}>
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
                <Database size={18} color="#7C5A3E" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2E2219' }}>
                  Raw Telemetry Data ({filteredRows.length} data points)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={`/api/reports/${report.reportId}/export?format=csv`} 
                  download={`${report.runId || 'report'}_raw_data.csv`}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px', textDecoration: 'none', color: '#7C5A3E', borderColor: 'var(--color-warm-border)', fontWeight: 600 }}
                >
                  <FileText size={14} color="#7C5A3E" />
                  <span>Download Raw CSV</span>
                </a>
                <a 
                  href={`/api/reports/${report.reportId}/export?format=excel`} 
                  download={`${report.runId || 'report'}.xlsx`}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px', textDecoration: 'none', color: '#5E7A60', borderColor: 'var(--color-warm-border)', fontWeight: 600 }}
                >
                  <FileSpreadsheet size={14} color="#5E7A60" />
                  <span>Export Excel</span>
                </a>
              </div>
            </div>

            <div style={{ maxHeight: '450px', overflow: 'auto', borderRadius: '8px', border: '1px solid var(--color-warm-border)', background: '#FFFDF9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#EFE8D8', position: 'sticky', top: 0, zIndex: 1 }}>
                    {columns.map(col => (
                      <th key={col} style={{ padding: '10px 12px', textAlign: 'left', color: '#2E2219', fontWeight: 700, borderBottom: '1px solid var(--color-warm-border)', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-warm-border)', background: idx % 2 === 0 ? 'rgba(239, 232, 216, 0.35)' : '#FFFDF9' }}>
                      {columns.map((col, ci) => (
                        <td key={ci} style={{ padding: '8px 12px', color: '#2E2219', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
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
