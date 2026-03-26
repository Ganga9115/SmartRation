// src/components/shared/Button.jsx

import React from 'react';
import { COLORS } from '../../utils/colors';

export const Button = ({ title, onClick, variant = 'primary', fullWidth = false, disabled = false }) => {
  const baseClass = 'px-6 py-3 rounded-xl font-semibold transition-all active:scale-95';
  const widthClass = fullWidth ? 'w-full' : '';

  let styleClass = '';
  if (variant === 'primary') {
    styleClass = 'text-white hover:opacity-90';
  } else if (variant === 'outline') {
    styleClass = 'bg-white border-2 hover:bg-gray-50';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${widthClass} ${styleClass}`}
      style={
        variant === 'primary'
          ? { backgroundColor: COLORS.primary, color: 'white' }
          : variant === 'outline'
          ? { borderColor: COLORS.primary, color: COLORS.primary, backgroundColor: COLORS.surface }
          : {}
      }
    >
      {title}
    </button>
  );
};