// src/components/screens/HomeScreen.jsx

import React from 'react';
import { Package, Calendar, List, MapPin } from 'lucide-react';
import { Card } from '../shared/Card';
import { Header } from '../shared/Header';
import { COLORS } from '../../utils/colors';

export const HomeScreen = ({ onNavigate }) => {
  const actions = [
    { icon: Package, title: 'Stock', subtitle: 'View available items', screen: 'stock' },
    { icon: Calendar, title: 'Book Slot', subtitle: 'Book your time slot', screen: 'slot-booking' },
    { icon: List, title: 'My Bookings', subtitle: 'View your bookings', screen: 'confirmation' },
    { icon: MapPin, title: 'Nearby Shops', subtitle: 'Find shops near you', screen: 'nearby-shops' },
  ];

  return (
    <div className="w-full min-h-screen pt-20 md:pt-0 pb-24 md:pb-32" style={{ backgroundColor: COLORS.background }}>
      <Header title="Good Morning" subtitle="Welcome back to SmartRation" />

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="lilac" className="mb-6 mt-4">
          <div className="flex justify-between items-start">
            <div>
              <p style={{ color: COLORS.primary }} className="font-semibold">Ration Card</p>
              <p style={{ color: COLORS.primary }}>XXXX XXXX 1234</p>
              <p style={{ color: COLORS.primary }} className="mt-2">Family Members: 4</p>
            </div>
            <span className="bg-white px-3 py-1 rounded-lg font-semibold" style={{ color: COLORS.primary }}>APL</span>
          </div>
        </Card>

        <h3 style={{ color: COLORS.primary }} className="text-lg font-semibold mb-4">Quick Actions</h3>

        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <div key={i} onClick={() => onNavigate(action.screen)} className="cursor-pointer mb-4">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.secondary }}>
                    <Icon size={28} color={COLORS.primary} />
                  </div>
                  <div className="flex-1">
                    <h4 style={{ color: COLORS.primary }} className="font-semibold mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.subtitle}</p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        <Card variant="lilac">
          <h4 style={{ color: COLORS.primary }} className="font-semibold mb-4">This Month</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={{ color: 'rgba(94, 64, 117, 0.7)' }} className="text-sm">Bookings Made</p>
              <p style={{ color: COLORS.primary }} className="text-xl font-bold">2</p>
            </div>
            <div>
              <p style={{ color: 'rgba(94, 64, 117, 0.7)' }} className="text-sm">Collections</p>
              <p style={{ color: COLORS.primary }} className="text-xl font-bold">1</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};