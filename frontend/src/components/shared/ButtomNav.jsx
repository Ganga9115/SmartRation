// src/components/shared/BottomNav.jsx

import React from 'react';
import { Home, Calendar, Bell, User } from 'lucide-react';
import { COLORS } from '../../utils/colors';

export const BottomNav = ({ active, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'slot-booking', label: 'Book', icon: Calendar },  // ← CHANGED FROM 'nearby-shops' TO 'slot-booking'
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t" style={{ borderColor: COLORS.border }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
                style={isActive ? { color: COLORS.primary } : {}}
              >
                <Icon size={24} strokeWidth={2} />
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};