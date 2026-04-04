import React, { useState , useEffect} from 'react';
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
import LiveQueueScreen from './components/screens/LivequeueScreen';
import SpecialEventsScreen from './components/screens/SpecialEventsScreen';


export default function App() {
  const { token, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showSplash, setShowSplash]       = useState(true);
  const [screenParams, setScreenParams]   = useState({});

  const handleNavigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  // ✅ Redirect to login once auth resolves and there's no token
  useEffect(() => {
    if (!loading && !token) {
      handleNavigate('login');
    }
  }, [loading, token]);

  // ✅ Keep splash up until BOTH splash timer AND auth loading are done
  if (showSplash || loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const showBottomNav = !['login', 'splash', 'ration-card'].includes(currentScreen);

  return (
    <div className="relative">
      {currentScreen === 'login'         && <LoginScreen              onNavigate={handleNavigate} />}
      {currentScreen === 'home'          && <HomeScreen               onNavigate={handleNavigate} />}
      {currentScreen === 'stock'         && <StockScreen              onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'nearby-shops'  && <NearbyShopsScreen        onNavigate={handleNavigate} />}
      {currentScreen === 'slot-booking'  && <SlotBookingScreen        onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'confirmation'  && <BookingConfirmationScreen onNavigate={handleNavigate} params={screenParams} />}
      {currentScreen === 'notifications' && <NotificationsScreen      onNavigate={handleNavigate} />}
      {currentScreen === 'profile'       && <ProfileScreen            onNavigate={handleNavigate} />}
      {currentScreen === 'ration-card'   && <RationCardScreen         onNavigate={handleNavigate} />}
      {currentScreen === 'my-bookings'   && <MyBookingsScreen         onNavigate={handleNavigate} />}
      {currentScreen === 'live-queue'    && <LiveQueueScreen          onNavigate={handleNavigate} params={screenParams} />}
      {showBottomNav && <BottomNav active={currentScreen} onNavigate={handleNavigate} />}
      {currentScreen === 'special-events' && <SpecialEventsScreen onNavigate={handleNavigate} />}
    </div>
  );
}