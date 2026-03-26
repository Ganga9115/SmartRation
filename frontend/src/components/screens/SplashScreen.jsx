// src/components/screens/SplashScreen.jsx

import React, { useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { COLORS } from '../../utils/colors';

export const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    console.log('SplashScreen mounted - waiting 2 seconds');
    
    const timer = setTimeout(() => {
      console.log('SplashScreen timer complete - calling onComplete');
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-3xl p-8 mb-8">
          <ShoppingBag size={60} color={COLORS.primary} strokeWidth={1.5} />
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">SmartRation</h1>
        <p className="text-white/90 text-center max-w-xs">
          No Queues. No Repeats.
          <br />
          Smart Collection.
        </p>
      </div>
    </div>
  );
};