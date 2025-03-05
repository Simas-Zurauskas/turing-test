import { FormControl } from '@mui/material';
import styled from '@emotion/styled';

export const SelectBase = styled(FormControl)<{ variantColor: 'primary' | 'secondary' }>`
  .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
    border: 1px solid ${({ error, theme, variantColor }) => (error ? theme.colors.error : theme.colors[variantColor])};
    border-radius: 4px;
    opacity: 0.7;
  }
  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border: 1px solid ${({ error, theme, variantColor }) => (error ? theme.colors.error : theme.colors[variantColor])};
    border-radius: 4px;
    opacity: 1;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border: 1px solid ${({ error, theme, variantColor }) => (error ? theme.colors.error : theme.colors[variantColor])};
    border-radius: 4px;
    opacity: 1;
  }

  .MuiFormLabel-root {
    color: ${({ theme, variantColor }) => theme.colors[variantColor]};
  }

  .Mui-error {
    &.MuiFormLabel-root {
      color: ${({ theme }) => theme.colors.error} !important;
    }
  }

  .MuiInputBase-root,
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
