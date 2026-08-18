/**
 * Chart Helpers - Unified Chart Configuration & Time Alignment Engine
 * ossusbio Report Generator
 */

export const DEFAULT_STREAM_UNITS = {
  // Pressure Transmitters (PT) & Analog Inputs
  'AI_1_0': { unit: 'bar', label: 'Pressure AI 1-0', category: 'PT' },
  'AI_1_1': { unit: 'bar', label: 'Pressure AI 1-1', category: 'PT' },
  'AI_1_2': { unit: 'bar', label: 'Pressure AI 1-2', category: 'PT' },
  'AI_1_3': { unit: 'bar', label: 'Pressure AI 1-3', category: 'PT' },
  'AI_1_4': { unit: 'bar', label: 'Pressure AI 1-4', category: 'PT' },
  'AI_1_5': { unit: 'bar', label: 'Pressure AI 1-5', category: 'PT' },
  'AI_1_6': { unit: 'bar', label: 'Pressure AI 1-6', category: 'PT' },
  'AI_1_7': { unit: 'bar', label: 'Pressure AI 1-7', category: 'PT' },
  'AI_2_0': { unit: 'bar', label: 'Pressure AI 2-0', category: 'PT' },
  'AI_2_1': { unit: 'bar', label: 'Pressure AI 2-1', category: 'PT' },
  'AI_2_2': { unit: 'bar', label: 'Pressure AI 2-2', category: 'PT' },
  'AI_2_3': { unit: 'bar', label: 'Pressure AI 2-3', category: 'PT' },
  'AI_2_4': { unit: 'bar', label: 'Pressure AI 2-4', category: 'PT' },
  'AI_2_5': { unit: 'bar', label: 'Pressure AI 2-5', category: 'PT' },
  'AI_2_6': { unit: 'bar', label: 'Pressure AI 2-6', category: 'PT' },
  'AI_2_7': { unit: 'bar', label: 'Pressure AI 2-7', category: 'PT' },
  'AI_3_0': { unit: 'bar', label: 'Pressure AI 3-0', category: 'PT' },
  'AI_3_1': { unit: 'bar', label: 'Pressure AI 3-1', category: 'PT' },
  'AI_3_2': { unit: 'bar', label: 'Pressure AI 3-2', category: 'PT' },
  'AI_3_3': { unit: 'bar', label: 'Pressure AI 3-3', category: 'PT' },
  'AI_3_4': { unit: 'bar', label: 'Pressure AI 3-4', category: 'PT' },
  'AI_3_5': { unit: 'bar', label: 'Pressure AI 3-5', category: 'PT' },
  'AI_3_6': { unit: 'bar', label: 'Pressure AI 3-6', category: 'PT' },
  'AI_3_7': { unit: 'bar', label: 'Pressure AI 3-7', category: 'PT' },
  'PT01': { unit: 'bar', label: 'Pressure PT01', category: 'PT' },
  'PT02': { unit: 'bar', label: 'Pressure PT02', category: 'PT' },
  'PT03': { unit: 'bar', label: 'Pressure PT03', category: 'PT' },
  'PT04': { unit: 'bar', label: 'Pressure PT04', category: 'PT' },
  'PT05': { unit: 'bar', label: 'Pressure PT05', category: 'PT' },
  'PT06': { unit: 'bar', label: 'Pressure PT06', category: 'PT' },
  'PT07': { unit: 'bar', label: 'Pressure PT07', category: 'PT' },
  'PT08': { unit: 'bar', label: 'Pressure PT08', category: 'PT' },
  'TEMP_1': { unit: '°C', label: 'Temperature 1', category: 'PT' },
  'TEMP_2': { unit: '°C', label: 'Temperature 2', category: 'PT' },
  'TEMP_3': { unit: '°C', label: 'Temperature 3', category: 'PT' },
  'TEMP_4': { unit: '°C', label: 'Temperature 4', category: 'PT' },

  // Electrical Power Unit (EPU)
  'VOUT_1': { unit: 'V', label: 'Output Voltage 1', category: 'EPU' },
  'VOUT_2': { unit: 'V', label: 'Output Voltage 2', category: 'EPU' },
  'VOUT_3': { unit: 'V', label: 'Output Voltage 3', category: 'EPU' },
  'VOUT_4': { unit: 'V', label: 'Output Voltage 4', category: 'EPU' },
  'VOUT_5': { unit: 'V', label: 'Output Voltage 5', category: 'EPU' },
  'VOUT_6': { unit: 'V', label: 'Output Voltage 6', category: 'EPU' },
  'VOUT_7': { unit: 'V', label: 'Output Voltage 7', category: 'EPU' },
  'VOUT_8': { unit: 'V', label: 'Output Voltage 8', category: 'EPU' },
  'VOUT_9': { unit: 'V', label: 'Output Voltage 9', category: 'EPU' },
  'IOUT_1': { unit: 'A', label: 'Output Current 1', category: 'EPU' },
  'IOUT_2': { unit: 'A', label: 'Output Current 2', category: 'EPU' },
  'IOUT_3': { unit: 'A', label: 'Output Current 3', category: 'EPU' },
  'IOUT_4': { unit: 'A', label: 'Output Current 4', category: 'EPU' },
  'IOUT_5': { unit: 'A', label: 'Output Current 5', category: 'EPU' },
  'IOUT_6': { unit: 'A', label: 'Output Current 6', category: 'EPU' },
  'IOUT_7': { unit: 'A', label: 'Output Current 7', category: 'EPU' },
  'IOUT_8': { unit: 'A', label: 'Output Current 8', category: 'EPU' },
  'IOUT_9': { unit: 'A', label: 'Output Current 9', category: 'EPU' },
  'ENERGY_01': { unit: 'kWh', label: 'Energy Consumption 1', category: 'EPU' },
  'ENERGY_02': { unit: 'kWh', label: 'Energy Consumption 2', category: 'EPU' },
  'ENERGY_03': { unit: 'kWh', label: 'Energy Consumption 3', category: 'EPU' },
  'ENERGY_04': { unit: 'kWh', label: 'Energy Consumption 4', category: 'EPU' },
  'ENERGY_05': { unit: 'kWh', label: 'Energy Consumption 5', category: 'EPU' },
  'ENERGY_06': { unit: 'kWh', label: 'Energy Consumption 6', category: 'EPU' },
  'ENERGY_07': { unit: 'kWh', label: 'Energy Consumption 7', category: 'EPU' },
  'ENERGY_08': { unit: 'kWh', label: 'Energy Consumption 8', category: 'EPU' },
  'ENERGY_09': { unit: 'kWh', label: 'Energy Consumption 9', category: 'EPU' },
  'ACTIVE_POWER': { unit: 'kW', label: 'Active Power', category: 'EPU' },
  'MAX_DEMAND_ACTIVE_POWER': { unit: 'kW', label: 'Max Demand Active Power', category: 'EPU' },
  'TOTAL_ACTIVE_ENERGY': { unit: 'kWh', label: 'Total Active Energy', category: 'EPU' },

  // Production Metrics
  'RX1_PRODUCTION_VOLUME': { unit: 'L', label: 'RX1 Production Volume', category: 'Production' },
  'RX2_PRODUCTION_VOLUME': { unit: 'L', label: 'RX2 Production Volume', category: 'Production' },
  'RX3_PRODUCTION_VOLUME': { unit: 'L', label: 'RX3 Production Volume', category: 'Production' },
  'RX5_PRODUCTION_VOLUME': { unit: 'L', label: 'RX5 Production Volume', category: 'Production' },
  'TOTAL_PRODUCTION_VOLUME': { unit: 'L', label: 'Total Production Volume', category: 'Production' },

  // User-Entered Sample Data Streams
  'H2 (%)': { unit: '%', label: 'H2 Gas Composition', type: 'gc', field: 'h2Pct' },
  'H2 (%) [Sample]': { unit: '%', label: 'H2 Gas Composition', type: 'gc', field: 'h2Pct' },
  'CO2 (%)': { unit: '%', label: 'CO2 Gas Composition', type: 'gc', field: 'co2Pct' },
  'CO2 (%) [Sample]': { unit: '%', label: 'CO2 Gas Composition', type: 'gc', field: 'co2Pct' },
  'CH4 (%)': { unit: '%', label: 'CH4 Gas Composition', type: 'gc', field: 'ch4Pct' },
  'CH4 (%) [Sample]': { unit: '%', label: 'CH4 Gas Composition', type: 'gc', field: 'ch4Pct' },
  'N2 (%)': { unit: '%', label: 'N2 Gas Composition', type: 'gc', field: 'n2Pct' },
  'N2 (%) [Sample]': { unit: '%', label: 'N2 Gas Composition', type: 'gc', field: 'n2Pct' },
  'O2 (%)': { unit: '%', label: 'O2 Gas Composition', type: 'gc', field: 'o2Pct' },
  'O2 (%) [Sample]': { unit: '%', label: 'O2 Gas Composition', type: 'gc', field: 'o2Pct' },
  'pH': { unit: '', label: 'pH Value', type: 'water', field: 'ph' },
  'pH [Sample]': { unit: '', label: 'pH Value', type: 'water', field: 'ph' },
  'TDS (ppm)': { unit: 'ppm', label: 'Total Dissolved Solids', type: 'water', field: 'tds' },
  'TDS (ppm) [Sample]': { unit: 'ppm', label: 'Total Dissolved Solids', type: 'water', field: 'tds' },
  'EC (mS/cm)': { unit: 'mS/cm', label: 'Electrical Conductivity', type: 'water', field: 'ec' },
  'EC (mS/cm) [Sample]': { unit: 'mS/cm', label: 'Electrical Conductivity', type: 'water', field: 'ec' },
  'COD (ppm)': { unit: 'ppm', label: 'Chemical Oxygen Demand', type: 'water', field: 'cod' },
  'COD (ppm) [Sample]': { unit: 'ppm', label: 'Chemical Oxygen Demand', type: 'water', field: 'cod' }
};

