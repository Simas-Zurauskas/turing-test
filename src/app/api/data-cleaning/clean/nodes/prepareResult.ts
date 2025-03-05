import { NodeFunction, CleaningResult } from './types';

/**
 * Node function for preparing the final cleaning result
 *
 * This is a terminal node that doesn't modify state but returns the final CleaningResult
 */
export const prepareResult: NodeFunction = async (state) => {
  const {
    dataset,
    cleanedData,
    missingValuesFixed,
    outliersDetected,
    duplicatesRemoved,
    columnsStandardized,
    llmCleaningStats,
    issues,
  } = state;

  // This is a terminal node that doesn't modify state but returns the final CleaningResult
  const finalResult: CleaningResult = {
    cleanedData,
    summary: {
      rowsProcessed: dataset.data.length,
      missingValuesFixed: missingValuesFixed.count,
      outliersDetected: outliersDetected.count,
      duplicatesRemoved: duplicatesRemoved.count,
      columnsStandardized,
      llmCleaningApplied: llmCleaningStats.fieldsProcessed,
      contextualIssuesFixed: llmCleaningStats.contextualIssuesFixed,
    },
    issues,
    llmInsights: llmCleaningStats.insights,
  };

  return { result: finalResult };
};
