import { RunnableConfig } from '@langchain/core/runnables';
import {
  DatasetType,
  DataRow,
  CleaningProfile,
  CleaningOptions,
  CleaningResult,
  CleaningIssue,
} from '../../../../../types/dataCleaningTypes';
import { Annotation } from '@langchain/langgraph';

export type { DatasetType, DataRow, CleaningProfile, CleaningOptions, CleaningResult, CleaningIssue };

// Define the CleaningStateAnnotation
export const CleaningStateAnnotation = Annotation.Root({
  dataset: Annotation<DatasetType>({
    reducer: (current, incoming) => incoming,
    default: () => ({ headers: [], data: [], filename: '', fileType: 'csv', size: 0 }),
  }),
  profile: Annotation<CleaningProfile>({
    reducer: (current, incoming) => incoming,
    default: () => ({ domain: 'general', name: '', description: '', id: '', rules: [] }),
  }),
  options: Annotation<CleaningOptions>({
    reducer: (current, incoming) => incoming,
    default: () => ({
      handleMissingValues: 'drop',
      handleOutliers: 'flag',
      removeDuplicates: true,
      standardizeColumns: true,
      useLLM: false,
      llmContextualCleaning: false,
      llmDetectAnomalies: false,
      llmTemperature: 0.2,
    }),
  }),
  cleanedData: Annotation<DataRow[]>({
    reducer: (current, incoming) => incoming,
    default: () => [],
  }),
  missingValuesFixed: Annotation<{
    count: number;
    columns: Map<string, number>;
  }>({
    reducer: (current, incoming) => incoming,
    default: () => ({ count: 0, columns: new Map<string, number>() }),
  }),
  outliersDetected: Annotation<{
    count: number;
    columns: Map<string, number>;
  }>({
    reducer: (current, incoming) => incoming,
    default: () => ({ count: 0, columns: new Map<string, number>() }),
  }),
  duplicatesRemoved: Annotation<{ count: number }>({
    reducer: (current, incoming) => incoming,
    default: () => ({ count: 0 }),
  }),
  llmCleaningStats: Annotation<{
    fieldsProcessed: number;
    contextualIssuesFixed: number;
    insights: string[];
    contextualIssues: Map<string, { count: number; examples: string[] }>;
  }>({
    reducer: (current, incoming) => incoming,
    default: () => ({
      fieldsProcessed: 0,
      contextualIssuesFixed: 0,
      insights: [],
      contextualIssues: new Map<string, { count: number; examples: string[] }>(),
    }),
  }),
  columnsStandardized: Annotation<number>({
    reducer: (current, incoming) => incoming,
    default: () => 0,
  }),
  issues: Annotation<CleaningIssue[]>({
    reducer: (current, incoming) => incoming,
    default: () => [],
  }),
  result: Annotation<CleaningResult | undefined>({
    reducer: (current, incoming) => incoming,
    default: () => undefined,
  }),
});

export type State = typeof CleaningStateAnnotation.State;

export type NodeFunction = (state: State, _config: RunnableConfig) => Promise<typeof CleaningStateAnnotation.Update>;
