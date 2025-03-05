import {
  DatasetType,
  CleaningProfile,
  CleaningResult,
  CleaningOptions,
  DatasetAnalysisResult,
} from '../types/dataCleaningTypes';

/**
 * API error response structure
 */
interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Clean the dataset according to the specified profile and options
 * @param dataset The dataset to clean
 * @param profile The cleaning profile to use
 * @param options The cleaning options to apply
 * @returns A promise that resolves to the cleaning result
 */
export const cleanDataset = async (
  dataset: DatasetType,
  profile: CleaningProfile,
  options: CleaningOptions,
): Promise<CleaningResult> => {
  try {
    const response = await fetch('/api/data-cleaning/clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset, profile, options }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.error || `Failed to clean dataset: ${response.status}`);
    }

    return (await response.json()) as CleaningResult;
  } catch (error) {
    console.error('Error cleaning dataset:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred while cleaning the dataset');
  }
};

/**
 * Analyze the dataset and recommend a cleaning profile
 * @param dataset The dataset to analyze
 * @returns A promise that resolves to the full dataset analysis result
 */
export const analyzeDataset = async (dataset: DatasetType): Promise<DatasetAnalysisResult> => {
  try {
    const response = await fetch('/api/data-cleaning/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.error || `Failed to analyze dataset: ${response.status}`);
    }

    return (await response.json()) as DatasetAnalysisResult;
  } catch (error) {
    console.error('Error analyzing dataset:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the dataset');
  }
};
