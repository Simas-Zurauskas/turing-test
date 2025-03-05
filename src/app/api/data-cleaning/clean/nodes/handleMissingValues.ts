import { NodeFunction } from './types';

/**
 * Node function for handling missing values in the dataset
 *
 * Handles missing values based on the selected strategy:
 * - drop: Remove rows with missing values
 * - impute: Replace missing values with calculated values (mean/mode)
 * - replace: Replace missing values with a custom value
 */

export const handleMissingValues: NodeFunction = async (state) => {
  const { dataset, options, cleanedData, missingValuesFixed } = state;
  let updatedData = [...cleanedData];
  const updatedMissingValues = {
    count: missingValuesFixed.count,
    columns: new Map(missingValuesFixed.columns),
  };

  if (options.handleMissingValues === 'drop') {
    const originalLength = updatedData.length;
    updatedData = updatedData.filter((row) => {
      return !Object.values(row).some((value) => value === null);
    });
    updatedMissingValues.count = originalLength - updatedData.length;
  } else if (options.handleMissingValues === 'impute') {
    // For each column with numeric values, calculate the mean
    // For each column with string values, use the mode
    const numericMeans = new Map<string, number>();
    const stringModes = new Map<string, string>();

    // Calculate means and modes
    dataset.headers.forEach((header) => {
      const values = dataset.data.map((row) => row[header]);
      const nonNullValues = values.filter((v) => v !== null) as (string | number | boolean)[];

      if (nonNullValues.length === 0) return;

      if (typeof nonNullValues[0] === 'number') {
        const sum = (nonNullValues as number[]).reduce((a, b) => a + b, 0);
        numericMeans.set(header, sum / nonNullValues.length);
      } else if (typeof nonNullValues[0] === 'string') {
        // Calculate mode (most frequent value)
        const counts = new Map<string, number>();
        (nonNullValues as string[]).forEach((val) => {
          counts.set(val, (counts.get(val) || 0) + 1);
        });

        let mode = nonNullValues[0] as string;
        let maxCount = 0;

        counts.forEach((count, value) => {
          if (count > maxCount) {
            maxCount = count;
            mode = value;
          }
        });

        stringModes.set(header, mode);
      }
    });

    // Apply imputation
    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      const newRow = { ...row };

      dataset.headers.forEach((header) => {
        if (newRow[header] === null) {
          if (numericMeans.has(header)) {
            const mean = numericMeans.get(header);
            if (mean !== undefined) {
              newRow[header] = mean;
              updatedMissingValues.count++;
              updatedMissingValues.columns.set(header, (updatedMissingValues.columns.get(header) || 0) + 1);
            }
          } else if (stringModes.has(header)) {
            const mode = stringModes.get(header);
            if (mode !== undefined) {
              newRow[header] = mode;
              updatedMissingValues.count++;
              updatedMissingValues.columns.set(header, (updatedMissingValues.columns.get(header) || 0) + 1);
            }
          }
        }
      });

      updatedData[i] = newRow;
    }
  } else if (options.handleMissingValues === 'replace') {
    // Replace missing values with custom value
    const replacementValue = options.replacementValue || 'N/A';

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      const newRow = { ...row };

      dataset.headers.forEach((header) => {
        if (newRow[header] === null) {
          newRow[header] = replacementValue;
          updatedMissingValues.count++;
          updatedMissingValues.columns.set(header, (updatedMissingValues.columns.get(header) || 0) + 1);
        }
      });

      updatedData[i] = newRow;
    }
  }

  return {
    cleanedData: updatedData,
    missingValuesFixed: updatedMissingValues,
  };
};
