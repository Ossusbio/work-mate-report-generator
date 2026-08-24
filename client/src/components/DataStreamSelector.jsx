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
  "UCS": {
    "tableName": "UCS",
    "displayName": "UCS",
    "PT": [
      {
        "id": "",
        "name": "-- Select PT Column --"
      },
      {
        "id": "AI_1_0",
        "name": "Analog Input 1-0 (AI_1_0)"
      },
      {
        "id": "AI_1_1",
        "name": "Analog Input 1-1 (AI_1_1)"
      },
      {
        "id": "AI_1_2",
        "name": "Analog Input 1-2 (AI_1_2)"
      },
      {
        "id": "AI_1_3",
        "name": "Analog Input 1-3 (AI_1_3)"
      },
      {
        "id": "AI_1_4",
        "name": "Analog Input 1-4 (AI_1_4)"
      },
      {
        "id": "AI_1_5",
        "name": "Analog Input 1-5 (AI_1_5)"
      },
      {
        "id": "AI_1_6",
        "name": "Analog Input 1-6 (AI_1_6)"
      },
      {
        "id": "AI_1_7",
        "name": "Analog Input 1-7 (AI_1_7)"
      },
      {
        "id": "AI_2_0",
        "name": "Analog Input 2-0 (AI_2_0)"
      },
      {
        "id": "AI_2_1",
        "name": "Analog Input 2-1 (AI_2_1)"
      },
      {
        "id": "AI_2_2",
        "name": "Analog Input 2-2 (AI_2_2)"
      },
      {
        "id": "AI_2_3",
        "name": "Analog Input 2-3 (AI_2_3)"
      },
      {
        "id": "AI_2_4",
        "name": "Analog Input 2-4 (AI_2_4)"
      },
      {
        "id": "AI_2_5",
        "name": "Analog Input 2-5 (AI_2_5)"
      },
      {
        "id": "AI_2_6",
        "name": "Analog Input 2-6 (AI_2_6)"
      },
      {
        "id": "AI_2_7",
        "name": "Analog Input 2-7 (AI_2_7)"
      },
      {
        "id": "AI_3_0",
        "name": "Analog Input 3-0 (AI_3_0)"
      },
      {
        "id": "AI_3_1",
        "name": "Analog Input 3-1 (AI_3_1)"
      },
      {
        "id": "AI_3_2",
        "name": "Analog Input 3-2 (AI_3_2)"
      },
      {
        "id": "AI_3_3",
        "name": "Analog Input 3-3 (AI_3_3)"
      },
      {
        "id": "AI_3_4",
        "name": "Analog Input 3-4 (AI_3_4)"
      },
      {
        "id": "AI_3_5",
        "name": "Analog Input 3-5 (AI_3_5)"
      },
      {
        "id": "AI_3_6",
        "name": "Analog Input 3-6 (AI_3_6)"
      },
      {
        "id": "AI_3_7",
        "name": "Analog Input 3-7 (AI_3_7)"
      }
    ],
    "EPU": [
      {
        "id": "",
        "name": "-- Select EPU Column --"
      },
      {
        "id": "TEMP_1",
        "name": "Temperature 1 (°C)"
      },
      {
        "id": "TEMP_2",
        "name": "Temperature 2 (°C)"
      },
      {
        "id": "TEMP_3",
        "name": "Temperature 3 (°C)"
      },
      {
        "id": "TEMP_4",
        "name": "Temperature 4 (°C)"
      },
      {
        "id": "TEMP_5",
        "name": "Temperature 5 (°C)"
      },
      {
        "id": "TEMP_6",
        "name": "Temperature 6 (°C)"
      },
      {
        "id": "TEMP_7",
        "name": "Temperature 7 (°C)"
      },
      {
        "id": "TEMP_8",
        "name": "Temperature 8 (°C)"
      },
      {
        "id": "TEMP_9",
        "name": "Temperature 9 (°C)"
      },
      {
        "id": "VOUT_1",
        "name": "Output Voltage 1 (V)"
      },
      {
        "id": "VOUT_2",
        "name": "Output Voltage 2 (V)"
      },
      {
        "id": "VOUT_3",
        "name": "Output Voltage 3 (V)"
      },
      {
        "id": "VOUT_4",
        "name": "Output Voltage 4 (V)"
      },
      {
        "id": "VOUT_5",
        "name": "Output Voltage 5 (V)"
      },
      {
        "id": "VOUT_6",
        "name": "Output Voltage 6 (V)"
      },
      {
        "id": "VOUT_7",
        "name": "Output Voltage 7 (V)"
      },
      {
        "id": "VOUT_8",
        "name": "Output Voltage 8 (V)"
      },
      {
        "id": "VOUT_9",
        "name": "Output Voltage 9 (V)"
      },
      {
        "id": "IOUT_1",
        "name": "Output Current 1 (A)"
      },
      {
        "id": "IOUT_2",
        "name": "Output Current 2 (A)"
      },
      {
        "id": "IOUT_3",
        "name": "Output Current 3 (A)"
      },
      {
        "id": "IOUT_4",
        "name": "Output Current 4 (A)"
      },
      {
        "id": "IOUT_5",
        "name": "Output Current 5 (A)"
      },
      {
        "id": "IOUT_6",
        "name": "Output Current 6 (A)"
      },
      {
        "id": "IOUT_7",
        "name": "Output Current 7 (A)"
      },
      {
        "id": "IOUT_8",
        "name": "Output Current 8 (A)"
      },
      {
        "id": "IOUT_9",
        "name": "Output Current 9 (A)"
      },
      {
        "id": "SENSOR_VOLTAGE",
        "name": "Sensor Voltage (V)"
      },
      {
        "id": "SENSOR_CURRENT",
        "name": "Sensor Current (A)"
      },
      {
        "id": "CURRENT_DENSITY",
        "name": "Current Density"
      },
      {
        "id": "BTPS_1_VOLTAGE",
        "name": "BTPS 1 Voltage (V)"
      },
      {
        "id": "BTPS_1_CURRENT",
        "name": "BTPS 1 Current (A)"
      },
      {
        "id": "BTPS_1_ENERGY",
        "name": "BTPS 1 Energy"
      },
      {
        "id": "BTPS_2_VOLTAGE",
        "name": "BTPS 2 Voltage (V)"
      },
      {
        "id": "BTPS_2_CURRENT",
        "name": "BTPS 2 Current (A)"
      },
      {
        "id": "BTPS_2_ENERGY",
        "name": "BTPS 2 Energy"
      },
      {
        "id": "BTPS_3_VOLTAGE",
        "name": "BTPS 3 Voltage (V)"
      },
      {
        "id": "BTPS_3_CURRENT",
        "name": "BTPS 3 Current (A)"
      },
      {
        "id": "BTPS_3_ENERGY",
        "name": "BTPS 3 Energy"
      }
    ],
    "Production": [
      {
        "id": "",
        "name": "-- Select Production Column --"
      },
      {
        "id": "RX1_PRODUCTION_VOLUME",
        "name": "RX1 Production Volume"
      },
      {
        "id": "RX2_PRODUCTION_VOLUME",
        "name": "RX2 Production Volume"
      },
      {
        "id": "RX3_PRODUCTION_VOLUME",
        "name": "RX3 Production Volume"
      },
      {
        "id": "RX5_PRODUCTION_VOLUME",
        "name": "RX5 Production Volume"
      },
      {
        "id": "TB5_PRODUCTION_VOLUME",
        "name": "TB5 Production Volume"
      },
      {
        "id": "TEN_C_STACK_PRODUCTION_VOLUME",
        "name": "10C Stack Production Volume"
      }
    ]
  },
  "SMP_3RX_SKID": {
    "tableName": "SMP_3RX_SKID",
    "displayName": "SMP 3RX Skid Site (Table: SMP_3RX_SKID)",
    "PT": [
      {
        "id": "",
        "name": "-- Select PT Column --"
      },
      {
        "id": "PT03",
        "name": "Pressure Transmitter PT03"
      },
      {
        "id": "PT04",
        "name": "Pressure Transmitter PT04"
      },
      {
        "id": "PT05",
        "name": "Pressure Transmitter PT05"
      },
      {
        "id": "PT06",
        "name": "Pressure Transmitter PT06"
      },
      {
        "id": "PT07",
        "name": "Pressure Transmitter PT07"
      },
      {
        "id": "PT08",
        "name": "Pressure Transmitter PT08"
      },
      {
        "id": "NINE_STACK_PT",
        "name": "9-Stack Pressure"
      },
      {
        "id": "TWELVE_STACKPT",
        "name": "12-Stack Pressure"
      },
      {
        "id": "PPT",
        "name": "Process Pressure (PPT)"
      },
      {
        "id": "MAX_INLET_PT",
        "name": "Max Inlet Pressure"
      },
      {
        "id": "MAX_OUTLET_PT",
        "name": "Max Outlet Pressure"
      },
      {
        "id": "DPT01",
        "name": "Differential Pressure DPT01"
      },
      {
        "id": "DPT02",
        "name": "Differential Pressure DPT02"
      },
      {
        "id": "DPT03",
        "name": "Differential Pressure DPT03"
      },
      {
        "id": "ARCHIE_GAS",
        "name": "Archie Gas Reading"
      }
    ],
    "EPU": [
      {
        "id": "",
        "name": "-- Select EPU Column --"
      },
      {
        "id": "RX1_V1",
        "name": "RX1 Voltage V1 (V)"
      },
      {
        "id": "RX1_V2",
        "name": "RX1 Voltage V2 (V)"
      },
      {
        "id": "RX1_V3",
        "name": "RX1 Voltage V3 (V)"
      },
      {
        "id": "RX1_V4",
        "name": "RX1 Voltage V4 (V)"
      },
      {
        "id": "RX1_V5",
        "name": "RX1 Voltage V5 (V)"
      },
      {
        "id": "RX1_V6",
        "name": "RX1 Voltage V6 (V)"
      },
      {
        "id": "RX1_V7",
        "name": "RX1 Voltage V7 (V)"
      },
      {
        "id": "RX1_V8",
        "name": "RX1 Voltage V8 (V)"
      },
      {
        "id": "RX1_V9",
        "name": "RX1 Voltage V9 (V)"
      },
      {
        "id": "RX1_V10",
        "name": "RX1 Voltage V10 (V)"
      },
      {
        "id": "RX1_V11",
        "name": "RX1 Voltage V11 (V)"
      },
      {
        "id": "RX1_V12",
        "name": "RX1 Voltage V12 (V)"
      },
      {
        "id": "RX1_V13",
        "name": "RX1 Voltage V13 (V)"
      },
      {
        "id": "RX1_V14",
        "name": "RX1 Voltage V14 (V)"
      },
      {
        "id": "RX1_V15",
        "name": "RX1 Voltage V15 (V)"
      },
      {
        "id": "RX1_V16",
        "name": "RX1 Voltage V16 (V)"
      },
      {
        "id": "RX1_V17",
        "name": "RX1 Voltage V17 (V)"
      },
      {
        "id": "RX1_V18",
        "name": "RX1 Voltage V18 (V)"
      },
      {
        "id": "RX1_V19",
        "name": "RX1 Voltage V19 (V)"
      },
      {
        "id": "RX1_V20",
        "name": "RX1 Voltage V20 (V)"
      },
      {
        "id": "RX1_V21",
        "name": "RX1 Voltage V21 (V)"
      },
      {
        "id": "RX1_V22",
        "name": "RX1 Voltage V22 (V)"
      },
      {
        "id": "RX1_V23",
        "name": "RX1 Voltage V23 (V)"
      },
      {
        "id": "RX1_V24",
        "name": "RX1 Voltage V24 (V)"
      },
      {
        "id": "RX1_V25",
        "name": "RX1 Voltage V25 (V)"
      },
      {
        "id": "RX1_V26",
        "name": "RX1 Voltage V26 (V)"
      },
      {
        "id": "RX1_V27",
        "name": "RX1 Voltage V27 (V)"
      },
      {
        "id": "RX1_V28",
        "name": "RX1 Voltage V28 (V)"
      },
      {
        "id": "RX2_V1",
        "name": "RX2 Voltage V1 (V)"
      },
      {
        "id": "RX2_V2",
        "name": "RX2 Voltage V2 (V)"
      },
      {
        "id": "RX2_V3",
        "name": "RX2 Voltage V3 (V)"
      },
      {
        "id": "RX2_V4",
        "name": "RX2 Voltage V4 (V)"
      },
      {
        "id": "RX2_V5",
        "name": "RX2 Voltage V5 (V)"
      },
      {
        "id": "RX2_V6",
        "name": "RX2 Voltage V6 (V)"
      },
      {
        "id": "RX2_V7",
        "name": "RX2 Voltage V7 (V)"
      },
      {
        "id": "RX2_V8",
        "name": "RX2 Voltage V8 (V)"
      },
      {
        "id": "RX2_V9",
        "name": "RX2 Voltage V9 (V)"
      },
      {
        "id": "RX2_V10",
        "name": "RX2 Voltage V10 (V)"
      },
      {
        "id": "RX2_V11",
        "name": "RX2 Voltage V11 (V)"
      },
      {
        "id": "RX2_V12",
        "name": "RX2 Voltage V12 (V)"
      },
      {
        "id": "RX2_V13",
        "name": "RX2 Voltage V13 (V)"
      },
      {
        "id": "RX2_V14",
        "name": "RX2 Voltage V14 (V)"
      },
      {
        "id": "RX2_V15",
        "name": "RX2 Voltage V15 (V)"
      },
      {
        "id": "RX2_V16",
        "name": "RX2 Voltage V16 (V)"
      },
      {
        "id": "RX2_V17",
        "name": "RX2 Voltage V17 (V)"
      },
      {
        "id": "RX2_V18",
        "name": "RX2 Voltage V18 (V)"
      },
      {
        "id": "RX2_V19",
        "name": "RX2 Voltage V19 (V)"
      },
      {
        "id": "RX2_V20",
        "name": "RX2 Voltage V20 (V)"
      },
      {
        "id": "RX2_V21",
        "name": "RX2 Voltage V21 (V)"
      },
      {
        "id": "RX2_V22",
        "name": "RX2 Voltage V22 (V)"
      },
      {
        "id": "RX2_V23",
        "name": "RX2 Voltage V23 (V)"
      },
      {
        "id": "RX2_V24",
        "name": "RX2 Voltage V24 (V)"
      },
      {
        "id": "RX2_V25",
        "name": "RX2 Voltage V25 (V)"
      },
      {
        "id": "RX2_V26",
        "name": "RX2 Voltage V26 (V)"
      },
      {
        "id": "RX2_V27",
        "name": "RX2 Voltage V27 (V)"
      },
      {
        "id": "RX2_V28",
        "name": "RX2 Voltage V28 (V)"
      },
      {
        "id": "RX3_V1",
        "name": "RX3 Voltage V1 (V)"
      },
      {
        "id": "RX3_V2",
        "name": "RX3 Voltage V2 (V)"
      },
      {
        "id": "RX3_V3",
        "name": "RX3 Voltage V3 (V)"
      },
      {
        "id": "RX3_V4",
        "name": "RX3 Voltage V4 (V)"
      },
      {
        "id": "RX3_V5",
        "name": "RX3 Voltage V5 (V)"
      },
      {
        "id": "RX3_V6",
        "name": "RX3 Voltage V6 (V)"
      },
      {
        "id": "RX3_V7",
        "name": "RX3 Voltage V7 (V)"
      },
      {
        "id": "RX3_V8",
        "name": "RX3 Voltage V8 (V)"
      },
      {
        "id": "RX3_V9",
        "name": "RX3 Voltage V9 (V)"
      },
      {
        "id": "RX3_V10",
        "name": "RX3 Voltage V10 (V)"
      },
      {
        "id": "RX3_V11",
        "name": "RX3 Voltage V11 (V)"
      },
      {
        "id": "RX3_V12",
        "name": "RX3 Voltage V12 (V)"
      },
      {
        "id": "RX3_V13",
        "name": "RX3 Voltage V13 (V)"
      },
      {
        "id": "RX3_V14",
        "name": "RX3 Voltage V14 (V)"
      },
      {
        "id": "RX3_V15",
        "name": "RX3 Voltage V15 (V)"
      },
      {
        "id": "RX3_V16",
        "name": "RX3 Voltage V16 (V)"
      },
      {
        "id": "RX3_V17",
        "name": "RX3 Voltage V17 (V)"
      },
      {
        "id": "RX3_V18",
        "name": "RX3 Voltage V18 (V)"
      },
      {
        "id": "RX3_V19",
        "name": "RX3 Voltage V19 (V)"
      },
      {
        "id": "RX3_V20",
        "name": "RX3 Voltage V20 (V)"
      },
      {
        "id": "RX3_V21",
        "name": "RX3 Voltage V21 (V)"
      },
      {
        "id": "RX3_V22",
        "name": "RX3 Voltage V22 (V)"
      },
      {
        "id": "RX3_V23",
        "name": "RX3 Voltage V23 (V)"
      },
      {
        "id": "RX3_V24",
        "name": "RX3 Voltage V24 (V)"
      },
      {
        "id": "RX3_V25",
        "name": "RX3 Voltage V25 (V)"
      },
      {
        "id": "RX3_V26",
        "name": "RX3 Voltage V26 (V)"
      },
      {
        "id": "RX3_V27",
        "name": "RX3 Voltage V27 (V)"
      },
      {
        "id": "RX3_V28",
        "name": "RX3 Voltage V28 (V)"
      },
      {
        "id": "RX1_C1",
        "name": "RX1 Current C1 (A)"
      },
      {
        "id": "RX1_C2",
        "name": "RX1 Current C2 (A)"
      },
      {
        "id": "RX1_C3",
        "name": "RX1 Current C3 (A)"
      },
      {
        "id": "RX1_C4",
        "name": "RX1 Current C4 (A)"
      },
      {
        "id": "RX1_C5",
        "name": "RX1 Current C5 (A)"
      },
      {
        "id": "RX1_C6",
        "name": "RX1 Current C6 (A)"
      },
      {
        "id": "RX1_C7",
        "name": "RX1 Current C7 (A)"
      },
      {
        "id": "RX1_C8",
        "name": "RX1 Current C8 (A)"
      },
      {
        "id": "RX1_C9",
        "name": "RX1 Current C9 (A)"
      },
      {
        "id": "RX1_C10",
        "name": "RX1 Current C10 (A)"
      },
      {
        "id": "RX1_C11",
        "name": "RX1 Current C11 (A)"
      },
      {
        "id": "RX1_C12",
        "name": "RX1 Current C12 (A)"
      },
      {
        "id": "RX1_C13",
        "name": "RX1 Current C13 (A)"
      },
      {
        "id": "RX1_C14",
        "name": "RX1 Current C14 (A)"
      },
      {
        "id": "RX1_C15",
        "name": "RX1 Current C15 (A)"
      },
      {
        "id": "RX1_C16",
        "name": "RX1 Current C16 (A)"
      },
      {
        "id": "RX1_C17",
        "name": "RX1 Current C17 (A)"
      },
      {
        "id": "RX1_C18",
        "name": "RX1 Current C18 (A)"
      },
      {
        "id": "RX1_C19",
        "name": "RX1 Current C19 (A)"
      },
      {
        "id": "RX1_C20",
        "name": "RX1 Current C20 (A)"
      },
      {
        "id": "RX1_C21",
        "name": "RX1 Current C21 (A)"
      },
      {
        "id": "RX1_C22",
        "name": "RX1 Current C22 (A)"
      },
      {
        "id": "RX1_C23",
        "name": "RX1 Current C23 (A)"
      },
      {
        "id": "RX1_C24",
        "name": "RX1 Current C24 (A)"
      },
      {
        "id": "RX1_C25",
        "name": "RX1 Current C25 (A)"
      },
      {
        "id": "RX1_C26",
        "name": "RX1 Current C26 (A)"
      },
      {
        "id": "RX1_C27",
        "name": "RX1 Current C27 (A)"
      },
      {
        "id": "RX1_C28",
        "name": "RX1 Current C28 (A)"
      },
      {
        "id": "RX2_C1",
        "name": "RX2 Current C1 (A)"
      },
      {
        "id": "RX2_C2",
        "name": "RX2 Current C2 (A)"
      },
      {
        "id": "RX2_C3",
        "name": "RX2 Current C3 (A)"
      },
      {
        "id": "RX2_C4",
        "name": "RX2 Current C4 (A)"
      },
      {
        "id": "RX2_C5",
        "name": "RX2 Current C5 (A)"
      },
      {
        "id": "RX2_C6",
        "name": "RX2 Current C6 (A)"
      },
      {
        "id": "RX2_C7",
        "name": "RX2 Current C7 (A)"
      },
      {
        "id": "RX2_C8",
        "name": "RX2 Current C8 (A)"
      },
      {
        "id": "RX2_C9",
        "name": "RX2 Current C9 (A)"
      },
      {
        "id": "RX2_C10",
        "name": "RX2 Current C10 (A)"
      },
      {
        "id": "RX2_C11",
        "name": "RX2 Current C11 (A)"
      },
      {
        "id": "RX2_C12",
        "name": "RX2 Current C12 (A)"
      },
      {
        "id": "RX2_C13",
        "name": "RX2 Current C13 (A)"
      },
      {
        "id": "RX2_C14",
        "name": "RX2 Current C14 (A)"
      },
      {
        "id": "RX2_C15",
        "name": "RX2 Current C15 (A)"
      },
      {
        "id": "RX2_C16",
        "name": "RX2 Current C16 (A)"
      },
      {
        "id": "RX2_C17",
        "name": "RX2 Current C17 (A)"
      },
      {
        "id": "RX2_C18",
        "name": "RX2 Current C18 (A)"
      },
      {
        "id": "RX2_C19",
        "name": "RX2 Current C19 (A)"
      },
      {
        "id": "RX2_C20",
        "name": "RX2 Current C20 (A)"
      },
      {
        "id": "RX2_C21",
        "name": "RX2 Current C21 (A)"
      },
      {
        "id": "RX2_C22",
        "name": "RX2 Current C22 (A)"
      },
      {
        "id": "RX2_C23",
        "name": "RX2 Current C23 (A)"
      },
      {
        "id": "RX2_C24",
        "name": "RX2 Current C24 (A)"
      },
      {
        "id": "RX2_C25",
        "name": "RX2 Current C25 (A)"
      },
      {
        "id": "RX2_C26",
        "name": "RX2 Current C26 (A)"
      },
      {
        "id": "RX2_C27",
        "name": "RX2 Current C27 (A)"
      },
      {
        "id": "RX2_C28",
        "name": "RX2 Current C28 (A)"
      },
      {
        "id": "RX3_C1",
        "name": "RX3 Current C1 (A)"
      },
      {
        "id": "RX3_C2",
        "name": "RX3 Current C2 (A)"
      },
      {
        "id": "RX3_C3",
        "name": "RX3 Current C3 (A)"
      },
      {
        "id": "RX3_C4",
        "name": "RX3 Current C4 (A)"
      },
      {
        "id": "RX3_C5",
        "name": "RX3 Current C5 (A)"
      },
      {
        "id": "RX3_C6",
        "name": "RX3 Current C6 (A)"
      },
      {
        "id": "RX3_C7",
        "name": "RX3 Current C7 (A)"
      },
      {
        "id": "RX3_C8",
        "name": "RX3 Current C8 (A)"
      },
      {
        "id": "RX3_C9",
        "name": "RX3 Current C9 (A)"
      },
      {
        "id": "RX3_C10",
        "name": "RX3 Current C10 (A)"
      },
      {
        "id": "RX3_C11",
        "name": "RX3 Current C11 (A)"
      },
      {
        "id": "RX3_C12",
        "name": "RX3 Current C12 (A)"
      },
      {
        "id": "RX3_C13",
        "name": "RX3 Current C13 (A)"
      },
      {
        "id": "RX3_C14",
        "name": "RX3 Current C14 (A)"
      },
      {
        "id": "RX3_C15",
        "name": "RX3 Current C15 (A)"
      },
      {
        "id": "RX3_C16",
        "name": "RX3 Current C16 (A)"
      },
      {
        "id": "RX3_C17",
        "name": "RX3 Current C17 (A)"
      },
      {
        "id": "RX3_C18",
        "name": "RX3 Current C18 (A)"
      },
      {
        "id": "RX3_C19",
        "name": "RX3 Current C19 (A)"
      },
      {
        "id": "RX3_C20",
        "name": "RX3 Current C20 (A)"
      },
      {
        "id": "RX3_C21",
        "name": "RX3 Current C21 (A)"
      },
      {
        "id": "RX3_C22",
        "name": "RX3 Current C22 (A)"
      },
      {
        "id": "RX3_C23",
        "name": "RX3 Current C23 (A)"
      },
      {
        "id": "RX3_C24",
        "name": "RX3 Current C24 (A)"
      },
      {
        "id": "RX3_C25",
        "name": "RX3 Current C25 (A)"
      },
      {
        "id": "RX3_C26",
        "name": "RX3 Current C26 (A)"
      },
      {
        "id": "RX3_C27",
        "name": "RX3 Current C27 (A)"
      },
      {
        "id": "RX3_C28",
        "name": "RX3 Current C28 (A)"
      },
      {
        "id": "RX1_CUMULATIVE_CURRENT",
        "name": "RX1 Cumulative Current (A)"
      },
      {
        "id": "RX2_CUMULATIVE_CURRENT",
        "name": "RX2 Cumulative Current (A)"
      },
      {
        "id": "RX3_CUMULATIVE_CURRENT",
        "name": "RX3 Cumulative Current (A)"
      },
      {
        "id": "FT01",
        "name": "Flow Transmitter FT01"
      },
      {
        "id": "MFM_TOTAL_H2_KG",
        "name": "MFM Total H2 (kg)"
      },
      {
        "id": "RX1_MAX_TEMP",
        "name": "RX1 Max Temperature (°C)"
      },
      {
        "id": "RX1_T1",
        "name": "RX1 Temperature T1 (°C)"
      },
      {
        "id": "RX1_T2",
        "name": "RX1 Temperature T2 (°C)"
      },
      {
        "id": "RX1_T3",
        "name": "RX1 Temperature T3 (°C)"
      },
      {
        "id": "RX1_T4",
        "name": "RX1 Temperature T4 (°C)"
      },
      {
        "id": "RX1_T5",
        "name": "RX1 Temperature T5 (°C)"
      },
      {
        "id": "RX1_T6",
        "name": "RX1 Temperature T6 (°C)"
      },
      {
        "id": "RX1_T7",
        "name": "RX1 Temperature T7 (°C)"
      },
      {
        "id": "RX1_T8",
        "name": "RX1 Temperature T8 (°C)"
      },
      {
        "id": "RX1_T9",
        "name": "RX1 Temperature T9 (°C)"
      },
      {
        "id": "RX1_T10",
        "name": "RX1 Temperature T10 (°C)"
      },
      {
        "id": "RX1_T11",
        "name": "RX1 Temperature T11 (°C)"
      },
      {
        "id": "RX1_T12",
        "name": "RX1 Temperature T12 (°C)"
      },
      {
        "id": "RX1_T13",
        "name": "RX1 Temperature T13 (°C)"
      },
      {
        "id": "RX1_T14",
        "name": "RX1 Temperature T14 (°C)"
      },
      {
        "id": "RX1_T15",
        "name": "RX1 Temperature T15 (°C)"
      },
      {
        "id": "RX1_T16",
        "name": "RX1 Temperature T16 (°C)"
      },
      {
        "id": "RX1_T17",
        "name": "RX1 Temperature T17 (°C)"
      },
      {
        "id": "RX1_T18",
        "name": "RX1 Temperature T18 (°C)"
      },
      {
        "id": "RX1_T19",
        "name": "RX1 Temperature T19 (°C)"
      },
      {
        "id": "RX1_T20",
        "name": "RX1 Temperature T20 (°C)"
      },
      {
        "id": "RX1_T21",
        "name": "RX1 Temperature T21 (°C)"
      },
      {
        "id": "RX1_T22",
        "name": "RX1 Temperature T22 (°C)"
      },
      {
        "id": "RX1_T23",
        "name": "RX1 Temperature T23 (°C)"
      },
      {
        "id": "RX1_T24",
        "name": "RX1 Temperature T24 (°C)"
      },
      {
        "id": "RX1_T25",
        "name": "RX1 Temperature T25 (°C)"
      },
      {
        "id": "RX1_T26",
        "name": "RX1 Temperature T26 (°C)"
      },
      {
        "id": "RX1_T27",
        "name": "RX1 Temperature T27 (°C)"
      },
      {
        "id": "RX1_T28",
        "name": "RX1 Temperature T28 (°C)"
      },
      {
        "id": "RX2_MAX_TEMP",
        "name": "RX2 Max Temperature (°C)"
      },
      {
        "id": "RX2_T1",
        "name": "RX2 Temperature T1 (°C)"
      },
      {
        "id": "RX2_T2",
        "name": "RX2 Temperature T2 (°C)"
      },
      {
        "id": "RX2_T3",
        "name": "RX2 Temperature T3 (°C)"
      },
      {
        "id": "RX2_T4",
        "name": "RX2 Temperature T4 (°C)"
      },
      {
        "id": "RX2_T5",
        "name": "RX2 Temperature T5 (°C)"
      },
      {
        "id": "RX2_T6",
        "name": "RX2 Temperature T6 (°C)"
      },
      {
        "id": "RX2_T7",
        "name": "RX2 Temperature T7 (°C)"
      },
      {
        "id": "RX2_T8",
        "name": "RX2 Temperature T8 (°C)"
      },
      {
        "id": "RX2_T9",
        "name": "RX2 Temperature T9 (°C)"
      },
      {
        "id": "RX2_T10",
        "name": "RX2 Temperature T10 (°C)"
      },
      {
        "id": "RX2_T11",
        "name": "RX2 Temperature T11 (°C)"
      },
      {
        "id": "RX2_T12",
        "name": "RX2 Temperature T12 (°C)"
      },
      {
        "id": "RX2_T13",
        "name": "RX2 Temperature T13 (°C)"
      },
      {
        "id": "RX2_T14",
        "name": "RX2 Temperature T14 (°C)"
      },
      {
        "id": "RX2_T15",
        "name": "RX2 Temperature T15 (°C)"
      },
      {
        "id": "RX2_T16",
        "name": "RX2 Temperature T16 (°C)"
      },
      {
        "id": "RX2_T17",
        "name": "RX2 Temperature T17 (°C)"
      },
      {
        "id": "RX2_T18",
        "name": "RX2 Temperature T18 (°C)"
      },
      {
        "id": "RX2_T19",
        "name": "RX2 Temperature T19 (°C)"
      },
      {
        "id": "RX2_T20",
        "name": "RX2 Temperature T20 (°C)"
      },
      {
        "id": "RX2_T21",
        "name": "RX2 Temperature T21 (°C)"
      },
      {
        "id": "RX2_T22",
        "name": "RX2 Temperature T22 (°C)"
      },
      {
        "id": "RX2_T23",
        "name": "RX2 Temperature T23 (°C)"
      },
      {
        "id": "RX2_T24",
        "name": "RX2 Temperature T24 (°C)"
      },
      {
        "id": "RX2_T25",
        "name": "RX2 Temperature T25 (°C)"
      },
      {
        "id": "RX2_T26",
        "name": "RX2 Temperature T26 (°C)"
      },
      {
        "id": "RX2_T27",
        "name": "RX2 Temperature T27 (°C)"
      },
      {
        "id": "RX2_T28",
        "name": "RX2 Temperature T28 (°C)"
      },
      {
        "id": "RX3_MAX_TEMP",
        "name": "RX3 Max Temperature (°C)"
      },
      {
        "id": "RX3_T1",
        "name": "RX3 Temperature T1 (°C)"
      },
      {
        "id": "RX3_T2",
        "name": "RX3 Temperature T2 (°C)"
      },
      {
        "id": "RX3_T3",
        "name": "RX3 Temperature T3 (°C)"
      },
      {
        "id": "RX3_T4",
        "name": "RX3 Temperature T4 (°C)"
      },
      {
        "id": "RX3_T5",
        "name": "RX3 Temperature T5 (°C)"
      },
      {
        "id": "RX3_T6",
        "name": "RX3 Temperature T6 (°C)"
      },
      {
        "id": "RX3_T7",
        "name": "RX3 Temperature T7 (°C)"
      },
      {
        "id": "RX3_T8",
        "name": "RX3 Temperature T8 (°C)"
      },
      {
        "id": "RX3_T9",
        "name": "RX3 Temperature T9 (°C)"
      },
      {
        "id": "RX3_T10",
        "name": "RX3 Temperature T10 (°C)"
      },
      {
        "id": "RX3_T11",
        "name": "RX3 Temperature T11 (°C)"
      },
      {
        "id": "RX3_T12",
        "name": "RX3 Temperature T12 (°C)"
      },
      {
        "id": "RX3_T13",
        "name": "RX3 Temperature T13 (°C)"
      },
      {
        "id": "RX3_T14",
        "name": "RX3 Temperature T14 (°C)"
      },
      {
        "id": "RX3_T15",
        "name": "RX3 Temperature T15 (°C)"
      },
      {
        "id": "RX3_T16",
        "name": "RX3 Temperature T16 (°C)"
      },
      {
        "id": "RX3_T17",
        "name": "RX3 Temperature T17 (°C)"
      },
      {
        "id": "RX3_T18",
        "name": "RX3 Temperature T18 (°C)"
      },
      {
        "id": "RX3_T19",
        "name": "RX3 Temperature T19 (°C)"
      },
      {
        "id": "RX3_T20",
        "name": "RX3 Temperature T20 (°C)"
      },
      {
        "id": "RX3_T21",
        "name": "RX3 Temperature T21 (°C)"
      },
      {
        "id": "RX3_T22",
        "name": "RX3 Temperature T22 (°C)"
      },
      {
        "id": "RX3_T23",
        "name": "RX3 Temperature T23 (°C)"
      },
      {
        "id": "RX3_T24",
        "name": "RX3 Temperature T24 (°C)"
      },
      {
        "id": "RX3_T25",
        "name": "RX3 Temperature T25 (°C)"
      },
      {
        "id": "RX3_T26",
        "name": "RX3 Temperature T26 (°C)"
      },
      {
        "id": "RX3_T27",
        "name": "RX3 Temperature T27 (°C)"
      },
      {
        "id": "RX3_T28",
        "name": "RX3 Temperature T28 (°C)"
      }
    ],
    "Production": [
      {
        "id": "",
        "name": "-- Select Production Column --"
      },
      {
        "id": "RX1_DAILY_PRODUCTION",
        "name": "RX1 DAILY PRODUCTION"
      },
      {
        "id": "RX2_DAILY_PRODUCTION",
        "name": "RX2 DAILY PRODUCTION"
      },
      {
        "id": "RX3_DAILY_PRODUCTION",
        "name": "RX3 DAILY PRODUCTION"
      },
      {
        "id": "SDR_DAILY_PRODUCTION",
        "name": "SDR DAILY PRODUCTION"
      },
      {
        "id": "Total_Production",
        "name": "Total Production"
      },
      {
        "id": "Daily_Production",
        "name": "Daily Production"
      },
      {
        "id": "Daily_Supply",
        "name": "Daily Supply"
      },
      {
        "id": "Daily_process_vent",
        "name": "Daily process vent"
      },
      {
        "id": "Daily_production_smp",
        "name": "Daily production smp"
      },
      {
        "id": "Yesterdays_production",
        "name": "Yesterdays production"
      },
      {
        "id": "WEEKLY_PRODUCTION",
        "name": "WEEKLY PRODUCTION"
      },
      {
        "id": "MONTHLY_PRODUCTION",
        "name": "MONTHLY PRODUCTION"
      },
      {
        "id": "YEARLY_PRODUCTION",
        "name": "YEARLY PRODUCTION"
      },
      {
        "id": "TOTAL_STORAGE",
        "name": "TOTAL STORAGE"
      },
      {
        "id": "RX1_DAILY_STORAGE",
        "name": "RX1 DAILY STORAGE"
      },
      {
        "id": "RX2_DAILY_STORAGE",
        "name": "RX2 DAILY STORAGE"
      },
      {
        "id": "RX3_DAILY_STORAGE",
        "name": "RX3 DAILY STORAGE"
      },
      {
        "id": "RX1_H2_CONC",
        "name": "RX1 H2 CONC"
      },
      {
        "id": "RX2_H2_CONC",
        "name": "RX2 H2 CONC"
      },
      {
        "id": "RX3_H2_CONC",
        "name": "RX3 H2 CONC"
      },
      {
        "id": "RX1_CO2_CONC",
        "name": "RX1 CO2 CONC"
      },
      {
        "id": "RX2_CO2_CONC",
        "name": "RX2 CO2 CONC"
      },
      {
        "id": "RX3_CO2_CONC",
        "name": "RX3 CO2 CONC"
      },
      {
        "id": "RX1_STATUS",
        "name": "RX1 STATUS"
      },
      {
        "id": "RX2_STATUS",
        "name": "RX2 STATUS"
      },
      {
        "id": "RX3_STATUS",
        "name": "RX3 STATUS"
      },
      {
        "id": "PURIFICATION_SALES",
        "name": "PURIFICATION SALES"
      }
    ]
  },
  "SDR": {
    "tableName": "SDR",
    "displayName": "SDR",
    "PT": [
      {
        "id": "",
        "name": "-- Select PT Column --"
      },
      {
        "id": "PT02",
        "name": "Pressure Transmitter PT02"
      },
      {
        "id": "PT03",
        "name": "Pressure Transmitter PT03"
      },
      {
        "id": "PT04",
        "name": "Pressure Transmitter PT04"
      },
      {
        "id": "PT05",
        "name": "Pressure Transmitter PT05"
      },
      {
        "id": "DIYFM_PT",
        "name": "DIYFM Pressure"
      },
      {
        "id": "DPT01",
        "name": "Differential Pressure DPT01"
      },
      {
        "id": "DPT02",
        "name": "Differential Pressure DPT02"
      },
      {
        "id": "TT01",
        "name": "Temperature Transmitter TT01"
      },
      {
        "id": "TT02",
        "name": "Temperature Transmitter TT02"
      }
    ],
    "EPU": [
      {
        "id": "",
        "name": "-- Select EPU Column --"
      },
      {
        "id": "RX_V1",
        "name": "Reactor Voltage V1 (V)"
      },
      {
        "id": "RX_V2",
        "name": "Reactor Voltage V2 (V)"
      },
      {
        "id": "RX_V3",
        "name": "Reactor Voltage V3 (V)"
      },
      {
        "id": "RX_V4",
        "name": "Reactor Voltage V4 (V)"
      },
      {
        "id": "RX_V5",
        "name": "Reactor Voltage V5 (V)"
      },
      {
        "id": "RX_V6",
        "name": "Reactor Voltage V6 (V)"
      },
      {
        "id": "RX_V7",
        "name": "Reactor Voltage V7 (V)"
      },
      {
        "id": "RX_V8",
        "name": "Reactor Voltage V8 (V)"
      },
      {
        "id": "RX_V9",
        "name": "Reactor Voltage V9 (V)"
      },
      {
        "id": "RX_V10",
        "name": "Reactor Voltage V10 (V)"
      },
      {
        "id": "RX_V11",
        "name": "Reactor Voltage V11 (V)"
      },
      {
        "id": "RX_V12",
        "name": "Reactor Voltage V12 (V)"
      },
      {
        "id": "RX_V13",
        "name": "Reactor Voltage V13 (V)"
      },
      {
        "id": "RX_V14",
        "name": "Reactor Voltage V14 (V)"
      },
      {
        "id": "RX_V15",
        "name": "Reactor Voltage V15 (V)"
      },
      {
        "id": "RX_V16",
        "name": "Reactor Voltage V16 (V)"
      },
      {
        "id": "RX_V17",
        "name": "Reactor Voltage V17 (V)"
      },
      {
        "id": "RX_V18",
        "name": "Reactor Voltage V18 (V)"
      },
      {
        "id": "RX_V19",
        "name": "Reactor Voltage V19 (V)"
      },
      {
        "id": "RX_V20",
        "name": "Reactor Voltage V20 (V)"
      },
      {
        "id": "RX_V21",
        "name": "Reactor Voltage V21 (V)"
      },
      {
        "id": "RX_V22",
        "name": "Reactor Voltage V22 (V)"
      },
      {
        "id": "RX_V23",
        "name": "Reactor Voltage V23 (V)"
      },
      {
        "id": "RX_V24",
        "name": "Reactor Voltage V24 (V)"
      },
      {
        "id": "RX_V25",
        "name": "Reactor Voltage V25 (V)"
      },
      {
        "id": "RX_V26",
        "name": "Reactor Voltage V26 (V)"
      },
      {
        "id": "RX_V28",
        "name": "Reactor Voltage V28 (V)"
      },
      {
        "id": "RX_C1",
        "name": "Reactor Current C1 (A)"
      },
      {
        "id": "RX_C2",
        "name": "Reactor Current C2 (A)"
      },
      {
        "id": "RX_C3",
        "name": "Reactor Current C3 (A)"
      },
      {
        "id": "RX_C4",
        "name": "Reactor Current C4 (A)"
      },
      {
        "id": "RX_C5",
        "name": "Reactor Current C5 (A)"
      },
      {
        "id": "RX_C6",
        "name": "Reactor Current C6 (A)"
      },
      {
        "id": "RX_C7",
        "name": "Reactor Current C7 (A)"
      },
      {
        "id": "RX_C8",
        "name": "Reactor Current C8 (A)"
      },
      {
        "id": "RX_C9",
        "name": "Reactor Current C9 (A)"
      },
      {
        "id": "RX_C10",
        "name": "Reactor Current C10 (A)"
      },
      {
        "id": "RX_C11",
        "name": "Reactor Current C11 (A)"
      },
      {
        "id": "RX_C12",
        "name": "Reactor Current C12 (A)"
      },
      {
        "id": "RX_C13",
        "name": "Reactor Current C13 (A)"
      },
      {
        "id": "RX_C14",
        "name": "Reactor Current C14 (A)"
      },
      {
        "id": "RX_C15",
        "name": "Reactor Current C15 (A)"
      },
      {
        "id": "RX_C16",
        "name": "Reactor Current C16 (A)"
      },
      {
        "id": "RX_C17",
        "name": "Reactor Current C17 (A)"
      },
      {
        "id": "RX_C18",
        "name": "Reactor Current C18 (A)"
      },
      {
        "id": "RX_C19",
        "name": "Reactor Current C19 (A)"
      },
      {
        "id": "RX_C20",
        "name": "Reactor Current C20 (A)"
      },
      {
        "id": "RX_C21",
        "name": "Reactor Current C21 (A)"
      },
      {
        "id": "RX_C22",
        "name": "Reactor Current C22 (A)"
      },
      {
        "id": "RX_C23",
        "name": "Reactor Current C23 (A)"
      },
      {
        "id": "RX_C24",
        "name": "Reactor Current C24 (A)"
      },
      {
        "id": "RX_C25",
        "name": "Reactor Current C25 (A)"
      },
      {
        "id": "RX_C26",
        "name": "Reactor Current C26 (A)"
      },
      {
        "id": "RX_C27",
        "name": "Reactor Current C27 (A)"
      },
      {
        "id": "RX_C28",
        "name": "Reactor Current C28 (A)"
      },
      {
        "id": "SDR_CUMULATIVE_CURRENT",
        "name": "SDR Cumulative Current (A)"
      },
      {
        "id": "RX_MAX_TEMP",
        "name": "Reactor Max Temperature (°C)"
      },
      {
        "id": "RX_T1",
        "name": "Reactor Temperature T1 (°C)"
      },
      {
        "id": "RX_T2",
        "name": "Reactor Temperature T2 (°C)"
      },
      {
        "id": "RX_T3",
        "name": "Reactor Temperature T3 (°C)"
      },
      {
        "id": "RX_T4",
        "name": "Reactor Temperature T4 (°C)"
      },
      {
        "id": "RX_T5",
        "name": "Reactor Temperature T5 (°C)"
      },
      {
        "id": "RX_T6",
        "name": "Reactor Temperature T6 (°C)"
      },
      {
        "id": "RX_T7",
        "name": "Reactor Temperature T7 (°C)"
      },
      {
        "id": "RX_T8",
        "name": "Reactor Temperature T8 (°C)"
      },
      {
        "id": "RX_T9",
        "name": "Reactor Temperature T9 (°C)"
      },
      {
        "id": "RX_T10",
        "name": "Reactor Temperature T10 (°C)"
      },
      {
        "id": "RX_T11",
        "name": "Reactor Temperature T11 (°C)"
      },
      {
        "id": "RX_T12",
        "name": "Reactor Temperature T12 (°C)"
      },
      {
        "id": "RX_T13",
        "name": "Reactor Temperature T13 (°C)"
      },
      {
        "id": "RX_T14",
        "name": "Reactor Temperature T14 (°C)"
      },
      {
        "id": "RX_T15",
        "name": "Reactor Temperature T15 (°C)"
      },
      {
        "id": "RX_T16",
        "name": "Reactor Temperature T16 (°C)"
      },
      {
        "id": "RX_T17",
        "name": "Reactor Temperature T17 (°C)"
      },
      {
        "id": "RX_T18",
        "name": "Reactor Temperature T18 (°C)"
      },
      {
        "id": "RX_T19",
        "name": "Reactor Temperature T19 (°C)"
      },
      {
        "id": "RX_T20",
        "name": "Reactor Temperature T20 (°C)"
      },
      {
        "id": "RX_T21",
        "name": "Reactor Temperature T21 (°C)"
      },
      {
        "id": "RX_T22",
        "name": "Reactor Temperature T22 (°C)"
      },
      {
        "id": "RX_T23",
        "name": "Reactor Temperature T23 (°C)"
      },
      {
        "id": "RX_T24",
        "name": "Reactor Temperature T24 (°C)"
      },
      {
        "id": "RX_T25",
        "name": "Reactor Temperature T25 (°C)"
      },
      {
        "id": "RX_T26",
        "name": "Reactor Temperature T26 (°C)"
      },
      {
        "id": "RX_T27",
        "name": "Reactor Temperature T27 (°C)"
      },
      {
        "id": "RX_T28",
        "name": "Reactor Temperature T28 (°C)"
      },
      {
        "id": "ACTIVE_POWER_SDR_PLC",
        "name": "Active Power — PLC (kW)"
      },
      {
        "id": "REACTIVE_POWER_SDR_PLC",
        "name": "Reactive Power — PLC (kVAR)"
      },
      {
        "id": "APPARENT_POWER_SDR_PLC",
        "name": "Apparent Power — PLC (kVA)"
      },
      {
        "id": "POWER_FACTOR_SDR_PLC",
        "name": "POWER FACTOR SDR PLC"
      },
      {
        "id": "FREQUENCY_SDR_PLC",
        "name": "Frequency — PLC (Hz)"
      },
      {
        "id": "TOTAL_ACTIVE_ENERGY_SDR_PLC",
        "name": "TOTAL ACTIVE ENERGY SDR PLC"
      },
      {
        "id": "IMPORT_ACTIVE_ENERGY_SDR_PLC",
        "name": "IMPORT ACTIVE ENERGY SDR PLC"
      },
      {
        "id": "EXPORT_ACTIVE_ENERGY_SDR_PLC",
        "name": "EXPORT ACTIVE ENERGY SDR PLC"
      },
      {
        "id": "TOTAL_REACTIVE_ENERGY_SDR_PLC",
        "name": "TOTAL REACTIVE ENERGY SDR PLC"
      },
      {
        "id": "IMPORT_REACTIVE_ENERGY_SDR_PLC",
        "name": "IMPORT REACTIVE ENERGY SDR PLC"
      },
      {
        "id": "EXPORT_REACTIVE_ENERGY_SDR_PLC",
        "name": "EXPORT REACTIVE ENERGY SDR PLC"
      },
      {
        "id": "APPARENT_ENERGY_SDR_PLC",
        "name": "APPARENT ENERGY SDR PLC"
      },
      {
        "id": "ACTIVE_POWER_SDR_EPU",
        "name": "Active Power — EPU (kW)"
      },
      {
        "id": "REACTIVE_POWER_SDR_EPU",
        "name": "Reactive Power — EPU (kVAR)"
      },
      {
        "id": "APPARENT_POWER_SDR_EPU",
        "name": "Apparent Power — EPU (kVA)"
      },
      {
        "id": "POWER_FACTOR_SDR_EPU",
        "name": "POWER FACTOR SDR EPU"
      },
      {
        "id": "FREQUENCY_SDR_EPU",
        "name": "Frequency — EPU (Hz)"
      },
      {
        "id": "TOTAL_ACTIVE_ENERGY_SDR_EPU",
        "name": "TOTAL ACTIVE ENERGY SDR EPU"
      },
      {
        "id": "IMPORT_ACTIVE_ENERGY_SDR_EPU",
        "name": "IMPORT ACTIVE ENERGY SDR EPU"
      },
      {
        "id": "EXPORT_ACTIVE_ENERGY_SDR_EPU",
        "name": "EXPORT ACTIVE ENERGY SDR EPU"
      },
      {
        "id": "TOTAL_REACTIVE_ENERGY_SDR_EPU",
        "name": "TOTAL REACTIVE ENERGY SDR EPU"
      },
      {
        "id": "IMPORT_REACTIVE_ENERGY_SDR_EPU",
        "name": "IMPORT REACTIVE ENERGY SDR EPU"
      },
      {
        "id": "EXPORT_REACTIVE_ENERGY_SDR_EPU",
        "name": "EXPORT REACTIVE ENERGY SDR EPU"
      },
      {
        "id": "APPARENT_ENERGY_SDR_EPU",
        "name": "APPARENT ENERGY SDR EPU"
      }
    ],
    "Production": [
      {
        "id": "",
        "name": "-- Select Production Column --"
      },
      {
        "id": "PRODUCTION_VOLUME",
        "name": "Production Volume"
      }
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
    { key: 'PT', label: 'PT (Pressure Transmitter)', icon: Activity, color: '#8b5cf6' },
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
