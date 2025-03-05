import { InputLabel, MenuItem, Select } from '@mui/material';
import { colors } from '@/lib/theme';
import { SelectBase } from './SelectBase';
import { Level } from '@/lib/mongo/models/ScenarioModel';

interface LevelSelectProps {
  value?: Level | null;
  onChange: (value: Level) => void;
  error?: boolean;
  color?: 'primary' | 'secondary';
  disabled?: boolean;
  onBlur?: () => void;
  required?: boolean;
  label?: string;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  value,
  onChange,
  error,
  color = 'primary',
  disabled,
  onBlur,
  required,
  label = 'Level',
}) => {
  return (
    <SelectBase size="small" error={error} fullWidth required={required} variantColor={color}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as Level)}
        label={label}
        color="secondary"
        disabled={disabled}
        onBlur={onBlur}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: colors.appBgFront,
              color: 'white',
              '& .MuiMenuItem-root': {
                '&.Mui-selected': {
                  backgroundColor: colors.primary,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: colors.primary,
                    color: 'white',
                  },
                },
              },
            },
          },
        }}
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </Select>
    </SelectBase>
  );
};
