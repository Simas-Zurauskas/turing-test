import React from 'react';
import styled from '@emotion/styled';
import { CleaningSummary, CleaningIssue } from '../../types/dataCleaningTypes';

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummaryCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SummaryTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const StatItem = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #007bff;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const IssuesList = styled.div`
  margin-top: 1rem;
`;

const IssueItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const IssueType = styled.span<{ type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.type) {
      case 'missing':
        return '#ffeeba';
      case 'outlier':
        return '#c3e6cb';
      case 'duplicate':
        return '#b8daff';
      case 'format':
        return '#d6d8db';
      default:
        return '#f5c6cb';
    }
  }};
  color: ${(props) => {
    switch (props.type) {
      case 'missing':
        return '#856404';
      case 'outlier':
        return '#155724';
      case 'duplicate':
        return '#004085';
      case 'format':
        return '#383d41';
      default:
        return '#721c24';
    }
  }};
`;

const IssueColumn = styled.span`
  font-weight: 500;
`;

const IssueCount = styled.span`
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const IssueAction = styled.span`
  font-style: italic;
  color: #6c757d;
  font-size: 0.875rem;
`;

interface DataSummaryProps {
  summary: CleaningSummary;
  issues: CleaningIssue[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ summary, issues }) => {
  return (
    <SummaryContainer>
      <SummaryCard>
        <SummaryTitle>
          <span>Cleaning Summary</span>
          <span style={{ color: 'green', fontSize: '0.8rem' }}>✓ Complete</span>
        </SummaryTitle>

        <StatGrid>
          <StatItem>
            <StatValue>{summary.rowsProcessed}</StatValue>
            <StatLabel>Rows Processed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{summary.missingValuesFixed}</StatValue>
            <StatLabel>Missing Values Fixed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{summary.outliersDetected}</StatValue>
            <StatLabel>Outliers Detected</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{summary.duplicatesRemoved}</StatValue>
            <StatLabel>Duplicates Removed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{summary.columnsStandardized}</StatValue>
            <StatLabel>Columns Standardized</StatLabel>
          </StatItem>
        </StatGrid>
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Issues Addressed</SummaryTitle>

        {issues.length > 0 ? (
          <IssuesList>
            {issues.map((issue, index) => (
              <IssueItem key={index}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IssueType type={issue.type}>{issue.type}</IssueType>
                  <IssueColumn>{issue.column}</IssueColumn>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <IssueCount>{issue.count} affected</IssueCount>
                  <IssueAction>{issue.action}</IssueAction>
                </div>
              </IssueItem>
            ))}
          </IssuesList>
        ) : (
          <p>No issues were found in the dataset.</p>
        )}
      </SummaryCard>
    </SummaryContainer>
  );
};
