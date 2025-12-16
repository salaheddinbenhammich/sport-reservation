import React from 'react';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  label: string;
  name: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: () => void;
  error?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
}) => {
  // Custom input for manual typing
  const CustomInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onChange }, ref) => (
      <InputMask
        mask="9999-99-99"
        maskPlaceholder="YYYY-MM-DD"
        value={value}
        onChange={onChange}
        onClick={onClick}
        ref={ref}
        placeholder="YYYY-MM-DD"
        className={`w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none transition-all ${
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-400'
            : 'border-gray-300 focus:ring-2 focus:ring-green-500'
        }`}
      />
    )
  );

  return (
    <div className="flex flex-col w-full relative">
      <label htmlFor={name} className="text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>

      <DatePicker
        id={name}
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        dateFormat="yyyy-MM-dd"
        placeholderText="YYYY-MM-DD"
        maxDate={new Date()}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        customInput={<CustomInput />}
      />

      {error && (
        <span className="text-red-500 text-xs mt-0.5 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};

export default DateField;
