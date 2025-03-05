import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { DatasetType, CleaningProfile, DatasetAnalysisResult } from '../../types/dataCleaningTypes';
import { analyzeDataset } from '../../services/dataCleaningService';
import { Tooltip } from './Tooltip';

const ProfilesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProfileCard = styled.div<{ selected: boolean; disabled: boolean }>`
  border: 1px solid ${(props) => (props.selected ? '#007bff' : '#dee2e6')};
  border-radius: 8px;
  padding: 1rem;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background-color: ${(props) => (props.selected ? 'rgba(0, 123, 255, 0.1)' : 'white')};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  position: relative;

  &:hover {
    border-color: ${(props) => (props.disabled ? '#dee2e6' : '#007bff')};
    box-shadow: ${(props) => (props.disabled ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)')};
  }
`;

const ProfileName = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ProfileDescription = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const ProfileDomain = styled.span`
  font-size: 0.75rem;
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #495057;
`;

const SelectedCheck = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
`;

const RecommendedBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 10px;
  background-color: #28a745;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

// Add new styled components for analysis details
const AnalysisContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const AnalysisTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #495057;
`;

const AnalysisDetail = styled.div`
  margin-bottom: 0.75rem;
`;

const AnalysisLabel = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  color: #495057;
  margin-right: 0.5rem;
`;

const AnalysisValue = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ConfidenceBar = styled.div<{ confidence: number }>`
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${(props) => `${props.confidence * 100}%`};
    background-color: ${(props) => {
      if (props.confidence > 0.7) return '#28a745';
      if (props.confidence > 0.4) return '#ffc107';
      return '#dc3545';
    }};
    border-radius: 3px;
  }
`;

const SuggestedActionsList = styled.ul`
  margin-top: 0.5rem;
  margin-bottom: 0;
  padding-left: 1.5rem;
`;

const SuggestedAction = styled.li`
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
`;

// Enhanced styled components for displaying LLM insights
const AnalysisSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.9rem;
  color: #343a40;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.25rem;
`;

const QualityScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
`;

const QualityScore = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
`;

const ScoreValue = styled.div<{ score: number }>`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: ${(props) => {
    if (props.score >= 7.5) return '#28a745';
    if (props.score >= 5) return '#ffc107';
    return '#dc3545';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UseCase = styled.div`
  background-color: #e7f5ff;
  border-left: 4px solid #007bff;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0 4px 4px 0;
`;

const RiskList = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
`;

const RiskItem = styled.li`
  margin-bottom: 0.5rem;
  color: #6c757d;
  position: relative;

  &::before {
    content: '⚠️';
    position: absolute;
    left: -1.5rem;
    font-size: 0.875rem;
  }
`;

