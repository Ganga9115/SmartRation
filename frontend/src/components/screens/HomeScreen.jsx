import React, { useEffect, useState } from 'react';
import { Package, Calendar, List, MapPin, Bell } from 'lucide-react';
import { Card } from '../shared/Card';
import { Header } from '../shared/Header';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../utils/AuthContext';
import { bookingAPI, welfareAPI } from '../../utils/api';

export const HomeScreen = ({ onNavigate }) => {
  const { user, rationCard } = useAuth();
  const [bookings, setBookings]         = useState([]);
  const [alertCount, setAlertCount]     = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    bookingAPI.getMyBookings().then(r => {
      const all = r.data.bookings || [];
      setBookings(all);
      setActiveBooking(all.find(b => b.status === 'confirmed') || null);
    }).catch(() => {});

    welfareAPI.getMyAlerts().then(r => {
      const unread = (r.data.alerts || []).filter(a => !a.is_resolved);
      setAlertCount(unread.length);
    }).catch(() => {});
  }, []);

  const actions = [
    { icon: Package,  title: 'Stock',         subtitle: 'View available items',  screen: 'stock' },
    { icon: Calendar, title: 'Book Slot',      subtitle: 'Book your time slot',   screen: 'nearby-shops' },
    { icon: List,     title: 'My Bookings',   subtitle: 'View booking history',  screen: 'my-bookings' },
    { icon: MapPin,   title: 'Nearby Shops',  subtitle: 'Find shops near you',   screen: 'nearby-shops' },
  ];

  const thisMonth  = bookings.filter(b => {
    const d = new Date(b.booking_date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const collected = thisMonth.filter(b => b.status === 'completed');

  return (
    <div className="w-full min-h-screen pb-24" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6" style={{ backgroundColor: COLORS.primary }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-sm">Good morning,</p>
            <h1 className="text-white text-2xl font-bold">{user?.name || 'User'}</h1>
          </div>
          <button onClick={() => onNavigate('notifications')} className="relative mt-1">
            <Bell size={24} color="white" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 -mt-2">
        {/* Ration Card */}
        {rationCard ? (
          <Card variant="lilac" className="mb-6 mt-4">
            <div className="flex justify-between items-start">
              <div>
                <p style={{ color: COLORS.primary }} className="font-semibold text-sm">Ration Card</p>
                <p style={{ color: COLORS.primary }} className="font-bold">{rationCard.card_number}</p>
                <p style={{ color: COLORS.primary }} className="mt-1 text-sm">
                  Family Members: {rationCard.family_members}
                </p>
              </div>
              <span className="bg-white px-3 py-1 rounded-lg font-bold text-sm"
                style={{ color: COLORS.primary }}>
                {rationCard.card_type}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="mb-6 mt-4">
            <div className="flex items-center justify-between">
              <p style={{ color: COLORS.primary }} className="font-semibold">No ration card registered</p>
              <button onClick={() => onNavigate('ration-card')}
                className="text-sm font-semibold px-3 py-1 rounded-lg"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                Register
              </button>
            </div>
          </Card>
        )}

        {/* Active booking banner */}
        {activeBooking && (
          <div className="mb-6 p-4 rounded-2xl cursor-pointer"
            style={{ backgroundColor: COLORS.primary }}
            onClick={() => onNavigate('confirmation', { bookingId: activeBooking.id })}>
            <p className="text-white/70 text-xs mb-1">Active Booking</p>
            <p className="text-white font-bold">Token #{activeBooking.token_number}</p>
            <p className="text-white/80 text-sm">
              {new Date(activeBooking.booking_date).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'
              })} · {activeBooking.slot_time}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <h3 style={{ color: COLORS.primary }} className="text-lg font-semibold mb-4">Quick Actions</h3>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <div key={i} onClick={() => onNavigate(action.screen)} className="cursor-pointer mb-3">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.secondary }}>
                    <Icon size={24} color={COLORS.primary} />
                  </div>
                  <div className="flex-1">
                    <h4 style={{ color: COLORS.primary }} className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.subtitle}</p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {/* This Month stats */}
        <Card variant="lilac" className="mt-2">
          <h4 style={{ color: COLORS.primary }} className="font-semibold mb-4">This Month</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={{ color: `${COLORS.primary}99` }} className="text-sm">Bookings Made</p>
              <p style={{ color: COLORS.primary }} className="text-2xl font-bold">{thisMonth.length}</p>
            </div>
            <div>
              <p style={{ color: `${COLORS.primary}99` }} className="text-sm">Collections Done</p>
              <p style={{ color: COLORS.primary }} className="text-2xl font-bold">{collected.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};