// src/components/shared/Header.jsx

import React from 'react';
import { COLORS } from '../../utils/colors';

export const Header = ({ title, subtitle, showBack, onBack }) => (
  <div className="p-6 text-white rounded-b-3xl" style={{ backgroundColor: COLORS.primary }}>
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="hover:opacity-80 text-2xl">
          ←
        </button>
      )}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-white/80">{subtitle}</p>}
      </div>
    </div>
  </div>
);