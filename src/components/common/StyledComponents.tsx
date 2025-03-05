import styled from '@emotion/styled';

// Layout Components
export const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const Flex = styled.div<{ gap?: string; direction?: string; align?: string; justify?: string }>`
  display: flex;
  flex-direction: ${(props) => props.direction || 'row'};
  align-items: ${(props) => props.align || 'center'};
  justify-content: ${(props) => props.justify || 'flex-start'};
  gap: ${(props) => props.gap || '1rem'};
`;

export const Section = styled.section`
  margin-bottom: 2rem;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// Form Components
export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

export const HelperText = styled.p<{ error?: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: ${(props) => (props.error ? '#dc3545' : '#6c757d')};
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
`;

// Button Components
export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background-color: #5a6268;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid #007bff;
          color: #007bff;
          &:hover:not(:disabled) {
            background-color: #f8f9fa;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
          &:hover:not(:disabled) {
            background-color: #0069d9;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Table Components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

export const TableHead = styled.thead`
  background-color: #f8f9fa;
`;

export const TableRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f8f9fa;
  }

  &:hover {
    background-color: #e9ecef;
  }
`;

export const TableCell = styled.td`
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
`;

export const TableHeader = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
`;

// Typography Components
export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #212529;
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #343a40;
`;

export const Heading = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #343a40;
`;

export const Text = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  color: #212529;
  margin-bottom: 1rem;
`;

export const Caption = styled.p`
  font-size: 0.75rem;
  color: #6c757d;
`;

// Alert & Notification Components
export const Alert = styled.div<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;

  ${(props) => {
    switch (props.variant) {
      case 'success':
        return `
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        `;
      default:
        return `
          background-color: #cce5ff;
          border: 1px solid #b8daff;
          color: #004085;
        `;
    }
  }}
`;

// Loading Components
export const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// Navigation Components
export const Nav = styled.nav`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

export const NavLink = styled.a<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: ${(props) => (props.active ? '#007bff' : '#343a40')};
  font-weight: ${(props) => (props.active ? '600' : '400')};

  &:hover {
    color: #007bff;
  }
`;

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #dee2e6;
  margin: 1.5rem 0;
`;

export const Badge = styled.span<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;

  ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
        `;
      case 'success':
        return `
          background-color: #28a745;
          color: white;
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
        `;
      case 'warning':
        return `
          background-color: #ffc107;
          color: #212529;
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
        `;
    }
  }}
`;
