import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Sparkles, MapPin, Clock, Calendar, Activity, Info, Database, 
  ChevronRight, FileUp, X, BarChart3, Table2, Image as ImageIcon,
  FlaskConical, Droplets, Settings2, Eye, Download, Zap, User, Trash2, AlertCircle, ShieldAlert, ArrowLeft, ArrowRight
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import ElectrodeDetails from './ElectrodeDetails';
import DataStreamSelector, { SITE_STREAM_CATALOG } from './DataStreamSelector';
import DynamicSampleTable from './DynamicSampleTable';
import ConfirmModal from './ConfirmModal';
import InvalidParametersModal from './InvalidParametersModal';
import { generateReport, uploadDocument, previewData, fetchReportHistory, fetchStreamMetadata } from '../services/api';
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

const TABS = [
  { key: 'basic', label: 'Basic Run Details', icon: Settings2, color: '#3b82f6' },
  { key: 'electrode', label: 'Electrode Details', icon: Zap, color: '#f59e0b' },
  { key: 'streams', label: 'Datastream Selection', icon: Database, color: '#8b5cf6' },
  { key: 'samples', label: 'GC & Water Samples', icon: FlaskConical, color: '#06b6d4' },
  { key: 'reference', label: 'Reference Doc', icon: ImageIcon, color: '#10b981' },
  { key: 'rawdata', label: 'Raw Data', icon: Table2, color: '#ec4899' },
  { key: 'generate', label: 'Report Generation', icon: BarChart3, color: '#f43f5e' },
];

const FREQUENCY_OPTIONS = [
  { value: 0, label: 'All Rows (No Sampling)' },
  { value: 1, label: 'Every 1 Minute' },
  { value: 5, label: 'Every 5 Minutes' },
  { value: 15, label: 'Every 15 Minutes' },
  { value: 30, label: 'Every 30 Minutes' },
  { value: 60, label: 'Every 1 Hour' },
];

