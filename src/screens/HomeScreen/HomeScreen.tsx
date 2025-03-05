'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  FileUploader,
  DataPreview,
  CleaningProfileSelector,
  CleaningOptions,
  CleaningResults,
  DataSummary,
} from '../../components/DataCleaning';
import {
  DatasetType,
  CleaningProfile,
  CleaningResult,
  CleaningOptions as CleaningOptionsType,
} from '../../types/dataCleaningTypes';
import { cleanDataset } from '../../services/dataCleaningService';

const Container = styled.div`
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
  /* background-color: #f0f4f9a1; */
  min-height: 100vh;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.1);
  border: 1px solid #d6d6d6;
`;

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadSummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${(props) => (props.primary ? '#007bff' : '#6c757d')};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: 1rem;

  &:hover {
    background-color: ${(props) => (props.primary ? '#0069d9' : '#5a6268')};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CleaningProfile | null>(null);
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptionsType>({
    handleMissingValues: 'impute',
    handleOutliers: 'flag',
    removeDuplicates: true,
    standardizeColumns: true,
    replacementValue: 'N/A',
  });
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (newDataset: DatasetType) => {
    setDataset(newDataset);
    setActiveStep(2);
    setCleaningResult(null);
  };

  const handleProfileSelection = (profile: CleaningProfile) => {
    setSelectedProfile(profile);
    setActiveStep(3);
  };

  const handleCleaningOptionsChange = (options: Partial<CleaningOptionsType>) => {
    setCleaningOptions({ ...cleaningOptions, ...options });
  };

  const handleReplacementValueChange = (value: string) => {
    setCleaningOptions({ ...cleaningOptions, replacementValue: value });
  };

  const startCleaning = async () => {
    if (!dataset || !selectedProfile) return;

    setIsProcessing(true);
    setError(null);
    setCleaningResult(null);

    try {
      // Simple call without progress tracking
      const result = await cleanDataset(dataset, selectedProfile, cleaningOptions);
      setCleaningResult(result);
      setActiveStep(4);
    } catch (err) {
      console.error('Error cleaning data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during data cleaning');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setDataset(null);
    setSelectedProfile(null);
    setCleaningResult(null);
    setActiveStep(1);
    setError(null);
  };

  return (
    <Container>
      <Header>
        <Title>Intelligent Data Cleaning Agent</Title>
        <Description>
          Upload your dataset, select a cleaning profile, and get a clean dataset ready for analysis
        </Description>
      </Header>

      {/* Full width upload and summary section */}
      <FullWidthCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <CardTitle>Upload Dataset & Results</CardTitle>
          {activeStep > 1 && dataset && (
            <span style={{ color: 'green', fontSize: '0.9rem' }}>
              ✓ {dataset.filename} ({dataset.data.length} rows)
            </span>
          )}
        </div>

        <UploadSummaryContainer>
          <div>
            {activeStep === 1 ? (
              <FileUploader onFileUploaded={handleFileUpload} />
            ) : (
              <div>
                <button
                  onClick={resetProcess}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Upload different file
                </button>
                {cleaningResult && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Download Options</h3>
                    <CleaningResults result={cleaningResult} originalDataset={dataset!} />
                  </div>
                )}
              </div>
            )}

            {/* Start/Re-run Cleaning Button */}
            {activeStep >= 3 && selectedProfile && (
              <Button
                primary
                onClick={startCleaning}
                disabled={isProcessing}
                style={{ marginTop: '2rem', width: '100%' }}
              >
                {isProcessing ? (
                  <SpinnerContainer>
                    <Spinner />
                    <span>Processing...</span>
                  </SpinnerContainer>
                ) : cleaningResult ? (
                  'Re-run Cleaning'
                ) : (
                  'Start Cleaning'
                )}
              </Button>
            )}
          </div>

          {cleaningResult && (
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Cleaning Summary</h3>
              <DataSummary summary={cleaningResult.summary} issues={cleaningResult.issues} />
            </div>
          )}
        </UploadSummaryContainer>
      </FullWidthCard>

      <Grid>
        {dataset && (
          <Card>
            <CardTitle>
              <span>1. Select Cleaning Profile</span>
              {selectedProfile && <span style={{ color: 'green', fontSize: '0.8rem' }}>✓ {selectedProfile.name}</span>}
            </CardTitle>
            <CleaningProfileSelector
              dataset={dataset}
              onProfileSelected={handleProfileSelection}
              selectedProfile={selectedProfile}
              disabled={activeStep < 2 || isProcessing}
            />
          </Card>
        )}

        {dataset && selectedProfile && (
          <Card>
            <CardTitle>
              <span>2. Configure Cleaning Options</span>
            </CardTitle>
            <CleaningOptions
              options={cleaningOptions}
              onChange={handleCleaningOptionsChange}
              isProcessing={isProcessing}
              disabled={activeStep < 3}
              replacementValue={cleaningOptions.replacementValue || 'N/A'}
              setReplacementValue={handleReplacementValueChange}
            />
          </Card>
        )}
      </Grid>

      {dataset && (
        <FullWidthCard>
          <CardTitle>Data Preview</CardTitle>
          <DataPreview dataset={dataset} cleaningResult={cleaningResult || undefined} />
        </FullWidthCard>
      )}

      {/* Show error message */}
      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </Container>
  );
};

export default HomeScreen;
