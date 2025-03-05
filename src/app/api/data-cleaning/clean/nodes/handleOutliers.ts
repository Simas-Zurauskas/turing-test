import { NodeFunction } from './types';

/**
 * Node function for handling outliers in the dataset
 *
 * Handles outliers based on the selected strategy:
 * - flag: Only detect outliers without changing values
 * - remove: Replace outliers with null
 * - cap: Cap outliers at a threshold (Winsorization)
 */
export const handleOutliers: NodeFunction = async (state) => {
  const { dataset, options, cleanedData, outliersDetected } = state;
  let updatedData = [...cleanedData];
  const updatedOutliersDetected = {
    count: outliersDetected.count,
    columns: new Map(outliersDetected.columns),
  };

  // Identify numeric columns
  const numericColumns = dataset.headers.filter((header) => {
    return dataset.data.some((row) => typeof row[header] === 'number');
  });

  for (const column of numericColumns) {
    // Calculate mean and standard deviation
    const values = updatedData.map((row) => row[column]).filter((value) => value !== null) as number[];

    if (values.length === 0) {
      continue;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const squaredDiffs = values.map((value) => Math.pow((value as number) - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Identify outliers (values more than 3 standard deviations from the mean)
    const outlierThreshold = 3 * stdDev;

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      const value = row[column] as number | null;

      if (value === null) continue;

      const deviation = Math.abs(value - mean);
      if (deviation > outlierThreshold) {
        updatedOutliersDetected.count++;
        updatedOutliersDetected.columns.set(column, (updatedOutliersDetected.columns.get(column) || 0) + 1);

        if (options.handleOutliers === 'remove') {
          updatedData[i] = { ...row, [column]: null };
        } else if (options.handleOutliers === 'cap') {
          // Winsorization: cap the value at the threshold
          updatedData[i] = {
            ...row,
            [column]: value > mean ? mean + outlierThreshold : mean - outlierThreshold,
          };
        }
      }
    }
  }

  return {
    cleanedData: updatedData,
    outliersDetected: updatedOutliersDetected,
  };
};
