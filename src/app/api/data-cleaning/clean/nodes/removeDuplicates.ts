import { NodeFunction, DataRow } from './types';

/**
 * Node function for removing duplicate rows from the dataset
 *
 * Removes exact duplicates of rows based on string comparison of serialized rows
 */
export const removeDuplicates: NodeFunction = async (state) => {
  const { options, cleanedData, duplicatesRemoved } = state;
  let updatedData = [...cleanedData];
  const updatedDuplicatesRemoved = { count: duplicatesRemoved.count };

  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const originalLength = updatedData.length;
    const newCleanedData: DataRow[] = [];

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      // Create a string representation of the row for comparison
      const rowStr = JSON.stringify(row);

      if (!seen.has(rowStr)) {
        seen.add(rowStr);
        newCleanedData.push(row);
      }
    }

    updatedDuplicatesRemoved.count = originalLength - newCleanedData.length;
    updatedData = newCleanedData;
  }

  return {
    cleanedData: updatedData,
    duplicatesRemoved: updatedDuplicatesRemoved,
  };
};
