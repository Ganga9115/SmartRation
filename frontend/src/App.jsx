// src/App.jsx

import React, { useState } from 'react';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { StockScreen } from './components/screens/StockScreen';
import { NearbyShopsScreen } from './components/screens/NearbyShopsScreen';
import {SlotBookingScreen} from './components/screens/SlotBookingScreen';  // ← ADD THIS IMPORT
import { BookingConfirmationScreen } from './components/screens/BookingConfirmationScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BottomNav } from './components/shared/ButtomNav';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showSplash, setShowSplash] = useState(true);

  console.log('App rendering - currentScreen:', currentScreen, 'showSplash:', showSplash);

  const handleNavigate = (screen) => {
    console.log('Navigation requested to:', screen);
    setCurrentScreen(screen);
  };

  const showBottomNav = !['splash', 'login'].includes(currentScreen);

  // Show splash first
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          console.log('Splash complete - hiding splash screen');
          setShowSplash(false);
        }} 
      />
    );
  }

  // After splash, show the appropriate screen based on currentScreen state
  
  return (
    <div className="relative">
      {/* Render appropriate screen */}
      {currentScreen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'stock' && <StockScreen onNavigate={handleNavigate} />}
      {currentScreen === 'nearby-shops' && <NearbyShopsScreen onNavigate={handleNavigate} />}
      {currentScreen === 'slot-booking' && <SlotBookingScreen onNavigate={handleNavigate} />}  {/* ← ADD THIS LINE */}
      {currentScreen === 'confirmation' && <BookingConfirmationScreen onNavigate={handleNavigate} />}
      {currentScreen === 'notifications' && <NotificationsScreen onNavigate={handleNavigate} />}
      {currentScreen === 'profile' && <ProfileScreen onNavigate={handleNavigate} />}

      {/* Show bottom nav only on main screens */}
      {showBottomNav && <BottomNav active={currentScreen} onNavigate={handleNavigate} />}
    </div>
  );
}