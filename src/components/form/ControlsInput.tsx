import { ControlInput } from '@/lib/mongo/models/ControlModel';
import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const Div = styled.div`
  .dropzone {
    border: 1px dashed ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.shade};
    border-radius: 4px;
    padding: 18px;
  }
`;

interface ControlsInputProps {
  setControls: (controls: ControlInput[]) => void;
}

export const ControlsInput: React.FC<ControlsInputProps> = ({ setControls }) => {
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'application/json': [],
    },
    onDropAccepted: (files) => {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setControls(parsed);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      reader.readAsText(file);
    },
  });

  return (
    <Div>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Typography variant="body2">Drag & drop a JSON file here or click to select a file.</Typography>
      </div>
    </Div>
  );
};
