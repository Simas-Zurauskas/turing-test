import { NodeFunction, CleaningIssue } from './types';

/**
 * Node function for generating a report of cleaning issues
 *
 * Collects information about all issues detected and fixed during the cleaning process
 */
export const generateIssuesReport: NodeFunction = async (state) => {
  const { options, missingValuesFixed, outliersDetected, duplicatesRemoved, llmCleaningStats } = state;

  const newIssues: CleaningIssue[] = [];

  // Convert Map to array for JSON serialization
  const missingValueColumns: { column: string; count: number }[] = [];
  missingValuesFixed.columns.forEach((count, column) => {
    missingValueColumns.push({ column, count });
  });

  const outlierColumns: { column: string; count: number }[] = [];
  outliersDetected.columns.forEach((count, column) => {
    outlierColumns.push({ column, count });
  });

  // Add missing value issues
  missingValueColumns.forEach(({ column, count }) => {
    newIssues.push({
      type: 'missing',
      column,
      count,
      action: `${
        options.handleMissingValues === 'impute'
          ? 'imputed with mean/mode'
          : options.handleMissingValues === 'drop'
          ? 'rows dropped'
          : 'replaced with custom value'
      }`,
    });
  });

  // Add outlier issues
  outlierColumns.forEach(({ column, count }) => {
    newIssues.push({
      type: 'outlier',
      column,
      count,
      action: `${
        options.handleOutliers === 'flag' ? 'flagged' : options.handleOutliers === 'remove' ? 'removed' : 'capped'
      }`,
    });
  });

  // Add duplicate issue if any were removed
  if (duplicatesRemoved.count > 0) {
    newIssues.push({
      type: 'duplicate',
      column: 'multiple',
      count: duplicatesRemoved.count,
      action: 'removed',
    });
  }

  // Add contextual issues from LLM cleaning
  llmCleaningStats.contextualIssues.forEach(({ count, examples }, column) => {
    newIssues.push({
      type: 'contextual',
      column,
      count,
      action: 'fixed with LLM',
      examples: examples,
    });
  });

  return { issues: newIssues };
};
