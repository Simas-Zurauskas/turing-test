import styled from '@emotion/styled';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {}

export const Button = styled(MuiButton)`
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;

  &.MuiButton-outlined {
    background-color: ${({ theme }) => theme.colors.shade};
  }
  &.MuiButton-outlinedError {
    background-color: ${({ theme }) => theme.colors.errorPale};
  }

  /* color: ${({ theme }) => theme.colors.textWhite}; */
`;
