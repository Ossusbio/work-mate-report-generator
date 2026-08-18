import React from 'react';
import { Activity, Zap, Factory, ChevronDown, Trash2, X } from 'lucide-react';

/**
 * Site-Specific BigQuery Column Schema Catalog
 *
 * Maps each Site (UCS, SMP_3RX_SKID, SDR) to its exact BigQuery column names.
 * Column names here must EXACTLY match the BigQuery table column names — do not change them.
 *
 * Sources:
 *   UCS       → bigquery_datapoint_UCS names.md   (121 columns)
 *   SMP_3RX   → smp_3rx_skid.md                   (312 columns)
 *   SDR       → SDR.md                             (123 columns)
 */
export const SITE_STREAM_CATALOG = {

  // ─────────────────────────────────────────────
  // UCS SITE
  // ─────────────────────────────────────────────
  'UCS': {
    tableName: 'UCS',
    displayName: 'UCS',

    // PT = Pressure & Temperature sensors
    PT: [
      { id: '', name: '-- Select PT Column --' },
      { id: 'TEMP_1', name: 'Temperature 1 (°C)' },
      { id: 'TEMP_2', name: 'Temperature 2 (°C)' },
      { id: 'TEMP_3', name: 'Temperature 3 (°C)' },
      { id: 'TEMP_4', name: 'Temperature 4 (°C)' },
      { id: 'TEMP_5', name: 'Temperature 5 (°C)' },
      { id: 'TEMP_6', name: 'Temperature 6 (°C)' },
      { id: 'TEMP_7', name: 'Temperature 7 (°C)' },
      { id: 'TEMP_8', name: 'Temperature 8 (°C)' },
      { id: 'TEMP_9', name: 'Temperature 9 (°C)' },
      { id: 'AI_1_0', name: 'Analog Input 1-0' },
      { id: 'AI_1_1', name: 'Analog Input 1-1' },
      { id: 'AI_1_2', name: 'Analog Input 1-2' },
      { id: 'AI_1_3', name: 'Analog Input 1-3' },
      { id: 'AI_1_4', name: 'Analog Input 1-4' },
      { id: 'AI_1_5', name: 'Analog Input 1-5' },
      { id: 'AI_2_0', name: 'Analog Input 2-0' },
      { id: 'AI_2_1', name: 'Analog Input 2-1' },
      { id: 'AI_3_0', name: 'Analog Input 3-0' },
      { id: 'AI_3_1', name: 'Analog Input 3-1' },
      { id: 'SENSOR_VOLTAGE', name: 'Sensor Voltage (V)' },
      { id: 'SENSOR_CURRENT', name: 'Sensor Current (A)' },
      { id: 'CURRENT_DENSITY', name: 'Current Density' },
    ],

    // EPU = Electrical Power Unit
    EPU: [
      { id: '', name: '-- Select EPU Column --' },
      { id: 'VOUT_1', name: 'Output Voltage 1 (V)' },
      { id: 'VOUT_2', name: 'Output Voltage 2 (V)' },
      { id: 'VOUT_3', name: 'Output Voltage 3 (V)' },
      { id: 'VOUT_4', name: 'Output Voltage 4 (V)' },
      { id: 'VOUT_5', name: 'Output Voltage 5 (V)' },
      { id: 'VOUT_6', name: 'Output Voltage 6 (V)' },
      { id: 'VOUT_7', name: 'Output Voltage 7 (V)' },
      { id: 'VOUT_8', name: 'Output Voltage 8 (V)' },
      { id: 'VOUT_9', name: 'Output Voltage 9 (V)' },
      { id: 'IOUT_1', name: 'Output Current 1 (A)' },
      { id: 'IOUT_2', name: 'Output Current 2 (A)' },
      { id: 'IOUT_3', name: 'Output Current 3 (A)' },
      { id: 'IOUT_4', name: 'Output Current 4 (A)' },
      { id: 'IOUT_5', name: 'Output Current 5 (A)' },
      { id: 'BTPS_1_VOLTAGE', name: 'BTPS 1 Voltage (V)' },
      { id: 'BTPS_1_CURRENT', name: 'BTPS 1 Current (A)' },
      { id: 'BTPS_1_ENERGY', name: 'BTPS 1 Energy' },
      { id: 'BTPS_2_VOLTAGE', name: 'BTPS 2 Voltage (V)' },
      { id: 'BTPS_2_CURRENT', name: 'BTPS 2 Current (A)' },
      { id: 'BTPS_2_ENERGY', name: 'BTPS 2 Energy' },
      { id: 'BTPS_3_VOLTAGE', name: 'BTPS 3 Voltage (V)' },
      { id: 'BTPS_3_CURRENT', name: 'BTPS 3 Current (A)' },
      { id: 'BTPS_3_ENERGY', name: 'BTPS 3 Energy' },
      { id: 'ACTIVE_POWER', name: 'Active Power (kW)' },
      { id: 'REACTIVE_POWER', name: 'Reactive Power (kVAR)' },
      { id: 'APPARENT_POWER', name: 'Apparent Power (kVA)' },
      { id: 'POWER_FACTOR', name: 'Power Factor' },
      { id: 'FREQUENCY', name: 'Frequency (Hz)' },
      { id: 'TOTAL_ACTIVE_ENERGY', name: 'Total Active Energy' },
      { id: 'IMPORT_ACTIVE_ENERGY', name: 'Import Active Energy' },
      { id: 'EXPORT_ACTIVE_ENERGY', name: 'Export Active Energy' },
      { id: 'TOTAL_REACTIVE_ENERGY', name: 'Total Reactive Energy' },
      { id: 'APPARENT_ENERGY', name: 'Apparent Energy' },
      { id: 'MAX_DEMAND_ACTIVE_POWER', name: 'Max Demand Active Power' },
      { id: 'MAX_DEMAND_REACTIVE_POWER', name: 'Max Demand Reactive Power' },
      { id: 'MAX_DEMAND_APPARENT_POWER', name: 'Max Demand Apparent Power' },
    ],

    Production: [
      { id: '', name: '-- Select Production Column --' },
      { id: 'RX1_PRODUCTION_VOLUME', name: 'RX1 Production Volume' },
      { id: 'RX2_PRODUCTION_VOLUME', name: 'RX2 Production Volume' },
      { id: 'RX3_PRODUCTION_VOLUME', name: 'RX3 Production Volume' },
      { id: 'RX5_PRODUCTION_VOLUME', name: 'RX5 Production Volume' },
      { id: 'TB5_PRODUCTION_VOLUME', name: 'TB5 Production Volume' },
      { id: 'TEN_C_STACK_PRODUCTION_VOLUME', name: '10C Stack Production Volume' },
      { id: 'RX1_SV_TRIGGER_COUNT', name: 'RX1 SV Trigger Count' },
      { id: 'RX2_SV_TRIGGER_COUNT', name: 'RX2 SV Trigger Count' },
      { id: 'RX3_SV_TRIGGER_COUNT', name: 'RX3 SV Trigger Count' },
      { id: 'RX5_SV_TRIGGER_COUNT', name: 'RX5 SV Trigger Count' },
      { id: 'TB5_SV_TRIGGER_COUNT', name: 'TB5 SV Trigger Count' },
      { id: 'TEN_C_STACK_TRIGGER_COUNT', name: '10C Stack Trigger Count' },
      { id: 'ENERGY_01', name: 'Energy Channel 01' },
      { id: 'ENERGY_02', name: 'Energy Channel 02' },
      { id: 'ENERGY_03', name: 'Energy Channel 03' },
      { id: 'ENERGY_04', name: 'Energy Channel 04' },
      { id: 'ENERGY_05', name: 'Energy Channel 05' },
      { id: 'START_TIME', name: 'Start Time' },
      { id: 'STOP_TIME', name: 'Stop Time' },
      { id: 'TOTAL_RUN_TIME', name: 'Total Run Time' },
    ]
  },

  // ─────────────────────────────────────────────
  // SMP 3RX SKID SITE
  // ─────────────────────────────────────────────
  'SMP_3RX_SKID': {
    tableName: 'SMP_3RX_SKID',
    displayName: 'SMP 3RX Skid Site (Table: SMP_3RX_SKID)',

    PT: [
      { id: '', name: '-- Select PT Column --' },
      // Pressure Transmitters
      { id: 'PT03', name: 'Pressure Transmitter PT03' },
      { id: 'PT04', name: 'Pressure Transmitter PT04' },
      { id: 'PT05', name: 'Pressure Transmitter PT05' },
      { id: 'PT06', name: 'Pressure Transmitter PT06' },
      { id: 'PT07', name: 'Pressure Transmitter PT07' },
      { id: 'PT08', name: 'Pressure Transmitter PT08' },
      { id: 'NINE_STACK_PT', name: '9-Stack Pressure' },
      { id: 'TWELVE_STACKPT', name: '12-Stack Pressure' },
      { id: 'PPT', name: 'Process Pressure (PPT)' },
      { id: 'MAX_INLET_PT', name: 'Max Inlet Pressure' },
      { id: 'MAX_OUTLET_PT', name: 'Max Outlet Pressure' },
      // Differential Pressure
      { id: 'DPT01', name: 'Differential Pressure DPT01' },
      { id: 'DPT02', name: 'Differential Pressure DPT02' },
      { id: 'DPT03', name: 'Differential Pressure DPT03' },
      // Proportional Output Valves
      { id: 'POV01', name: 'Proportional Valve POV01' },
      { id: 'POV02', name: 'Proportional Valve POV02' },
      { id: 'POV03', name: 'Proportional Valve POV03' },
      { id: 'POV06', name: 'Proportional Valve POV06' },
      { id: 'POV09', name: 'Proportional Valve POV09' },
      { id: 'POV10', name: 'Proportional Valve POV10' },
      { id: 'POV11', name: 'Proportional Valve POV11' },
      // Reactor Temperatures
      { id: 'RX1_MAX_TEMP', name: 'RX1 Max Temperature (°C)' },
      { id: 'RX2_MAX_TEMP', name: 'RX2 Max Temperature (°C)' },
      { id: 'RX3_MAX_TEMP', name: 'RX3 Max Temperature (°C)' },
      { id: 'RX1_T1', name: 'RX1 Temp T1' },
      { id: 'RX1_T2', name: 'RX1 Temp T2' },
      { id: 'RX1_T3', name: 'RX1 Temp T3' },
      { id: 'RX2_T1', name: 'RX2 Temp T1' },
      { id: 'RX2_T2', name: 'RX2 Temp T2' },
      { id: 'RX2_T3', name: 'RX2 Temp T3' },
      { id: 'RX3_T1', name: 'RX3 Temp T1' },
      { id: 'RX3_T2', name: 'RX3 Temp T2' },
      { id: 'RX3_T3', name: 'RX3 Temp T3' },
    ],

    EPU: [
      { id: '', name: '-- Select EPU Column --' },
      // Reactor 1 Voltages
      { id: 'RX1_V1', name: 'RX1 Cell Voltage V1' },
      { id: 'RX1_V2', name: 'RX1 Cell Voltage V2' },
      { id: 'RX1_V3', name: 'RX1 Cell Voltage V3' },
      { id: 'RX1_V4', name: 'RX1 Cell Voltage V4' },
      { id: 'RX1_V5', name: 'RX1 Cell Voltage V5' },
      // Reactor 2 Voltages
      { id: 'RX2_V1', name: 'RX2 Cell Voltage V1' },
      { id: 'RX2_V2', name: 'RX2 Cell Voltage V2' },
      { id: 'RX2_V3', name: 'RX2 Cell Voltage V3' },
      { id: 'RX2_V4', name: 'RX2 Cell Voltage V4' },
      { id: 'RX2_V5', name: 'RX2 Cell Voltage V5' },
      // Reactor 3 Voltages
      { id: 'RX3_V1', name: 'RX3 Cell Voltage V1' },
      { id: 'RX3_V2', name: 'RX3 Cell Voltage V2' },
      { id: 'RX3_V3', name: 'RX3 Cell Voltage V3' },
      { id: 'RX3_V4', name: 'RX3 Cell Voltage V4' },
      { id: 'RX3_V5', name: 'RX3 Cell Voltage V5' },
      // Reactor 1 Currents
      { id: 'RX1_C1', name: 'RX1 Cell Current C1' },
      { id: 'RX1_C2', name: 'RX1 Cell Current C2' },
      { id: 'RX1_C3', name: 'RX1 Cell Current C3' },
      // Reactor 2 Currents
      { id: 'RX2_C1', name: 'RX2 Cell Current C1' },
      { id: 'RX2_C2', name: 'RX2 Cell Current C2' },
      { id: 'RX2_C3', name: 'RX2 Cell Current C3' },
      // Reactor 3 Currents
      { id: 'RX3_C1', name: 'RX3 Cell Current C1' },
      { id: 'RX3_C2', name: 'RX3 Cell Current C2' },
      { id: 'RX3_C3', name: 'RX3 Cell Current C3' },
      // Cumulative Current
      { id: 'RX1_CUMULATIVE_CURRENT', name: 'RX1 Cumulative Current (A)' },
      { id: 'RX2_CUMULATIVE_CURRENT', name: 'RX2 Cumulative Current (A)' },
      { id: 'RX3_CUMULATIVE_CURRENT', name: 'RX3 Cumulative Current (A)' },
      // Flow
      { id: 'FT01', name: 'Flow Transmitter FT01' },
      { id: 'ARCHIE_GAS', name: 'Archie Gas Reading' },
      { id: 'MFM_TOTAL_H2_KG', name: 'MFM Total H₂ (kg)' },
    ],

    Production: [
      { id: '', name: '-- Select Production Column --' },
      { id: 'RX1_DAILY_PRODUCTION', name: 'RX1 Daily Production' },
      { id: 'RX2_DAILY_PRODUCTION', name: 'RX2 Daily Production' },
      { id: 'RX3_DAILY_PRODUCTION', name: 'RX3 Daily Production' },
      { id: 'SDR_DAILY_PRODUCTION', name: 'SDR Daily Production' },
      { id: 'Total_Production', name: 'Total Production' },
      { id: 'Daily_Production', name: 'Daily Production' },
      { id: 'Daily_Supply', name: 'Daily Supply' },
      { id: 'Daily_process_vent', name: 'Daily Process Vent' },
      { id: 'Daily_production_smp', name: 'Daily Production (SMP)' },
      { id: 'Yesterdays_production', name: "Yesterday's Production" },
      { id: 'WEEKLY_PRODUCTION', name: 'Weekly Production' },
      { id: 'MONTHLY_PRODUCTION', name: 'Monthly Production' },
      { id: 'YEARLY_PRODUCTION', name: 'Yearly Production' },
      { id: 'TOTAL_STORAGE', name: 'Total Storage' },
      { id: 'RX1_DAILY_STORAGE', name: 'RX1 Daily Storage' },
      { id: 'RX2_DAILY_STORAGE', name: 'RX2 Daily Storage' },
      { id: 'RX3_DAILY_STORAGE', name: 'RX3 Daily Storage' },
      { id: 'RX1_H2_CONC', name: 'RX1 H₂ Concentration (%)' },
      { id: 'RX2_H2_CONC', name: 'RX2 H₂ Concentration (%)' },
      { id: 'RX3_H2_CONC', name: 'RX3 H₂ Concentration (%)' },
      { id: 'RX1_CO2_CONC', name: 'RX1 CO₂ Concentration (%)' },
      { id: 'RX2_CO2_CONC', name: 'RX2 CO₂ Concentration (%)' },
      { id: 'RX3_CO2_CONC', name: 'RX3 CO₂ Concentration (%)' },
      { id: 'RX1_STATUS', name: 'RX1 Status' },
      { id: 'RX2_STATUS', name: 'RX2 Status' },
      { id: 'RX3_STATUS', name: 'RX3 Status' },
      { id: 'PURIFICATION_SALES', name: 'Purification Sales' },
    ]
  },

  // ─────────────────────────────────────────────
  // SDR SITE
  // ─────────────────────────────────────────────
  'SDR': {
    tableName: 'SDR',
    displayName: 'SDR',

    PT: [
      { id: '', name: '-- Select PT Column --' },
      // Pressure Transmitters
      { id: 'PT02', name: 'Pressure Transmitter PT02' },
      { id: 'PT03', name: 'Pressure Transmitter PT03' },
      { id: 'PT04', name: 'Pressure Transmitter PT04' },
      { id: 'PT05', name: 'Pressure Transmitter PT05' },
      { id: 'DIYFM_PT', name: 'DIYFM Pressure' },
      // Differential Pressure
      { id: 'DPT01', name: 'Differential Pressure DPT01' },
      { id: 'DPT02', name: 'Differential Pressure DPT02' },
      // Temperature Transmitters
      { id: 'TT01', name: 'Temperature Transmitter TT01' },
      { id: 'TT02', name: 'Temperature Transmitter TT02' },
      { id: 'RX_MAX_TEMP', name: 'Reactor Max Temperature (°C)' },
      { id: 'RX_T1', name: 'Reactor Temp Sensor T1' },
      { id: 'RX_T2', name: 'Reactor Temp Sensor T2' },
      { id: 'RX_T3', name: 'Reactor Temp Sensor T3' },
      { id: 'RX_T4', name: 'Reactor Temp Sensor T4' },
      { id: 'RX_T5', name: 'Reactor Temp Sensor T5' },
      { id: 'RX_T6', name: 'Reactor Temp Sensor T6' },
      { id: 'RX_T7', name: 'Reactor Temp Sensor T7' },
      { id: 'RX_T8', name: 'Reactor Temp Sensor T8' },
    ],

    EPU: [
      { id: '', name: '-- Select EPU Column --' },
      // Reactor Voltages (single reactor)
      { id: 'RX_V1', name: 'Reactor Cell Voltage V1' },
      { id: 'RX_V2', name: 'Reactor Cell Voltage V2' },
      { id: 'RX_V3', name: 'Reactor Cell Voltage V3' },
      { id: 'RX_V4', name: 'Reactor Cell Voltage V4' },
      { id: 'RX_V5', name: 'Reactor Cell Voltage V5' },
      { id: 'RX_V6', name: 'Reactor Cell Voltage V6' },
      // Reactor Currents
      { id: 'RX_C1', name: 'Reactor Cell Current C1' },
      { id: 'RX_C2', name: 'Reactor Cell Current C2' },
      { id: 'RX_C3', name: 'Reactor Cell Current C3' },
      { id: 'RX_C4', name: 'Reactor Cell Current C4' },
      { id: 'RX_C5', name: 'Reactor Cell Current C5' },
      { id: 'SDR_CUMULATIVE_CURRENT', name: 'SDR Cumulative Current (A)' },
      // Power Metering — PLC source
      { id: 'ACTIVE_POWER_SDR_PLC', name: 'Active Power — PLC (kW)' },
      { id: 'REACTIVE_POWER_SDR_PLC', name: 'Reactive Power — PLC (kVAR)' },
      { id: 'APPARENT_POWER_SDR_PLC', name: 'Apparent Power — PLC (kVA)' },
      { id: 'POWER_FACTOR_SDR_PLC', name: 'Power Factor — PLC' },
      { id: 'FREQUENCY_SDR_PLC', name: 'Frequency — PLC (Hz)' },
      { id: 'TOTAL_ACTIVE_ENERGY_SDR_PLC', name: 'Total Active Energy — PLC' },
      { id: 'IMPORT_ACTIVE_ENERGY_SDR_PLC', name: 'Import Active Energy — PLC' },
      { id: 'EXPORT_ACTIVE_ENERGY_SDR_PLC', name: 'Export Active Energy — PLC' },
      { id: 'TOTAL_REACTIVE_ENERGY_SDR_PLC', name: 'Total Reactive Energy — PLC' },
      { id: 'APPARENT_ENERGY_SDR_PLC', name: 'Apparent Energy — PLC' },
      // Power Metering — EPU source
      { id: 'ACTIVE_POWER_SDR_EPU', name: 'Active Power — EPU (kW)' },
      { id: 'REACTIVE_POWER_SDR_EPU', name: 'Reactive Power — EPU (kVAR)' },
      { id: 'APPARENT_POWER_SDR_EPU', name: 'Apparent Power — EPU (kVA)' },
      { id: 'POWER_FACTOR_SDR_EPU', name: 'Power Factor — EPU' },
      { id: 'FREQUENCY_SDR_EPU', name: 'Frequency — EPU (Hz)' },
      { id: 'TOTAL_ACTIVE_ENERGY_SDR_EPU', name: 'Total Active Energy — EPU' },
      { id: 'IMPORT_ACTIVE_ENERGY_SDR_EPU', name: 'Import Active Energy — EPU' },
      { id: 'EXPORT_ACTIVE_ENERGY_SDR_EPU', name: 'Export Active Energy — EPU' },
      { id: 'APPARENT_ENERGY_SDR_EPU', name: 'Apparent Energy — EPU' },
    ],

    Production: [
      { id: '', name: '-- Select Production Column --' },
      { id: 'TRIGGER_COUNT', name: 'Trigger Count' },
      { id: 'PRODUCTION_VOLUME', name: 'Production Volume' },
    ]
  }
};