/**
 * Normalizes any time string (HH:MM, HH:MM:SS, HH:MM AM/PM, ISO datetime) to minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const clean = String(timeStr).trim();
  if (!clean) return null;

  let timePart = clean;
  if (clean.includes(' ') || clean.includes('T')) {
    const parts = clean.split(/[ T]/);
    if (parts.length >= 2 && /^(AM|PM)$/i.test(parts[parts.length - 1])) {
      timePart = parts[parts.length - 2] + ' ' + parts[parts.length - 1];
    } else {
      timePart = parts[1] || parts[0];
    }
  }

  // 12-hour AM/PM format
  const ampmMatch = timePart.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format
  const match24 = timePart.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Retrieves metadata (unit, description, label) for a given stream name
 */
export function getStreamMetadata(streamName, customMetadata = {}) {
  if (!streamName) return {};
  const cleanName = String(streamName).trim();
  
  // Dynamic BigQuery metadata lookup
  if (customMetadata && customMetadata[cleanName]) {
    const d = customMetadata[cleanName];
    return {
      unit: d.unit || '',
      label: d.displayName || d.name || cleanName,
      description: d.description || '',
      type: 'bq'
    };
  }

  // Static default mapping lookup
  if (DEFAULT_STREAM_UNITS[cleanName]) {
    return DEFAULT_STREAM_UNITS[cleanName];
  }

  // Fallback pattern match for custom sample columns
  const lower = cleanName.toLowerCase();
  if (lower.includes('h2')) return { unit: '%', label: 'H2 Gas Composition', type: 'gc', field: 'h2Pct' };
  if (lower.includes('co2')) return { unit: '%', label: 'CO2 Gas Composition', type: 'gc', field: 'co2Pct' };
  if (lower.includes('ch4')) return { unit: '%', label: 'CH4 Gas Composition', type: 'gc', field: 'ch4Pct' };
  if (lower.includes('n2')) return { unit: '%', label: 'N2 Gas Composition', type: 'gc', field: 'n2Pct' };
  if (lower.includes('o2')) return { unit: '%', label: 'O2 Gas Composition', type: 'gc', field: 'o2Pct' };
  if (lower.includes('ph')) return { unit: '', label: 'pH Value', type: 'water', field: 'ph' };
  if (lower.includes('tds')) return { unit: 'ppm', label: 'Total Dissolved Solids', type: 'water', field: 'tds' };
  if (lower.includes('ec')) return { unit: 'mS/cm', label: 'Electrical Conductivity', type: 'water', field: 'ec' };
  if (lower.includes('cod')) return { unit: 'ppm', label: 'Chemical Oxygen Demand', type: 'water', field: 'cod' };

  return { unit: '', label: cleanName, type: 'bq' };
}