export default function OperatorForm({ report, user, onReportGenerated, onCancel }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [deleteDocConfirm, setDeleteDocConfirm] = useState(false);

  // Core Refs & IDs declared FIRST
  const draftIdRef = useRef(report?.reportId || null);
  const isFirstRender = useRef(true);
  const isPopulatingRef = useRef(false);
  const docInputRef = useRef(null);
  const tabsNavRef = useRef(null);

  const currentTabIdx = Math.max(0, TABS.findIndex(t => t.key === activeTab));
  const currentStep = currentTabIdx + 1;
  const totalSteps = TABS.length;
  const prevTab = currentTabIdx > 0 ? TABS[currentTabIdx - 1] : null;
  const nextTab = currentTabIdx < totalSteps - 1 ? TABS[currentTabIdx + 1] : null;

  const goToTab = (tabKey) => {
    setActiveTab(tabKey);
    setTimeout(() => {
      if (tabsNavRef.current) {
        const activeEl = tabsNavRef.current.querySelector('.active');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 50);
  };

  const [currentDraftId, setCurrentDraftId] = useState(report?.reportId || null);
  const [autosaveStatus, setAutosaveStatus] = useState('');

  const currentUserEmail = (user?.email || '').toLowerCase();
  const isDevAdmin = DEV_EMAILS.includes(currentUserEmail);
  const isOwner = !report?.createdBy || (report.createdBy.toLowerCase() === currentUserEmail);
  const canEdit = isOwner || isDevAdmin;

  const p = report?.parameters || {};

  // Helper to extract param with fallback to root level
  const getP = (key, fallback = '') => {
    if (p[key] !== undefined && p[key] !== null) return p[key];
    if (report && report[key] !== undefined && report[key] !== null) return report[key];
    return fallback;
  };

  // Existing reports cache for live duplicate validation
  const [existingReports, setExistingReports] = useState([]);
  const [nameTaken, setNameTaken] = useState(false);

  useEffect(() => {
    if (typeof fetchReportHistory === 'function') {
      fetchReportHistory().then(res => {
        if (res && res.reports) setExistingReports(res.reports);
        else if (Array.isArray(res)) setExistingReports(res);
      }).catch(err => console.warn('Could not fetch reports for duplicate check:', err));
    }
  }, []);

  
  // 1. Basic Run Details
  const [autoRunId, setAutoRunId] = useState(getP('runId', report?.runId || ''));
  const [autoDateTime, setAutoDateTime] = useState(getP('dateTime', ''));
  const [site, setSite] = useState(getP('site', 'UCS'));
  const [streamMetadata, setStreamMetadata] = useState({});

  useEffect(() => {
    if (site) {
      fetchStreamMetadata(site).then(meta => {
        if (meta && Object.keys(meta).length > 0) {
          setStreamMetadata(meta);
        }
      }).catch(err => console.warn('Could not load stream metadata:', err));
    }
  }, [site]);
  const [runName, setRunName] = useState(getP('runName', ''));
  const [runOwner, setRunOwner] = useState(getP('runOwner', user?.displayName || user?.email?.split('@')[0] || ''));
  const [runDuration, setRunDuration] = useState(getP('runDuration', ''));
  const [effluent, setEffluent] = useState(getP('effluent', ''));
  const [effluentVolume, setEffluentVolume] = useState(getP('effluentVolume', ''));
  const [inoculation, setInoculation] = useState(getP('inoculation', ''));
  const [runDescription, setRunDescription] = useState(getP('runDescription', ''));
  const [initialRunParams, setInitialRunParams] = useState(getP('initialRunParams', {
    startDate: '', startTime: '', endDate: '', endTime: '',
    breakStartDate: '', breakStartTime: '', breakEndDate: '', breakEndTime: ''
  }));

  // 2. Electrode Details
  const [electrodeDetails, setElectrodeDetails] = useState(getP('electrodeDetails', {}));

  // 3. Datastream Selection
  const [selectedStreams, setSelectedStreams] = useState(getP('selectedStreams', { PT: [], EPU: [], Production: [] }));

  // 4. GC & Water Samples
  const [gcEntries, setGcEntries] = useState(() => {
    const entries = getP('gcEntries', []);
    return entries && entries.length ? entries : [
      { id: 'gc-init', label: 'T1', sampleTime: '', h2Pct: '', co2Pct: '', sampleName: '' }
    ];
  });
  const [waterEntries, setWaterEntries] = useState(() => {
    const entries = getP('waterEntries', []);
    return entries && entries.length ? entries : [
      { id: 'water-init', label: 'T1', sampleTime: '', ph: '', tds: '', ec: '', sampleName: '' }
    ];
  });

  // 5. Reference Doc & Images
  const [referenceImage, setReferenceImage] = useState(getP('referenceImages', getP('referenceImage', null)));
  const [uploadedDoc, setUploadedDoc] = useState(getP('uploadedDoc', null));
  const [docUploading, setDocUploading] = useState(false);
  const [docNote, setDocNote] = useState(getP('docNote', uploadedDoc?.note || uploadedDoc?.description || ''));
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // 6. Raw Data
  const [dataFrequency, setDataFrequency] = useState(getP('dataFrequency', 0));
  const [rawData, setRawData] = useState(report?.editedData || report?.bigqueryData || []);
  const [fetchingData, setFetchingData] = useState(false);

  // 7. Report Generation & Summary Parameters
  const [inference, setInference] = useState(getP('inference', ''));
  const [additionalNotes, setAdditionalNotes] = useState(getP('additionalNotes', ''));
  const [totalMixedGasProduction, setTotalMixedGasProduction] = useState(getP('totalMixedGasProduction', ''));
  const [totalH2Production, setTotalH2Production] = useState(getP('totalH2Production', ''));
  const [includeRawData, setIncludeRawData] = useState(getP('includeRawData', true));
  const [graphConfigs, setGraphConfigs] = useState(() => {
    const cfgs = getP('graphConfigs', []);
    if (cfgs && cfgs.length) {
      return cfgs.map(g => ({ ...g, yAxes: g.yAxes || (g.yAxis ? [g.yAxis] : []) }));
    }
    return [{ id: 'graph-1', title: 'Graph 1', xAxis: 'timestamp', yAxes: [], yAxis: '' }];
  });
  const [previewGraphs, setPreviewGraphs] = useState(false);

  // Duplicate checker function (declared AFTER runName and all states are declared)
  const checkIsNameDuplicate = (nameToCheck) => {
    if (!nameToCheck || !nameToCheck.trim()) return false;
    const clean = nameToCheck.trim().toLowerCase();
    const currentId = draftIdRef.current || report?.reportId || currentDraftId;
    const list = Array.isArray(existingReports) ? existingReports : [];
    return list.some(r => {
      const rName = (r.parameters?.runName || r.runName || '').trim().toLowerCase();
      const rId = r.reportId || r.id;
      return Boolean(rName && rName === clean && rId && rId !== currentId);
    });
  };

  // Derived live duplicate flag
  const isNameTaken = checkIsNameDuplicate(runName);

  // Synchronize state when report prop changes
  useEffect(() => {
    isPopulatingRef.current = true;
    if (report) {
      const p = report.parameters || {};
      const getVal = (key, fallback = '') => {
        if (p[key] !== undefined && p[key] !== null) return p[key];
        if (report[key] !== undefined && report[key] !== null) return report[key];
        return fallback;
      };

      draftIdRef.current = report.reportId;
      setCurrentDraftId(report.reportId);
      setAutoRunId(getVal('runId', report.runId || ''));
      setAutoDateTime(getVal('dateTime', new Date().toLocaleString()));
      setSite(getVal('site', 'UCS'));
      setRunName(getVal('runName', ''));
      setRunOwner(getVal('runOwner', user?.displayName || ''));
      setRunDuration(getVal('runDuration', ''));
      setEffluent(getVal('effluent', ''));
      setEffluentVolume(getVal('effluentVolume', ''));
      setInoculation(getVal('inoculation', ''));
      setRunDescription(getVal('runDescription', ''));
      
      const initParams = getVal('initialRunParams', null);
      if (initParams) setInitialRunParams(initParams);

      const elec = getVal('electrodeDetails', null);
      if (elec) setElectrodeDetails(elec);

      const streams = getVal('selectedStreams', null);
      if (streams) setSelectedStreams(streams);

      const gc = getVal('gcEntries', null);
      if (gc && gc.length) setGcEntries(gc);

      const water = getVal('waterEntries', null);
      if (water && water.length) setWaterEntries(water);

      const refImg = getVal('referenceImages', getVal('referenceImage', null));
      if (refImg) setReferenceImage(refImg);

      const doc = getVal('uploadedDoc', null);
      if (doc) {
        setUploadedDoc(doc);
        setDocNote(doc.note || doc.description || getVal('docNote', ''));
      }

      setDataFrequency(getVal('dataFrequency', 0));
      setIncludeRawData(getVal('includeRawData', true));
      setInference(getVal('inference', ''));
      setAdditionalNotes(getVal('additionalNotes', ''));
      setTotalMixedGasProduction(getVal('totalMixedGasProduction', ''));
      setTotalH2Production(getVal('totalH2Production', ''));

      const graphs = getVal('graphConfigs', null);
      if (graphs && graphs.length) {
        setGraphConfigs(graphs.map(g => ({ ...g, yAxes: g.yAxes || (g.yAxis ? [g.yAxis] : []) })));
      }

      if (report.bigqueryData || report.editedData) {
        setRawData(report.editedData || report.bigqueryData || []);
      }
    } else {
      draftIdRef.current = null;
      setCurrentDraftId(null);
      const todayStr = new Date().toISOString().slice(0, 10);
      const dateStr = todayStr.replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      setAutoRunId(`RUN-${dateStr}-${rand}`);
      setAutoDateTime(new Date().toLocaleString());
      setInitialRunParams({
        startDate: todayStr, startTime: '',
        endDate: todayStr, endTime: '',
        breakStartDate: todayStr, breakStartTime: '',
        breakEndDate: todayStr, breakEndTime: ''
      });
    }

    const timer = setTimeout(() => {
      isPopulatingRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, [report]);

  // Autosave Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isPopulatingRef.current || !canEdit || nameTaken) {
      return;
    }

    const activeReportId = draftIdRef.current || report?.reportId || currentDraftId;

    setAutosaveStatus('Saving draft...');
    const timer = setTimeout(async () => {
      try {
        const payload = {
          reportId: activeReportId,
          runId: autoRunId,
          dateTime: autoDateTime,
          site,
          runName,
          runOwner,
          runDuration,
          effluent,
          effluentVolume,
          inoculation,
          runDescription,
          initialRunParams,
          electrodeDetails,
          selectedStreams,
          gcEntries,
          waterEntries,
          referenceImage,
          uploadedDoc,
          dataFrequency,
          includeRawData,
          inference,
          additionalNotes,
          totalMixedGasProduction,
          totalH2Production,
          graphConfigs,
          draftOnly: true,
          createdBy: report?.createdBy || user?.email || 'parth@ossusbio.com',
          user: user?.displayName || user?.email || 'Operator'
        };

        const res = await generateReport(payload);
        if (res.report?.reportId) {
          draftIdRef.current = res.report.reportId;
          setCurrentDraftId(res.report.reportId);
        }
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setAutosaveStatus(`Saved draft at ${timeNow}`);
      } catch (err) {
        console.warn('Autosave warning:', err);
        setAutosaveStatus('Autosave paused');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    site, runName, runOwner, runDuration, effluent, effluentVolume, inoculation, runDescription,
    initialRunParams, electrodeDetails, selectedStreams, gcEntries, waterEntries,
    referenceImage, uploadedDoc, dataFrequency, includeRawData, inference, additionalNotes, totalMixedGasProduction, totalH2Production, graphConfigs
  ]);

  // Combined selectable column list for Graph Y-Axes (BigQuery datastreams + user-entered sample values)
  const bqColumns = [
    ...(selectedStreams.PT || []),
    ...(selectedStreams.EPU || []),
    ...(selectedStreams.Production || [])
  ].filter(Boolean);

  const sampleColumns = [
    'H2 (%) [Sample]',
    'CO2 (%) [Sample]',
    'pH [Sample]',
    'TDS (ppm) [Sample]',
    'EC (mS/cm) [Sample]'
  ];

  const allSelectedColumns = [...bqColumns, ...sampleColumns];

  // Document Upload
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    setDocUploading(true);
    try {
      const result = await uploadDocument(file, autoRunId);
      setUploadedDoc({
        name: file.name,
        url: result.documentUrl,
        documentUrl: result.documentUrl,
        filepath: result.filepath,
        size: file.size
      });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setDocUploading(false);
    }
  };

  // Raw Data Fetch
  const handleFetchRawData = async () => {
    setFetchingData(true);
    setError('');
    try {
      const payload = {
        site,
        initialRunParams,
        selectedStreams,
        dataFrequency
      };
      const res = await previewData(payload);
      setRawData(res.rows || []);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setFetchingData(false);
    }
  };

  // Graph Config Helpers
  const addGraph = () => {
    setGraphConfigs([
      ...graphConfigs,
      { id: `graph-${Date.now()}`, title: `Graph ${graphConfigs.length + 1}`, xAxis: 'timestamp', yAxes: [], yAxis: '' }
    ]);
  };

  const removeGraph = (index) => {
    if (graphConfigs.length <= 1) return;
    setGraphConfigs(graphConfigs.filter((_, i) => i !== index));
  };

  const updateGraph = (index, field, value) => {
    const updated = [...graphConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setGraphConfigs(updated);
  };

  // Comprehensive Parameter Validator
  const validateReportParameters = () => {
    const errors = [];

    // 1. Run Name
    if (!runName || !runName.trim()) {
      errors.push({
        field: 'runName',
        stepLabel: 'Step 1: Basic Run Details',
        tabKey: 'basic',
        message: 'Run Name is required. Please provide a distinct run name.'
      });
    } else if (isNameTaken) {
      errors.push({
        field: 'runName',
        stepLabel: 'Step 1: Basic Run Details',
        tabKey: 'basic',
        message: `Run Name "${runName.trim()}" is already taken by another report. Please choose a unique name.`
      });
    }

    // 2. Run Timings
    const { startDate, startTime, endDate, endTime, breakStartTime, breakEndTime } = initialRunParams;
    
    if (!startTime || !startTime.trim()) {
      errors.push({
        field: 'startTime',
        stepLabel: 'Step 1: Basic Run Details',
        tabKey: 'basic',
        message: 'Run Start Time is required to fetch process telemetry.'
      });
    }

    if (!endTime || !endTime.trim()) {
      errors.push({
        field: 'endTime',
        stepLabel: 'Step 1: Basic Run Details',
        tabKey: 'basic',
        message: 'Run End Time is required to calculate duration and telemetry window.'
      });
    }

    if (startTime && endTime) {
      const sDate = startDate || '2026-01-01';
      const eDate = endDate || sDate;
      const startDateTime = new Date(`${sDate}T${startTime}:00`);
      const endDateTime = new Date(`${eDate}T${endTime}:00`);
      if (endDateTime <= startDateTime) {
        errors.push({
          field: 'endTime',
          stepLabel: 'Step 1: Basic Run Details',
          tabKey: 'basic',
          message: 'Run End Time must be later than Run Start Time.'
        });
      }
    }

    if ((breakStartTime && !breakEndTime) || (!breakStartTime && breakEndTime)) {
      errors.push({
        field: 'breakTime',
        stepLabel: 'Step 1: Basic Run Details',
        tabKey: 'basic',
        message: 'Both Break Start Time and Break End Time must be filled if a break is logged.'
      });
    }

    // 3. Datastream Selection
    const totalSelectedStreams = (selectedStreams.PT?.length || 0) + (selectedStreams.EPU?.length || 0) + (selectedStreams.Production?.length || 0);
    if (totalSelectedStreams === 0) {
      errors.push({
        field: 'selectedStreams',
        stepLabel: 'Step 3: Datastream Selection',
        tabKey: 'streams',
        message: 'At least 1 BigQuery Data Stream (PT, EPU, or Production) must be selected.'
      });
    }

    return errors;
  };

  // Submit Handler
  const handleSubmit = async (draftOnly = false) => {
    if (!canEdit) {
      alert('You do not have permission to edit or generate this report.');
      return;
    }

    // Full Report Generation Validation
    if (!draftOnly) {
      const errors = validateReportParameters();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationModal(true);
        return;
      }
    }

    setLoading(true);
    setError('');
    const activeReportId = draftIdRef.current || report?.reportId || currentDraftId;
    const payload = {
      reportId: activeReportId,
      runId: autoRunId, dateTime: autoDateTime, site, runName, runOwner, runDuration,
      effluent, effluentVolume, inoculation, runDescription, initialRunParams,
      electrodeDetails, selectedStreams,
      gcEntries, waterEntries, referenceImage, uploadedDoc: uploadedDoc ? { ...uploadedDoc, note: docNote, description: docNote } : null, docNote,
      dataFrequency, includeRawData, inference, additionalNotes, totalMixedGasProduction, totalH2Production,
      graphConfigs,
      draftOnly,
      createdBy: report?.createdBy || user?.email || 'parth@ossusbio.com',
      user: user?.displayName || user?.email || 'Operator'
    };

    try {
      const res = await generateReport(payload);
      onReportGenerated(res.report);
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  // Chart Data & Option Builders (powered by unified chart engine)
  const buildChartData = (config) => {
    return buildUnifiedChartData(config, rawData, gcEntries, waterEntries, streamMetadata);
  };

  const buildChartOptions = (config) => {
    return buildUnifiedChartOptions(config, streamMetadata);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Header Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-info">{autoRunId || 'NEW RUN'}</span>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{site}</span>
            {runName && <span style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: 600 }}>&bull; {runName}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {autosaveStatus && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontStyle: 'italic' }}>
                {autosaveStatus}
              </span>
            )}
            <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Cancel
            </button>
            {canEdit && (
              <button onClick={() => handleSubmit(true)} disabled={loading} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Save Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Non-Owner Read-Only Banner */}
      {!canEdit && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldAlert size={18} />
          <span>
            <strong>Read-Only Mode:</strong> This report was created by <strong>{report?.createdBy || 'another operator'}</strong>. Only the creator can edit parameters or generate the report.
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Step Progress & Wizard Guide Banner */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '18px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}>
              STEP {currentStep} OF {totalSteps}
            </span>
            <strong style={{ fontSize: '0.92rem', color: '#f3f4f6' }}>
              {TABS[currentTabIdx]?.label}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {Math.round((currentStep / totalSteps) * 100)}% Completed
            </span>
          </div>
        </div>

        {/* Dynamic Animated Progress Bar */}
        <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f43f5e 100%)',
            transition: 'width 0.35s ease-out',
            borderRadius: '9999px'
          }} />
        </div>
      </div>

      {/* Main Wizard Layout */}
      <div className="wizard-layout">
        
        {/* Sidebar Step Pills with Numbers and Auto-centering */}
        <div ref={tabsNavRef} className="wizard-sidebar">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isCompleted = idx < currentTabIdx;
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isActive ? 'rgba(59, 130, 246, 0.2)' : isCompleted ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                  color: isActive ? '#38bdf8' : isCompleted ? '#6ee7b7' : '#9ca3af',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isActive ? '#3b82f6' : isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {idx + 1}
                </span>
                <Icon size={15} color={isActive ? tab.color : isCompleted ? '#10b981' : '#9ca3af'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="wizard-content">
          <fieldset disabled={!canEdit} style={{ border: 'none', padding: 0, margin: 0, width: '100%' }} className={!canEdit ? 'view-only-fieldset' : ''}>

          {/* TAB 1: Basic Run Details */}
          {activeTab === 'basic' && (
            <div className="animate-fade-in">
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Settings2 size={18} color="#3b82f6" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Basic Run Configuration</h3>
                </div>

                <div className="responsive-grid-3" style={{ gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><MapPin size={14} /><span>Site Selection</span></label>
                    <select className="form-select" value={site} onChange={(e) => setSite(e.target.value)}>
                      <option value="UCS">UCS</option>
                      <option value="SMP_3RX_SKID">SMP_3RX_SKID</option>
                      <option value="SDR">SDR</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><Sparkles size={14} /><span>Run Name (Must be Unique)</span></label>
                    <input
                      type="text"
                      className={`form-input ${isNameTaken ? 'input-error' : ''}`}
                      placeholder="e.g. Batch-Alpha-04"
                      value={runName}
                      onChange={(e) => {
                        setRunName(e.target.value);
                        if (error && (error.includes('already exist') || error.includes('already taken'))) setError('');
                      }}
                      style={{
                        borderColor: isNameTaken ? '#ef4444' : undefined,
                        boxShadow: isNameTaken ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : undefined
                      }}
                    />
                    {isNameTaken && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.82rem', marginTop: '6px', fontWeight: 600 }}>
                        <AlertCircle size={14} color="#ef4444" />
                        <span>Name already exists</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><User size={14} /><span>Run Owner</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Parth Sharma"
                      value={runOwner}
                      onChange={(e) => setRunOwner(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><Clock size={14} /><span>Run Duration</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 4 hours / 24 hrs"
                      value={runDuration}
                      onChange={(e) => setRunDuration(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><Droplets size={14} /><span>Effluent Type</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dairy Wastewater"
                      value={effluent}
                      onChange={(e) => setEffluent(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><Droplets size={14} /><span>Effluent Volume (L)</span></label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 500"
                      value={effluentVolume}
                      onChange={(e) => setEffluentVolume(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><FlaskConical size={14} /><span>Inoculation</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Consortium B-12"
                      value={inoculation}
                      onChange={(e) => setInoculation(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label"><Info size={14} /><span>Run Description</span></label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Describe the run objective, process conditions, or multiline notes..."
                      value={runDescription}
                      onChange={(e) => setRunDescription(e.target.value)}
                      style={{ minHeight: '80px', lineHeight: 1.5 }}
                    />
                  </div>
                </div>

                {/* Timings & Break Window */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Activity size={18} color="#8b5cf6" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Run Timings & Break Window (BigQuery Range)</h4>
                  </div>

                  <div className="responsive-grid-2" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ color: '#10b981' }}>🟢 Run Start</label>
                      <div className="date-time-group">
                        <input type="date" className="form-input" style={{ flex: 1.3 }} value={initialRunParams.startDate} onChange={(e) => setInitialRunParams({ ...initialRunParams, startDate: e.target.value })} />
                        <input type="time" className="form-input" style={{ flex: 1 }} value={initialRunParams.startTime} onChange={(e) => setInitialRunParams({ ...initialRunParams, startTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ color: '#f43f5e' }}>🔴 Run End</label>
                      <div className="date-time-group">
                        <input type="date" className="form-input" style={{ flex: 1.3 }} value={initialRunParams.endDate} onChange={(e) => setInitialRunParams({ ...initialRunParams, endDate: e.target.value })} />
                        <input type="time" className="form-input" style={{ flex: 1 }} value={initialRunParams.endTime} onChange={(e) => setInitialRunParams({ ...initialRunParams, endTime: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Clock size={15} color="#f59e0b" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>Break Window (Excluded from fetch)</span>
                    </div>
                    <div className="responsive-grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ color: '#fbbf24' }}>Break Start</label>
                        <div className="date-time-group">
                          <input type="date" className="form-input" style={{ flex: 1.3 }} value={initialRunParams.breakStartDate} onChange={(e) => setInitialRunParams({ ...initialRunParams, breakStartDate: e.target.value })} />
                          <input type="time" className="form-input" style={{ flex: 1 }} value={initialRunParams.breakStartTime} onChange={(e) => setInitialRunParams({ ...initialRunParams, breakStartTime: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ color: '#fbbf24' }}>Break End</label>
                        <div className="date-time-group">
                          <input type="date" className="form-input" style={{ flex: 1.3 }} value={initialRunParams.breakEndDate} onChange={(e) => setInitialRunParams({ ...initialRunParams, breakEndDate: e.target.value })} />
                          <input type="time" className="form-input" style={{ flex: 1 }} value={initialRunParams.breakEndTime} onChange={(e) => setInitialRunParams({ ...initialRunParams, breakEndTime: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Electrode Details */}
          {activeTab === 'electrode' && (
            <ElectrodeDetails
              electrode={electrodeDetails}
              onChange={setElectrodeDetails}
              disabled={!canEdit}
            />
          )}

          {/* TAB 3: Datastream Selection */}
          {activeTab === 'streams' && (
            <div className="animate-fade-in">
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Database size={18} color="#8b5cf6" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Data Streams to Record from BigQuery</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
                  Select which PT, EPU, and Production data streams to include. Data will be fetched from BigQuery for the selected time window.
                </p>
                <DataStreamSelector site={site} selectedStreams={selectedStreams} onChange={setSelectedStreams} />
              </div>
            </div>
          )}

          {/* TAB 4: GC & Water Samples */}
          {activeTab === 'samples' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <DynamicSampleTable type="gc" entries={gcEntries} onChange={setGcEntries} disabled={!canEdit} />
              <DynamicSampleTable type="water" entries={waterEntries} onChange={setWaterEntries} disabled={!canEdit} />
            </div>
          )}

          {/* TAB 5: Reference Doc */}
          {activeTab === 'reference' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Reference Image */}
              <CameraCapture onImageCaptured={(imgObj) => setReferenceImage(imgObj)} currentImage={referenceImage} disabled={!canEdit} runId={autoRunId} />

              {/* Document Upload */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <FileUp size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Upload Reference Document</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
                  Upload a PDF, Excel or document file (max 5MB) to attach to this report.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {uploadedDoc ? (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '12px', padding: '14px 18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileUp size={20} color="#10b981" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{uploadedDoc.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {uploadedDoc.size ? `${(uploadedDoc.size / 1024).toFixed(1)} KB` : 'Uploaded File'}
                          </div>
                          {(uploadedDoc.url || uploadedDoc.documentUrl) && (
                            <a href={uploadedDoc.url || uploadedDoc.documentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'underline' }}>
                              Open Reference Document
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteDocConfirm(true)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', color: '#f43f5e' }}
                        title="Remove document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null}

                  {/* Document Note / Description Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#10b981' }}>
                      Document Description / Note
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lab Bench Log, QA Certificate, SOP Checklist..."
                      value={docNote}
                      onChange={(e) => setDocNote(e.target.value)}
                    />
                  </div>

                  {!uploadedDoc && (
                  <div>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                      onChange={handleDocUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={docUploading}
                      onClick={() => docInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ padding: '12px 24px', gap: '8px' }}
                    >
                      <FileUp size={18} />
                      <span>{docUploading ? 'Uploading to GCS...' : 'Select Document File'}</span>
                    </button>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Raw Data */}
          {activeTab === 'rawdata' && (
            <div className="animate-fade-in">
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Table2 size={18} color="#ec4899" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>BigQuery Process Telemetry Data</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select 
                      className="form-select" 
                      value={dataFrequency} 
                      onChange={(e) => setDataFrequency(parseInt(e.target.value))}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleFetchRawData}
                      disabled={fetchingData || bqColumns.length === 0}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                    >
                      <Database size={14} />
                      <span>{fetchingData ? 'Fetching...' : 'Fetch BigQuery Data'}</span>
                    </button>
                  </div>
                </div>

                {bqColumns.length === 0 && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '16px' }}>
                    ⚠️ Please select at least one datastream in Step 3 (Datastream Selection) first.
                  </div>
                )}

                {/* Data Table */}
                {rawData.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '10px' }}>
                      Showing <strong style={{ color: '#f3f4f6' }}>{rawData.length}</strong> rows
                    </div>
                    <div style={{ maxHeight: '500px', overflow: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(15, 23, 42, 0.8)', position: 'sticky', top: 0, zIndex: 1 }}>
                            {Object.keys(rawData[0]).map(col => (
                              <th key={col} style={{ padding: '10px 12px', textAlign: 'left', color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rawData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'rgba(17, 24, 39, 0.4)' : 'transparent' }}>
                              {Object.values(row).map((val, ci) => (
                                <td key={ci} style={{ padding: '8px 12px', color: '#d1d5db', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
                                  {val !== null && val !== undefined ? String(val) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Report Generation */}
          {activeTab === 'generate' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* User Inference & Summary Parameters */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Sparkles size={18} color="#f43f5e" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Report Summary & Observations</h3>
                </div>

                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total Mixed Gas Production (in Litres)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 1500.0"
                      value={totalMixedGasProduction}
                      onChange={(e) => setTotalMixedGasProduction(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total H₂ Production (in Litres)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 950.0"
                      value={totalH2Production}
                      onChange={(e) => setTotalH2Production(e.target.value)}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Inference from User</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Key observations and technical takeaways from this run..."
                      value={inference}
                      onChange={(e) => setInference(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Any operational comments, skid anomalies, maintenance notes..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Graph Configuration */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} color="#38bdf8" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Custom Graph Plotting</h3>
                  </div>
                  <button onClick={addGraph} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px' }}>
                    <span>+ Add Graph</span>
                  </button>
                </div>

                {/* Graph Config Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {graphConfigs.map((gc, idx) => (
                    <div key={gc.id} className="graph-config-row">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Graph Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={gc.title}
                          onChange={(e) => updateGraph(idx, 'title', e.target.value)}
                          placeholder="e.g. Temperature vs Time"
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>X-Axis</label>
                        <select
                          className="form-select"
                          value={gc.xAxis}
                          onChange={(e) => updateGraph(idx, 'xAxis', e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        >
                          <option value="timestamp">timestamp</option>
                          <option value="Date">Date (Daily Bar Chart)</option>
                          {allSelectedColumns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Y-Axis (Select Multiple, Max 3)</label>
                        <button
                          type="button"
                          className="form-select"
                          style={{
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#f3f4f6',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%'
                          }}
                          onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                        >
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {(gc.yAxes && gc.yAxes.length > 0)
                              ? gc.yAxes.join(', ')
                              : (gc.yAxis ? gc.yAxis : '-- Select Columns --')}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>▼</span>
                        </button>
                        
                        {openDropdownIdx === idx && (
                          <>
                            <div 
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                              onClick={() => setOpenDropdownIdx(null)}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#1f2937',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              marginTop: '4px',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              zIndex: 999,
                              padding: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}>
                              {allSelectedColumns.map(col => {
                                const currentAxes = gc.yAxes || (gc.yAxis ? [gc.yAxis] : []);
                                const isChecked = currentAxes.includes(col);
                                const isMax = currentAxes.length >= 3 && !isChecked;

                                return (
                                  <label
                                    key={col}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '6px 8px',
                                      cursor: isMax ? 'not-allowed' : 'pointer',
                                      opacity: isMax ? 0.4 : 1,
                                      borderRadius: '4px',
                                      fontSize: '0.8rem',
                                      color: isChecked ? '#38bdf8' : '#d1d5db'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={isMax}
                                      checked={isChecked}
                                      onChange={() => {
                                        let updatedAxes;
                                        if (isChecked) {
                                          updatedAxes = currentAxes.filter(a => a !== col);
                                        } else {
                                          if (currentAxes.length < 3) {
                                            updatedAxes = [...currentAxes, col];
                                          } else {
                                            return;
                                          }
                                        }
                                        const updated = [...graphConfigs];
                                        updated[idx] = {
                                          ...updated[idx],
                                          yAxes: updatedAxes,
                                          yAxis: updatedAxes[0] || ''
                                        };
                                        setGraphConfigs(updated);
                                      }}
                                    />
                                    <span>{(() => {
      const meta = getStreamMetadata(col, streamMetadata);
      const unit = meta.unit ? ` (${meta.unit})` : '';
      return `${col}${unit}`;
    })()}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {graphConfigs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGraph(idx)}
                          className="btn btn-secondary"
                          style={{ padding: '10px', color: '#f43f5e' }}
                          title="Remove Graph"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewGraphs(!previewGraphs)}
                    className="btn btn-secondary"
                    style={{ gap: '6px', fontSize: '0.85rem' }}
                  >
                    <Eye size={16} />
                    <span>{previewGraphs ? 'Hide Graph Preview' : 'Preview Graphs'}</span>
                  </button>
                </div>

                {/* Graph Live Preview */}
                {previewGraphs && (
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {graphConfigs.map((gc) => {
                      const data = buildChartData(gc);
                      if (!data) return null;
                      const options = buildChartOptions(gc);
                      return (
                        <div key={gc.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', height: '320px' }}>
                          {gc.xAxis === 'Date' ? (
                            <Bar data={data} options={options} />
                          ) : (
                            <Line data={data} options={options} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit & Generate Final Report */}
              {canEdit ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="btn btn-secondary"
                    style={{ padding: '14px 28px', fontSize: '1rem' }}
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: '14px 36px',
                      fontSize: '1.05rem',
                      boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      gap: '10px'
                    }}
                  >
                    <Sparkles size={20} />
                    <span>{loading ? 'Generating Report...' : 'Generate Final Report'}</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <div style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="#f59e0b" />
                    <span>Report Generation is disabled in View-Only mode</span>
                  </div>
                </div>
              )}

            </div>
          )}

          </fieldset>
        </div>
      </div>

      {/* Invalid Parameters Validation Modal */}
      <InvalidParametersModal
        open={showValidationModal}
        errors={validationErrors}
        onClose={() => setShowValidationModal(false)}
        onNavigateTab={(tabKey) => {
          setShowValidationModal(false);
          goToTab(tabKey);
        }}
      />

      {/* Document Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteDocConfirm}
        title="Remove Attached Document"
        message="Are you sure you want to remove the uploaded reference document? This will remove the attachment from this report."
        confirmLabel="Remove Document"
        danger={true}
        onConfirm={() => {
          setUploadedDoc(null);
          setDeleteDocConfirm(false);
        }}
        onCancel={() => setDeleteDocConfirm(false)}
      />

    </div>
  );
}
