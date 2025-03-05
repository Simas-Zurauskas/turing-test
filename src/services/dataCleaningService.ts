import {
  DatasetType,
  CleaningProfile,
  CleaningResult,
  CleaningOptions,
  DatasetAnalysisResult,
} from '../types/dataCleaningTypes';

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
    // Simple fetch request to the API
    const response = await fetch('/api/data-cleaning/clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset, profile, options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clean dataset');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cleaning dataset:', error);
    throw error;
  }
};

/**
 * Analyze the dataset and recommend a cleaning profile
 * @param dataset The dataset to analyze
 * @returns A promise that resolves to the full dataset analysis result
 */
export const analyzeDataset = async (dataset: DatasetType): Promise<DatasetAnalysisResult> => {
  try {
    // Call the API endpoint
    const response = await fetch('/api/data-cleaning/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze dataset');
    }

    // Return the full result object instead of just the recommendedDomain
    return await response.json();
  } catch (error) {
    console.error('Error analyzing dataset:', error);
    throw error;
  }
};
