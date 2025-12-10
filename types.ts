export enum ToolType {
  JAVA = 'JAVA',
  PYTHON = 'PYTHON',
  GO = 'GO',
  NODE = 'NODE',
  UNKNOWN = 'UNKNOWN'
}

export enum Platform {
  MAC = 'MAC',
  WINDOWS = 'WINDOWS'
}

export type Language = 'en' | 'zh';

export interface EnvTool {
  id: string;
  name: string;
  type: ToolType;
  version: string;
  path: string;
  isSystemDefault: boolean;
  source: string; // e.g., 'Homebrew', 'PyEnv', 'System', 'Manual'
  detectedAt: string;
}

export interface PipPackage {
  name: string;
  version: string;
  isBuiltIn: boolean; // Detected by AI or list
}

export interface ScanResult {
  tools: EnvTool[];
  summary: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}