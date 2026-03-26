// src/components/shared/Card.jsx

import React from 'react';
import { COLORS } from '../../utils/colors';

export const Card = ({ children, variant = 'default', className = '' }) => {
  const bgColor = variant === 'lilac' ? COLORS.secondary : COLORS.surface;
  return (
    <div
      className={`rounded-2xl p-6 border border-gray-200 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
};