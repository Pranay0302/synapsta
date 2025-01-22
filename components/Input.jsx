import React from 'react';

export default function Input({ value, onChange, placeholder, onKeyDown }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown} 
      placeholder={placeholder || ''}
      style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem'}}
    />
  );
}
