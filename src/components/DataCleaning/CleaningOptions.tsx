import React from 'react';
import styled from '@emotion/styled';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionLabel = styled.label`
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
`;

const OptionDescription = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
  width: 100%;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
  width: 100%;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: 400;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

interface CleaningOptionsProps {
  options: {
    handleMissingValues: string;
    handleOutliers: string;
    removeDuplicates: boolean;
    standardizeColumns: boolean;
  };
  onChange: (options: any) => void;
  isProcessing: boolean;
  disabled: boolean;
  replacementValue: string;
  setReplacementValue: (value: string) => void;
}

interface SelectOptionProps {
  id: string;
  label: string;
  description: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled: boolean;
}

interface InputOptionProps {
  id: string;
  label: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

interface CheckboxOptionProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({ id, label, description, value, options, onChange, disabled }) => (
  <OptionGroup>
    <OptionLabel htmlFor={id}>{label}</OptionLabel>
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
    <OptionDescription>{description}</OptionDescription>
  </OptionGroup>
);

const InputOption: React.FC<InputOptionProps> = ({
  id,
  label,
  description,
  value,
  placeholder,
  onChange,
  disabled,
}) => (
  <OptionGroup>
    <OptionLabel htmlFor={id}>{label}</OptionLabel>
    <Input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
    <OptionDescription>{description}</OptionDescription>
  </OptionGroup>
);

const CheckboxOption: React.FC<CheckboxOptionProps> = ({ id, label, description, checked, onChange, disabled }) => (
  <OptionGroup>
    <CheckboxLabel htmlFor={id}>
      <CheckboxInput
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </CheckboxLabel>
    <OptionDescription>{description}</OptionDescription>
  </OptionGroup>
);

export const CleaningOptions: React.FC<CleaningOptionsProps> = ({
  options,
  onChange,
  isProcessing,
  disabled,
  replacementValue,
  setReplacementValue,
}) => {
  const missingValuesOptions = [
    { value: 'impute', label: 'Impute with mean/mode' },
    { value: 'drop', label: 'Drop rows with missing values' },
    { value: 'replace', label: 'Replace with custom value' },
  ];

  const outlierOptions = [
    { value: 'none', label: 'Do not handle outliers' },
    { value: 'remove', label: 'Remove outliers' },
    { value: 'cap', label: 'Cap outliers at threshold' },
  ];

  return (
    <OptionsContainer>
      <SelectOption
        id="handleMissingValues"
        label="Handle Missing Values"
        description="Choose how to handle missing values in your dataset."
        value={options.handleMissingValues}
        options={missingValuesOptions}
        onChange={(value) => onChange({ handleMissingValues: value })}
        disabled={disabled || isProcessing}
      />

      {options.handleMissingValues === 'replace' && (
        <InputOption
          id="replacementValue"
          label="Custom replacement value"
          description="This value will replace all missing data in your dataset."
          value={replacementValue}
          placeholder="Enter value to replace missing data"
          onChange={setReplacementValue}
          disabled={disabled || isProcessing}
        />
      )}

      <SelectOption
        id="handleOutliers"
        label="Handle Outliers"
        description="Choose how to handle outlier values in your dataset."
        value={options.handleOutliers}
        options={outlierOptions}
        onChange={(value) => onChange({ handleOutliers: value })}
        disabled={disabled || isProcessing}
      />

      <CheckboxOption
        id="removeDuplicates"
        label="Remove duplicate rows"
        description="Identify and remove duplicate records in the dataset."
        checked={options.removeDuplicates}
        onChange={(checked) => onChange({ removeDuplicates: checked })}
        disabled={disabled || isProcessing}
      />

      <CheckboxOption
        id="standardizeColumns"
        label="Standardize column names"
        description="Convert column names to a consistent format (lowercase, spaces to underscores)."
        checked={options.standardizeColumns}
        onChange={(checked) => onChange({ standardizeColumns: checked })}
        disabled={disabled || isProcessing}
      />
    </OptionsContainer>
  );
};
