export type DataRow = Record<string, string | number | boolean | null>;

export interface DatasetType {
  filename: string;
  fileType: 'csv' | 'excel';
  headers: string[];
  data: DataRow[];
  size: number; // in bytes
}

export interface CleaningProfile {
  id: string;
  name: string;
  description: string;
  domain: 'finance' | 'healthcare' | 'marketing' | 'general' | 'hr';
  rules: CleaningRule[];
}

export interface CleaningRule {
  type: 'missing' | 'outlier' | 'duplicate' | 'format' | 'custom';
  action: string;
  priority: 'high' | 'medium' | 'low';
  columns?: string[]; // If undefined, applies to all columns
  parameters?: Record<string, any>;
}

export interface CleaningSummary {
  rowsProcessed: number;
  missingValuesFixed: number;
  outliersDetected: number;
  duplicatesRemoved: number;
  columnsStandardized: number;
}

export interface CleaningIssue {
  type: 'missing' | 'outlier' | 'duplicate' | 'format' | 'custom';
  column: string;
  count: number;
  action: string;
}

export interface CleaningResult {
  cleanedData: DataRow[];
  summary: CleaningSummary;
  issues: CleaningIssue[];
}

export interface CleaningOptions {
  handleMissingValues: 'impute' | 'drop' | 'replace';
  handleOutliers: 'remove' | 'flag' | 'cap';
  removeDuplicates: boolean;
  standardizeColumns: boolean;
  replacementValue?: string; // Value to use when handleMissingValues is 'replace'
}

export interface DatasetAnalysisResult {
  recommendedDomain: 'general' | 'finance' | 'healthcare' | 'marketing' | 'hr';
  confidence: number;
  reasoning: string;
  suggestedCleaningActions: string[];
  dataQualityAssessment: {
    completenessScore: number;
    accuracyScore: number;
    consistencyScore: number;
    overallQualityScore: number;
  };
  potentialUseCase: string;
  riskFactors: string[];
  analysisMetrics?: {
    missingValueRatio: number;
    duplicateRowsEstimate: number;
    anomalyScore: number;
    formatConsistencyScore: number;
  };
  traceId?: string;
}
