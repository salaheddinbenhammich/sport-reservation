import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="flex flex-col w-full relative">
      <label htmlFor={name} className="text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none transition-all ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-400'
              : 'border-gray-300 focus:ring-2 focus:ring-green-500'
          }`}
        />

        {/* Show/Hide password button */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-600 transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <span className="text-red-500 text-sm mt-1 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;