/**
 * Builds Chart.js data object with unified time-series alignment, dynamic sample tracking, and units.
 */
export function buildUnifiedChartData(config, rawData = [], gcEntries = [], waterEntries = [], streamMetadata = {}) {
  if (!config) return null;
  const selectedYAxes = config.yAxes || (config.yAxis ? [config.yAxis] : []);
  if (!selectedYAxes.length) return null;

  const colors = [
    { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
    { border: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
    { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
    { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)' },
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' },
    { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)' }
  ];

  let labels = [];
  let datasets = [];

  const isDailyBar = config.xAxis === 'Date';

  // Check if ALL selected axes are sample columns (e.g. H2, CO2, pH)
  const isAllSampleStreams = selectedYAxes.every(yCol => {
    const meta = getStreamMetadata(yCol, streamMetadata);
    return meta.type === 'gc' || meta.type === 'water';
  });

  if (isDailyBar && rawData.length > 0) {
    // 1. DAILY BAR CHART
    const groups = {};
    rawData.forEach(r => {
      const ts = r.timestamp || '';
      const dateStr = typeof ts === 'string' ? ts.split(/[ T]/)[0] : '';
      if (dateStr) {
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(r);
      }
    });

    labels = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));

    datasets = selectedYAxes.map((yCol, idx) => {
      const meta = getStreamMetadata(yCol, streamMetadata);
      const colorSet = colors[idx % colors.length];
      const isSample = meta.type === 'gc' || meta.type === 'water';

      let values = [];
      if (isSample) {
        const sourceEntries = meta.type === 'gc' ? gcEntries : waterEntries;
        const validValues = (sourceEntries || [])
          .map(e => parseFloat(e[meta.field]))
          .filter(v => !isNaN(v));
        const avg = validValues.length > 0
          ? parseFloat((validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2))
          : 0;
        values = labels.map(() => avg);
      } else {
        values = labels.map(date => {
          const groupRows = groups[date] || [];
          const sum = groupRows.reduce((acc, r) => acc + (parseFloat(r[yCol]) || 0), 0);
          return groupRows.length > 0 ? parseFloat((sum / groupRows.length).toFixed(2)) : 0;
        });
      }

      const unitSuffix = meta.unit ? ` (${meta.unit})` : '';
      return {
        type: 'bar',
        label: `${meta.label || yCol}${unitSuffix}`,
        data: values,
        backgroundColor: colorSet.border,
        borderColor: colorSet.border,
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: `y_${idx}`
      };
    });
  } else if (isAllSampleStreams || !rawData || rawData.length === 0) {
    // 2. DIRECT SAMPLE MODE (Displays all logged samples T1, T2, T3... including latest recent entries)
    const hasGC = selectedYAxes.some(y => getStreamMetadata(y, streamMetadata).type === 'gc');
    const sourceEntries = (hasGC && gcEntries && gcEntries.length > 0) ? gcEntries : (waterEntries && waterEntries.length > 0 ? waterEntries : gcEntries || []);
    
    const activeEntries = [...(sourceEntries || [])];

    labels = activeEntries.map((e, i) => {
      const timeLabel = e.sampleTime ? ` (${e.sampleTime})` : '';
      return `${e.label || `T${i + 1}`}${timeLabel}`;
    });

    datasets = selectedYAxes.map((yCol, idx) => {
      const meta = getStreamMetadata(yCol, streamMetadata);
      const colorSet = colors[idx % colors.length];
      const entriesForType = meta.type === 'gc' ? (gcEntries || []) : (waterEntries || []);
      
      const values = activeEntries.map((_, eIdx) => {
        const item = entriesForType[eIdx];
        if (!item) return null;
        const val = parseFloat(item[meta.field]);
        return isNaN(val) ? null : val;
      });

      const unitSuffix = meta.unit ? ` (${meta.unit})` : '';
      const pointRadii = values.map((v, pIdx) => (pIdx === values.length - 1 ? 8 : 5)); // Highlight latest recent point

      return {
        type: 'line',
        label: `${meta.label || yCol}${unitSuffix}`,
        data: values,
        borderColor: colorSet.border,
        backgroundColor: colorSet.bg,
        borderWidth: 2.5,
        pointRadius: pointRadii,
        pointHoverRadius: 10,
        pointBackgroundColor: colorSet.border,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.2,
        spanGaps: true,
        yAxisID: `y_${idx}`
      };
    });
  } else {
    // 3. COMBINED MODE: BIGQUERY TELEMETRY + SAMPLE OVERLAYS
    labels = rawData.map(r => {
      const val = r[config.xAxis] || r.timestamp;
      if (val) {
        const str = String(val);
        if (str.length >= 19 && str.includes('T')) return str.substring(11, 16);
        if (str.includes(' ')) {
          const timeP = str.split(' ')[1];
          return timeP ? timeP.substring(0, 5) : str.substring(0, 5);
        }
        if (str.length >= 5 && str.includes(':')) return str.substring(0, 5);
        return str;
      }
      return '';
    });

    const rowMinutes = rawData.map(r => parseTimeToMinutes(r.timestamp || r[config.xAxis]));

    datasets = selectedYAxes.map((yCol, idx) => {
      const meta = getStreamMetadata(yCol, streamMetadata);
      const colorSet = colors[idx % colors.length];
      const isSample = meta.type === 'gc' || meta.type === 'water';
      const unitSuffix = meta.unit ? ` (${meta.unit})` : '';

      if (isSample) {
        const sourceEntries = meta.type === 'gc' ? (gcEntries || []) : (waterEntries || []);
        const dataPoints = new Array(rawData.length).fill(null);
        const pointRadii = new Array(rawData.length).fill(0);

        sourceEntries.forEach((entry, eIdx) => {
          const val = parseFloat(entry[meta.field]);
          if (isNaN(val)) return;

          const sampleMin = parseTimeToMinutes(entry.sampleTime);
          let targetIdx = null;

          if (sampleMin !== null && rowMinutes.length > 0) {
            let minDiff = Infinity;
            rowMinutes.forEach((rm, rIdx) => {
              if (rm !== null) {
                const diff = Math.abs(rm - sampleMin);
                if (diff < minDiff) {
                  minDiff = diff;
                  targetIdx = rIdx;
                }
              }
            });
          }

          // Fallback: If no sampleTime or couldn't match, space out along timeline or pin latest
          if (targetIdx === null) {
            const count = sourceEntries.length;
            targetIdx = count > 1 ? Math.round((eIdx / (count - 1)) * (rawData.length - 1)) : rawData.length - 1;
          }

          dataPoints[targetIdx] = val;
          // Highlight latest recent sample with larger radius
          const isLatest = eIdx === sourceEntries.length - 1;
          pointRadii[targetIdx] = isLatest ? 8 : 6;
        });

        return {
          type: 'line',
          label: `${meta.label || yCol}${unitSuffix}`,
          data: dataPoints,
          borderColor: colorSet.border,
          backgroundColor: colorSet.bg,
          borderWidth: 2.5,
          pointRadius: pointRadii,
          pointHoverRadius: 10,
          pointBackgroundColor: colorSet.border,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          spanGaps: true,
          tension: 0.15,
          yAxisID: `y_${idx}`
        };
      } else {
        const dataPoints = rawData.map(r => {
          const val = parseFloat(r[yCol]);
          return isNaN(val) ? null : val;
        });

        return {
          type: 'line',
          label: `${meta.label || yCol}${unitSuffix}`,
          data: dataPoints,
          borderColor: colorSet.border,
          backgroundColor: colorSet.bg,
          borderWidth: 2,
          pointRadius: 1.5,
          tension: 0.2,
          spanGaps: true,
          yAxisID: `y_${idx}`
        };
      }
    });
  }

  return { labels, datasets };
}

/**
 * Builds Chart.js multi-axis configuration options with unit labels on scales
 */
export function buildUnifiedChartOptions(config, streamMetadata = {}) {
  const selectedYAxes = config.yAxes || (config.yAxis ? [config.yAxis] : []);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const scales = {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#9ca3af', font: { size: 10, family: 'Outfit, sans-serif' } }
    }
  };

  selectedYAxes.forEach((yCol, idx) => {
    const meta = getStreamMetadata(yCol, streamMetadata);
    const color = colors[idx % colors.length];
    const isRight = idx > 0;
    const unitSuffix = meta.unit ? ` (${meta.unit})` : '';
    const displayTitle = `${meta.label || yCol}${unitSuffix}`;

    scales[`y_${idx}`] = {
      type: 'linear',
      display: true,
      position: isRight ? 'right' : 'left',
      title: {
        display: true,
        text: displayTitle,
        color: color,
        font: { size: 11, weight: 'bold', family: 'Outfit, sans-serif' }
      },
      ticks: { color: color, font: { size: 10 } },
      grid: {
        drawOnChartArea: idx === 0,
        color: 'rgba(255, 255, 255, 0.05)'
      }
    };
  });

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e5e7eb', font: { size: 12, weight: 600, family: 'Outfit, sans-serif' } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) return null;
            return ` ${label}: ${val}`;
          }
        }
      }
    },
    scales
  };
}
