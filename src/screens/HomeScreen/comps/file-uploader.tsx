'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult } from 'papaparse';
import { Box, Typography, Alert } from '@mui/material';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onDataParsed: (result: ParseResult<any>) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUploader({ onDataParsed, setIsLoading }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      // Check if file is CSV
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }

      setIsLoading(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          onDataParsed(result);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setIsLoading(false);
        },
      });
    },
    [onDataParsed, setIsLoading],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        }}
      >
        <input {...getInputProps()} />
        <Upload size={48} color="#1976d2" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Only CSV files are supported
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
