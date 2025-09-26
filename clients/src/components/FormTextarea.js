import React from 'react';

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
          error
            ? 'border-red-300 text-red-900 placeholder-red-300'
            : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormTextarea;