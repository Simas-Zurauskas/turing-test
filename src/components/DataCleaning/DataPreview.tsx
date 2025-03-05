import React, { useState } from 'react';
import styled from '@emotion/styled';
import { DatasetType, DataRow, CleaningResult } from '../../types/dataCleaningTypes';

const TableContainer = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 1;
`;

const TableHeaderCell = styled.th`
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid #dee2e6;
  text-align: left;
  font-weight: 600;
`;

const TableRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 0.4rem 0.75rem;
  border-top: 1px solid #dee2e6;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChangedCell = styled(TableCell)`
  background-color: rgba(255, 243, 205, 0.7); /* Light yellow background */
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid #ffc107; /* Yellow border */
    box-sizing: border-box;
    pointer-events: none;
  }
`;

const NullValue = styled.span`
  color: #dc3545;
  font-style: italic;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const PaginationButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }
`;

const DataStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
`;

const LegendSample = styled.div`
  width: 1rem;
  height: 1rem;
  background-color: rgba(255, 243, 205, 0.7);
  border: 2px solid #ffc107;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.active ? '#007bff' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#495057')};
  border: none;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  border-radius: 4px 4px 0 0;

  &:hover {
    background-color: ${(props) => (props.active ? '#007bff' : '#e9ecef')};
  }
`;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const calculateMissingValues = (data: DataRow[]): number => {
  let count = 0;
  data.forEach((row) => {
    Object.values(row).forEach((value) => {
      if (value === null) count++;
    });
  });
  return count;
};

interface DataPreviewProps {
  dataset: DatasetType;
  cleaningResult?: CleaningResult;
}

interface DataTabsProps {
  activeTab: 'original' | 'cleaned';
  onTabChange: (tab: 'original' | 'cleaned') => void;
}

interface DataStatsBarProps {
  dataset: DatasetType;
  currentData: DataRow[];
  cleaningResult?: CleaningResult;
  activeTab: 'original' | 'cleaned';
}

interface DataTableProps {
  headers: string[];
  data: DataRow[];
  startIndex: number;
  originalData?: DataRow[];
  isCleanedData?: boolean;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalRows: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const DataTabs: React.FC<DataTabsProps> = ({ activeTab, onTabChange }) => (
  <TabContainer>
    <Tab active={activeTab === 'original'} onClick={() => onTabChange('original')}>
      Original Data
    </Tab>
    <Tab active={activeTab === 'cleaned'} onClick={() => onTabChange('cleaned')}>
      Cleaned Data
    </Tab>
  </TabContainer>
);

const DataStatsBar: React.FC<DataStatsBarProps> = ({ dataset, currentData, cleaningResult, activeTab }) => (
  <DataStats>
    <StatItem>Rows: {currentData.length}</StatItem>
    <StatItem>Columns: {dataset.headers.length}</StatItem>
    <StatItem>File size: {formatFileSize(dataset.size)}</StatItem>
    <StatItem>Missing values: {calculateMissingValues(currentData)}</StatItem>

    {cleaningResult && activeTab === 'cleaned' && (
      <>
        <StatItem>Rows removed: {dataset.data.length - cleaningResult.cleanedData.length}</StatItem>
        <StatItem>Missing values fixed: {cleaningResult.summary.missingValuesFixed}</StatItem>
        <StatItem>Outliers handled: {cleaningResult.summary.outliersDetected}</StatItem>
      </>
    )}
  </DataStats>
);

// Helper function to check if a cell value has changed
const hasCellChanged = (originalData: DataRow[], cleanedData: DataRow[], rowIndex: number, header: string): boolean => {
  // If we don't have original data, assume no change
  if (!originalData || !cleanedData) return false;

  // Find the corresponding row in the original data
  // We use data matching rather than index matching since rows might have been removed
  const cleanedRow = cleanedData[rowIndex];

  // Create a matching function that checks if enough key values match to consider it the same row
  const isMatchingRow = (origRow: DataRow): boolean => {
    // Check if enough fields match to consider it the same row
    // This is a heuristic - we consider it the same row if a majority of non-null values match
    let matchCount = 0;
    let totalNonNullFields = 0;

    for (const key of Object.keys(cleanedRow)) {
      if (cleanedRow[key] !== null && origRow[key] !== null) {
        totalNonNullFields++;
        if (cleanedRow[key] === origRow[key]) {
          matchCount++;
        }
      }
    }

    // If more than 70% of non-null values match, consider it the same row
    return totalNonNullFields > 0 && matchCount / totalNonNullFields > 0.7;
  };

  // Try to find the matching original row
  const originalRow = originalData.find(isMatchingRow);

  // If no matching row found, it's a new row (not a changed cell)
  if (!originalRow) return false;

  // Check if the value for this specific header/column has changed
  return originalRow[header] !== cleanedRow[header];
};

const DataTable: React.FC<DataTableProps> = ({ headers, data, startIndex, originalData, isCleanedData }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>#</TableHeaderCell>
          {headers.map((header) => (
            <TableHeaderCell key={header}>{header}</TableHeaderCell>
          ))}
        </tr>
      </TableHead>
      <tbody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>{startIndex + rowIndex + 1}</TableCell>
            {headers.map((header) => {
              // Check if this cell has changed from the original (only for cleaned data view)
              const hasChanged = isCleanedData && originalData && hasCellChanged(originalData, data, rowIndex, header);

              // Use the appropriate cell component based on whether it changed
              const CellComponent = hasChanged ? ChangedCell : TableCell;

              return (
                <CellComponent key={header}>
                  {row[header] === null ? <NullValue>NULL</NullValue> : String(row[header])}
                </CellComponent>
              );
            })}
          </TableRow>
        ))}
      </tbody>
    </Table>
  </TableContainer>
);

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalRows,
  onNextPage,
  onPrevPage,
}) => (
  <Pagination>
    <PaginationButton onClick={onPrevPage} disabled={currentPage === 1}>
      Previous
    </PaginationButton>
    <span>
      Page {currentPage} of {totalPages} (Showing rows {startIndex + 1}-{endIndex} of {totalRows})
    </span>
    <PaginationButton onClick={onNextPage} disabled={currentPage === totalPages}>
      Next
    </PaginationButton>
  </Pagination>
);

export const DataPreview: React.FC<DataPreviewProps> = ({ dataset, cleaningResult }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'original' | 'cleaned'>('original');
  const rowsPerPage = 30;

  const currentData = activeTab === 'original' || !cleaningResult ? dataset.data : cleaningResult.cleanedData;
  const totalPages = Math.ceil(currentData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleData = currentData.slice(startIndex, startIndex + rowsPerPage);
  const endIndex = Math.min(startIndex + rowsPerPage, currentData.length);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      {cleaningResult && <DataTabs activeTab={activeTab} onTabChange={setActiveTab} />}

      <DataStatsBar dataset={dataset} currentData={currentData} cleaningResult={cleaningResult} activeTab={activeTab} />

      {activeTab === 'cleaned' && cleaningResult && (
        <Legend>
          <LegendSample />
          <span>Highlighted cells indicate values that were changed during cleaning</span>
        </Legend>
      )}

      <DataTable
        headers={dataset.headers}
        data={visibleData}
        startIndex={startIndex}
        originalData={activeTab === 'cleaned' ? dataset.data : undefined}
        isCleanedData={activeTab === 'cleaned'}
      />

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRows={currentData.length}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      )}
    </div>
  );
};
