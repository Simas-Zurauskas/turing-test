import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { DatasetType, DataRow } from '../../types/dataCleaningTypes';

const UploadContainer = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;

  &:hover {
    background-color: #0069d9;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 1rem auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface FileUploaderProps {
  onFileUploaded: (dataset: DatasetType) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const parseCSV = (content: string): { headers: string[]; data: DataRow[] } => {
    const lines = content.split('\n');
    if (lines.length === 0) {
      throw new Error('Empty file');
    }

    const headers = lines[0].split(',').map((header) => header.trim());
    const data: DataRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      const row: DataRow = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        // Try to convert to number if it looks like one
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          row[header] = parseFloat(value);
        } else if (value === 'true' || value === 'false') {
          row[header] = value === 'true';
        } else if (value === '') {
          row[header] = null;
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return { headers, data };
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error('No file selected');
      }

      const fileType = file.name.endsWith('.csv')
        ? 'csv'
        : file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        ? 'excel'
        : null;

      if (!fileType) {
        throw new Error('Unsupported file type. Please upload a CSV or Excel file.');
      }

      if (fileType === 'excel') {
        // In a real implementation, we would use a library like xlsx to parse Excel files
        throw new Error('Excel parsing is not implemented in this demo. Please use a CSV file.');
      }

      const content = await file.text();
      const { headers, data } = parseCSV(content);

      const dataset: DatasetType = {
        filename: file.name,
        fileType: fileType as 'csv' | 'excel',
        headers,
        data,
        size: file.size,
      };

      onFileUploaded(dataset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <UploadContainer
        style={{ borderColor: dragActive ? '#007bff' : '#ccc' }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>Drag and drop your CSV file here, or click to select</p>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>Supported formats: CSV (Excel format coming soon)</p>
        <FileInput type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
        {!isLoading && (
          <UploadButton
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select File
          </UploadButton>
        )}
        {isLoading && <LoadingSpinner />}
      </UploadContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
