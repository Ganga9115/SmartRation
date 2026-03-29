import React, { useState } from 'react';
import { useAuth } from './utils/AuthContext';
import { SplashScreen }             from './components/screens/SplashScreen';
import { LoginScreen }              from './components/screens/LoginScreen';
import { HomeScreen }               from './components/screens/HomeScreen';
import { StockScreen }              from './components/screens/StockScreen';
import { NearbyShopsScreen }        from './components/screens/NearbyShopsScreen';
import { SlotBookingScreen }        from './components/screens/SlotBookingScreen';
import { BookingConfirmationScreen }from './components/screens/BookingConfirmationScreen';
import { NotificationsScreen }      from './components/screens/NotificationsScreen';
import { ProfileScreen }            from './components/screens/ProfileScreen';
import { RationCardScreen }         from './components/screens/RationCardScreen';
import { BottomNav }                from './components/shared/ButtomNav';
import { MyBookingsScreen } from './components/screens/MyBookingsScreen';

export default function App() {
  const { token, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showSplash, setShowSplash]       = useState(true);
  const [screenParams, setScreenParams]   = useState({});

  const handleNavigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F4FB' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
        <p style={{ color: '#5E4075' }}>Loading...</p>
      </div>
    </div>
  );

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  // If no token, always show login
  if (!token && currentScreen !== 'login') handleNavigate('login');

  const showBottomNav = !['login', 'splash'].includes(currentScreen);

  return (
    <div className="relative">
      {currentScreen === 'login'        && <LoginScreen              onNavigate={handleNavigate} />}
      {currentScreen === 'home'         && <HomeScreen               onNavigate={handleNavigate} />}
      {currentScreen === 'stock'        && <StockScreen              onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'nearby-shops' && <NearbyShopsScreen        onNavigate={handleNavigate} />}
      {currentScreen === 'slot-booking' && <SlotBookingScreen        onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'confirmation' && <BookingConfirmationScreen onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'notifications'&& <NotificationsScreen      onNavigate={handleNavigate} />}
      {currentScreen === 'profile'      && <ProfileScreen            onNavigate={handleNavigate} />}
      {currentScreen === 'ration-card'  && <RationCardScreen         onNavigate={handleNavigate} />}
      {currentScreen === 'my-bookings' && <MyBookingsScreen onNavigate={handleNavigate} />}
      {showBottomNav && <BottomNav active={currentScreen} onNavigate={handleNavigate} />}
    </div>
  );
}