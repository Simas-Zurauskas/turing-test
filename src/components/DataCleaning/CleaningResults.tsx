import React from 'react';
import styled from '@emotion/styled';
import { DatasetType, CleaningResult, DataRow } from '../../types/dataCleaningTypes';

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DownloadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${(props) => (props.primary ? '#28a745' : '#007bff')};
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) => (props.primary ? '#218838' : '#0069d9')};
  }
`;

const ComparisionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
`;

interface CleaningResultsProps {
  result: CleaningResult;
  originalDataset: DatasetType;
}

export const CleaningResults: React.FC<CleaningResultsProps> = ({ result, originalDataset }) => {
  // Generate CSV content from dataset
  const generateCSV = (data: DataRow[], headers: string[]): string => {
    // Header row
    let csvContent = headers.join(',') + '\n';

    // Data rows
    data.forEach((row) => {
      const rowValues = headers.map((header) => {
        const value = row[header];
        if (value === null) return '';
        // Wrap strings with commas in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      });
      csvContent += rowValues.join(',') + '\n';
    });

    return csvContent;
  };

  const handleDownload = (format: 'csv' | 'json') => {
    let content = '';
    let fileName = originalDataset.filename.replace(/\.[^/.]+$/, '');
    let mimeType = '';

    if (format === 'csv') {
      content = generateCSV(result.cleanedData, originalDataset.headers);
      fileName += '_cleaned.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(result.cleanedData, null, 2);
      fileName += '_cleaned.json';
      mimeType = 'application/json';
    }

    // Create a blob and download it
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate statistics for comparison
  const getComparisonStats = () => {
    const beforeRows = originalDataset.data.length;
    const afterRows = result.cleanedData.length;
    const rowsRemoved = beforeRows - afterRows;

    // Count missing values in original dataset
    const beforeMissingValues = originalDataset.data.reduce((count, row) => {
      return count + Object.values(row).filter((value) => value === null).length;
    }, 0);

    // Count missing values in cleaned dataset
    const afterMissingValues = result.cleanedData.reduce((count, row) => {
      return count + Object.values(row).filter((value) => value === null).length;
    }, 0);

    return {
      beforeRows,
      afterRows,
      rowsRemoved,
      beforeMissingValues,
      afterMissingValues,
      missingValuesFixed: beforeMissingValues - afterMissingValues,
    };
  };

  const stats = getComparisonStats();

  return (
    <ResultsContainer>
      <p>Your data has been cleaned successfully! Download the cleaned dataset to use in your analysis.</p>

      <DownloadSection>
        <Button primary onClick={() => handleDownload('csv')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-4-4h2.5V4h3v4H12L8 12z" />
            <path d="M14 13v1H2v-1h12z" />
          </svg>
          Download CSV
        </Button>

        <Button onClick={() => handleDownload('json')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-4-4h2.5V4h3v4H12L8 12z" />
            <path d="M14 13v1H2v-1h12z" />
          </svg>
          Download JSON
        </Button>
      </DownloadSection>

      <div>
        <h4>Before vs After Comparison</h4>
        <ComparisionTable>
          <thead>
            <tr>
              <TableHeader>Metric</TableHeader>
              <TableHeader>Before Cleaning</TableHeader>
              <TableHeader>After Cleaning</TableHeader>
              <TableHeader>Difference</TableHeader>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TableCell>Rows</TableCell>
              <TableCell>{stats.beforeRows}</TableCell>
              <TableCell>{stats.afterRows}</TableCell>
              <TableCell>{stats.rowsRemoved > 0 ? `-${stats.rowsRemoved}` : '0'}</TableCell>
            </tr>
            <tr>
              <TableCell>Missing Values</TableCell>
              <TableCell>{stats.beforeMissingValues}</TableCell>
              <TableCell>{stats.afterMissingValues}</TableCell>
              <TableCell>{stats.missingValuesFixed > 0 ? `-${stats.missingValuesFixed}` : '0'}</TableCell>
            </tr>
            <tr>
              <TableCell>Outliers</TableCell>
              <TableCell>{result.summary.outliersDetected}</TableCell>
              <TableCell>0</TableCell>
              <TableCell>{result.summary.outliersDetected > 0 ? `-${result.summary.outliersDetected}` : '0'}</TableCell>
            </tr>
            <tr>
              <TableCell>Duplicates</TableCell>
              <TableCell>{result.summary.duplicatesRemoved}</TableCell>
              <TableCell>0</TableCell>
              <TableCell>
                {result.summary.duplicatesRemoved > 0 ? `-${result.summary.duplicatesRemoved}` : '0'}
              </TableCell>
            </tr>
          </tbody>
        </ComparisionTable>
      </div>
    </ResultsContainer>
  );
};