// Predefined cleaning profiles
const PREDEFINED_PROFILES: CleaningProfile[] = [
  {
    id: 'general',
    name: 'General Purpose',
    description: 'Standard cleaning for most datasets',
    domain: 'general',
    rules: [
      { type: 'missing', action: 'impute', priority: 'high' },
      { type: 'outlier', action: 'flag', priority: 'medium' },
      { type: 'duplicate', action: 'remove', priority: 'high' },
    ],
  },
  {
    id: 'finance',
    name: 'Financial Data',
    description: 'Optimized for financial datasets',
    domain: 'finance',
    rules: [
      { type: 'missing', action: 'impute', priority: 'high' },
      { type: 'outlier', action: 'cap', priority: 'high' },
      { type: 'format', action: 'standardize', priority: 'high', parameters: { decimals: 2 } },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'For medical and patient data',
    domain: 'healthcare',
    rules: [
      { type: 'missing', action: 'flag', priority: 'high' },
      { type: 'outlier', action: 'flag', priority: 'high' },
      { type: 'duplicate', action: 'flag', priority: 'high' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'For customer and campaign data',
    domain: 'marketing',
    rules: [
      { type: 'missing', action: 'impute', priority: 'medium' },
      { type: 'duplicate', action: 'merge', priority: 'high' },
      { type: 'format', action: 'standardize', priority: 'medium' },
    ],
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'For employee and recruitment data',
    domain: 'hr',
    rules: [
      { type: 'missing', action: 'flag', priority: 'high' },
      { type: 'duplicate', action: 'flag', priority: 'high' },
      { type: 'format', action: 'standardize', priority: 'medium' },
      { type: 'outlier', action: 'flag', priority: 'medium' },
    ],
  },
];

interface CleaningProfileSelectorProps {
  dataset: DatasetType;
  onProfileSelected: (profile: CleaningProfile) => void;
  selectedProfile: CleaningProfile | null;
  disabled: boolean;
}

export const CleaningProfileSelector: React.FC<CleaningProfileSelectorProps> = ({
  dataset,
  onProfileSelected,
  selectedProfile,
  disabled,
}) => {
  const [recommendedProfile, setRecommendedProfile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedDatasetId, setAnalyzedDatasetId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DatasetAnalysisResult | null>(null);

  // Use the API service to analyze the dataset and recommend a profile
  useEffect(() => {
    const fetchRecommendedProfile = async () => {
      // Don't analyze if there's no dataset or if it's already being analyzed
      if (!dataset || !dataset.data.length || isAnalyzing) return;

      // Check if we've already analyzed this dataset to prevent loops
      const datasetId = `${dataset.filename}-${dataset.data.length}`;
      if (datasetId === analyzedDatasetId) return;

      setIsAnalyzing(true);
      try {
        // Use the analyzeDataset API service
        const result = await analyzeDataset(dataset);
        setAnalysisResult(result);
        setRecommendedProfile(result.recommendedDomain);
        setAnalyzedDatasetId(datasetId);

        // Auto-select the recommended profile if none is selected
        if (!selectedProfile) {
          const profile = PREDEFINED_PROFILES.find((p) => p.id === result.recommendedDomain);
          if (profile) {
            onProfileSelected(profile);
          }
        }
      } catch (error) {
        console.error('Error analyzing dataset:', error);
        // Set to general as fallback in case of error
        setRecommendedProfile('general');
        setAnalysisResult(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchRecommendedProfile();
  }, [dataset, onProfileSelected, selectedProfile]);

  const handleProfileSelect = (profile: CleaningProfile) => {
    if (!disabled) {
      onProfileSelected(profile);
    }
  };

  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div>
      <ProfilesContainer>
        {PREDEFINED_PROFILES.map((profile) => (
          <ProfileCard
            key={profile.id}
            selected={selectedProfile?.id === profile.id}
            disabled={disabled}
            onClick={() => handleProfileSelect(profile)}
          >
            {recommendedProfile === profile.id && <RecommendedBadge>Recommended</RecommendedBadge>}
            {selectedProfile?.id === profile.id && <SelectedCheck>✓</SelectedCheck>}
            <ProfileName>{profile.name}</ProfileName>
            <ProfileDescription>{profile.description}</ProfileDescription>
            <ProfileDomain>{profile.domain}</ProfileDomain>
          </ProfileCard>
        ))}
      </ProfilesContainer>

      {analysisResult && (
        <AnalysisContainer>
          <AnalysisTitle>AI Dataset Analysis</AnalysisTitle>

          <AnalysisSection>
            <SectionTitle>Domain Classification</SectionTitle>
            <AnalysisDetail>
              <AnalysisLabel>Recommended Domain:</AnalysisLabel>
              <AnalysisValue>{analysisResult.recommendedDomain}</AnalysisValue>
            </AnalysisDetail>

            <AnalysisDetail>
              <AnalysisLabel>Confidence:</AnalysisLabel>
              <AnalysisValue>{formatConfidence(analysisResult.confidence)}</AnalysisValue>
              <ConfidenceBar confidence={analysisResult.confidence} />
            </AnalysisDetail>

            <AnalysisDetail>
              <AnalysisLabel>Reasoning:</AnalysisLabel>
              <AnalysisValue>{analysisResult.reasoning}</AnalysisValue>
            </AnalysisDetail>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>Data Quality Assessment</SectionTitle>
            <QualityScoreGrid>
              <QualityScore>
                <ScoreValue score={analysisResult.dataQualityAssessment.completenessScore}>
                  {analysisResult.dataQualityAssessment.completenessScore.toFixed(1)}
                </ScoreValue>
                <ScoreLabel>
                  <Tooltip text="Measures the extent to which the dataset contains all necessary values without missing data. Higher scores indicate fewer missing values.">
                    Completeness
                  </Tooltip>
                </ScoreLabel>
              </QualityScore>
              <QualityScore>
                <ScoreValue score={analysisResult.dataQualityAssessment.accuracyScore}>
                  {analysisResult.dataQualityAssessment.accuracyScore.toFixed(1)}
                </ScoreValue>
                <ScoreLabel>
                  <Tooltip text="Evaluates how correctly the data represents the real-world values it aims to model. Higher scores indicate fewer errors and outliers.">
                    Accuracy
                  </Tooltip>
                </ScoreLabel>
              </QualityScore>
              <QualityScore>
                <ScoreValue score={analysisResult.dataQualityAssessment.consistencyScore}>
                  {analysisResult.dataQualityAssessment.consistencyScore.toFixed(1)}
                </ScoreValue>
                <ScoreLabel>
                  <Tooltip text="Measures the uniformity of data formats and values across the dataset. Higher scores indicate more consistent data representations.">
                    Consistency
                  </Tooltip>
                </ScoreLabel>
              </QualityScore>
              <QualityScore>
                <ScoreValue score={analysisResult.dataQualityAssessment.overallQualityScore}>
                  {analysisResult.dataQualityAssessment.overallQualityScore.toFixed(1)}
                </ScoreValue>
                <ScoreLabel>
                  <Tooltip text="A combined measure that evaluates the dataset's overall quality considering all quality dimensions. Higher scores indicate better overall data quality.">
                    Overall Quality
                  </Tooltip>
                </ScoreLabel>
              </QualityScore>
            </QualityScoreGrid>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>Potential Use Case</SectionTitle>
            <UseCase>{analysisResult.potentialUseCase}</UseCase>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>Suggested Cleaning Actions</SectionTitle>
            <SuggestedActionsList>
              {analysisResult.suggestedCleaningActions.map((action, index) => (
                <SuggestedAction key={index}>{action}</SuggestedAction>
              ))}
            </SuggestedActionsList>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>Risk Factors</SectionTitle>
            <RiskList>
              {analysisResult.riskFactors.map((risk, index) => (
                <RiskItem key={index}>{risk}</RiskItem>
              ))}
            </RiskList>
          </AnalysisSection>

          {analysisResult.analysisMetrics && (
            <AnalysisSection>
              <SectionTitle>Metrics</SectionTitle>
              <div style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                <div>
                  <AnalysisLabel>
                    <Tooltip text="The percentage of missing values in the dataset. Lower percentages indicate more complete data.">
                      Missing Value Ratio:
                    </Tooltip>
                  </AnalysisLabel>{' '}
                  <AnalysisValue>{(analysisResult.analysisMetrics.missingValueRatio * 100).toFixed(2)}%</AnalysisValue>
                </div>
                <div>
                  <AnalysisLabel>
                    <Tooltip text="The estimated number of duplicate rows in the dataset. Lower numbers indicate less redundancy.">
                      Duplicate Rows:
                    </Tooltip>
                  </AnalysisLabel>{' '}
                  <AnalysisValue>{analysisResult.analysisMetrics.duplicateRowsEstimate}</AnalysisValue>
                </div>
                <div>
                  <AnalysisLabel>
                    <Tooltip text="A measure of how many unusual or potentially erroneous values exist in the dataset. Lower scores indicate fewer anomalies.">
                      Anomaly Score:
                    </Tooltip>
                  </AnalysisLabel>{' '}
                  <AnalysisValue>{analysisResult.analysisMetrics.anomalyScore.toFixed(2)} / 10</AnalysisValue>
                </div>
                <div>
                  <AnalysisLabel>
                    <Tooltip text="How consistently data formats are applied across columns. Higher scores indicate more standardized formatting.">
                      Format Consistency:
                    </Tooltip>
                  </AnalysisLabel>{' '}
                  <AnalysisValue>{analysisResult.analysisMetrics.formatConsistencyScore.toFixed(2)} / 10</AnalysisValue>
                </div>
              </div>
            </AnalysisSection>
          )}
        </AnalysisContainer>
      )}

      {isAnalyzing && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>Analyzing dataset with AI...</div>
      )}
    </div>
  );
};