export default function DataStreamSelector({ site = 'UCS', selectedStreams = { PT: [], EPU: [], Production: [] }, onChange }) {
  // Match the site string from OperatorForm to a catalog key
  const catalogKey = Object.keys(SITE_STREAM_CATALOG).find(
    k => site.toUpperCase() === k || site.toUpperCase().includes(k) || k.includes(site.toUpperCase())
  ) || 'UCS';

  const siteCatalog = SITE_STREAM_CATALOG[catalogKey];

  const categories = [
    { key: 'PT', label: 'PT (Pressure & Temperature)', icon: Activity, color: '#8b5cf6' },
    { key: 'EPU', label: 'EPU (Electrical Power Unit)', icon: Zap, color: '#f59e0b' },
    { key: 'Production', label: 'Production Data', icon: Factory, color: '#10b981' }
  ];

  // Dropdown open states and search queries
  const [openDropdown, setOpenDropdown] = React.useState(null); // 'PT' | 'EPU' | 'Production' | null
  const [searchQueries, setSearchQueries] = React.useState({
    PT: '',
    EPU: '',
    Production: ''
  });

  const handleToggleColumn = (catKey, colId) => {
    const selectedList = selectedStreams[catKey] || [];
    let newList;
    if (selectedList.includes(colId)) {
      newList = selectedList.filter(id => id !== colId);
    } else {
      newList = [...selectedList, colId];
    }
    onChange({
      ...selectedStreams,
      [catKey]: newList
    });
  };

  const handleSearchChange = (catKey, query) => {
    setSearchQueries({
      ...searchQueries,
      [catKey]: query
    });
  };

  const handleClearCategory = (catKey, e) => {
    e.stopPropagation();
    onChange({
      ...selectedStreams,
      [catKey]: []
    });
  };

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>Selected Table Schema:</span>
        <strong style={{ color: '#38bdf8' }}>{siteCatalog.displayName}</strong>
      </div>

      {/* Global transparent backdrop overlay to dismiss dropdowns on outside clicks */}
      {openDropdown && (
        <div
          onClick={() => setOpenDropdown(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'transparent'
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {categories.map(({ key: catKey, label, icon: Icon, color }) => {
          const selectedList = selectedStreams[catKey] || [];
          const rawOptions = siteCatalog[catKey] || [];
          // Filter out the placeholder elements (usually index 0)
          const options = rawOptions.filter(opt => opt.id !== '');

          const searchQuery = searchQueries[catKey] || '';
          const filteredOptions = options.filter(opt =>
            opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.id.toLowerCase().includes(searchQuery.toLowerCase())
          );

          const isDropdownOpen = openDropdown === catKey;

          return (
            <div key={catKey} style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '14px',
              border: `1px solid ${selectedList.length > 0 ? color + '40' : 'rgba(255, 255, 255, 0.08)'}`,
              padding: '18px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    {options.length} columns available for {siteCatalog.tableName}
                  </div>
                </div>
              </div>

              {/* Custom Dropdown Trigger */}
              <div style={{ position: 'relative', zIndex: isDropdownOpen ? 50 : 10 }}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isDropdownOpen ? null : catKey)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '36px',
                    textAlign: 'left',
                    background: selectedList.length > 0
                      ? `rgba(15, 23, 42, 0.8)`
                      : 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${selectedList.length > 0 ? color + '50' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    color: selectedList.length > 0 ? '#e5e7eb' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '85%'
                  }}>
                    {selectedList.length > 0
                      ? `${selectedList.length} stream(s) selected`
                      : 'Select columns...'}
                  </span>
                  <ChevronDown
                    size={16}
                    color={selectedList.length > 0 ? color : '#6b7280'}
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>

                {/* Floating Dropdown Panel */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#0d131f',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.7), 0 0 15px rgba(59, 130, 246, 0.15)',
                    padding: '12px',
                    maxHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {/* Search Field */}
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search streams..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(catKey, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px'
                      }}
                    />

                    {/* Options list */}
                    <div style={{
                      overflowY: 'auto',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      paddingRight: '4px'
                    }}>
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => {
                          const isChecked = selectedList.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: isChecked ? `${color}15` : 'transparent',
                                transition: 'background 0.15s',
                                fontSize: '0.85rem',
                                color: isChecked ? '#fff' : '#9ca3af'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleColumn(catKey, opt.id)}
                                style={{
                                  cursor: 'pointer',
                                  accentColor: color
                                }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: isChecked ? 600 : 400 }}>{opt.name}</span>
                                <span style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'JetBrains Mono' }}>{opt.id}</span>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', padding: '12px' }}>
                          No columns match filter
                        </div>
                      )}
                    </div>


                  </div>
                )}
              </div>

              {/* Outside Selected Streams Section with Clear All Button */}
              {selectedList.length > 0 && (
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>
                      Selected ({selectedList.length}):
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleClearCategory(catKey, e)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#f87171',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Clear all selected streams in this category"
                    >
                      <Trash2 size={12} />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    {selectedList.map(id => (
                      <span
                        key={id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: `${color}18`,
                          color,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${color}35`,
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        <span>{id}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleColumn(catKey, id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: color,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.8
                          }}
                          title={`Remove ${id}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
