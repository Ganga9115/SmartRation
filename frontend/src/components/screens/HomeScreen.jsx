import React, { useEffect, useState } from 'react';
import { Package, Calendar, List, MapPin, Bell } from 'lucide-react';
import { Card } from '../shared/Card';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../utils/AuthContext';
import { bookingAPI, welfareAPI } from '../../utils/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const HomeScreen = ({ onNavigate }) => {
  const { user, rationCard }              = useAuth();
  const [bookings, setBookings]           = useState([]);
  const [alertCount, setAlertCount]       = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    bookingAPI.getMyBookings().then(r => {
      const all = r.data.bookings || [];
      setBookings(all);
      setActiveBooking(all.find(b => b.status === 'confirmed') || null);
    }).catch(() => {});

    welfareAPI.getMyAlerts().then(r => {
      setAlertCount((r.data.alerts || []).filter(a => !a.is_resolved).length);
    }).catch(() => {});
  }, []);

  const actions = [
    { icon: Package,  title: 'Stock',        subtitle: 'View available items', screen: 'stock' },
    { icon: Calendar, title: 'Book Slot',     subtitle: 'Book your time slot',  screen: 'slot-booking' },
    { icon: List,     title: 'My Bookings',  subtitle: 'View booking history', screen: 'my-bookings' },
    { icon: MapPin,   title: 'Nearby Shops', subtitle: 'Find shops near you',  screen: 'nearby-shops' },
  ];

  const now       = new Date();
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.booking_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const collected = thisMonth.filter(b => b.status === 'completed');

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '6rem', backgroundColor: COLORS.background }}>

      {/* ── Header — matches screenshot exactly ─────────────── */}
      <div style={{ backgroundColor: COLORS.primary, borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
              {getGreeting()}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>
              Welcome back to SmartRation
            </p>
          </div>
          <button onClick={() => onNavigate('notifications')}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem', padding: 0 }}>
            <Bell size={24} color="white" />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                backgroundColor: '#EF4444', color: 'white',
                fontSize: '0.65rem', fontWeight: '700',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 1.5rem' }}>

        {/* ── Ration Card — overlaps header like screenshot ──── */}
        <div style={{ marginTop: '-1.25rem', marginBottom: '1.5rem' }}>
          {rationCard ? (
            <Card variant="lilac">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={16} color={COLORS.primary} />
                    <span style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.9rem' }}>
                      Ration Card
                    </span>
                  </div>
                  <p style={{ color: COLORS.primary, fontWeight: '700', fontSize: '1rem', margin: 0 }}>
                    {rationCard.card_number}
                  </p>
                  <p style={{ color: COLORS.primary, fontSize: '0.875rem', margin: 0 }}>
                    Family Members: {rationCard.family_members}
                  </p>
                </div>
                <span style={{
                  backgroundColor: 'white', color: COLORS.primary,
                  padding: '0.375rem 0.875rem', borderRadius: '0.625rem',
                  fontWeight: '700', fontSize: '0.875rem',
                }}>
                  {rationCard.card_type}
                </span>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: COLORS.primary, fontWeight: '600', margin: 0 }}>
                  No ration card registered
                </p>
                <button onClick={() => onNavigate('ration-card')}
                  style={{
                    backgroundColor: COLORS.primary, color: 'white',
                    padding: '0.375rem 0.875rem', borderRadius: '0.625rem',
                    border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
                  }}>
                  Register
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* ── Active booking banner ─────────────────────────── */}
        {activeBooking && (
          <div
            onClick={() => onNavigate('confirmation', { bookingId: activeBooking.id })}
            style={{
              backgroundColor: COLORS.primary, borderRadius: '1rem',
              padding: '1rem', marginBottom: '1.5rem', cursor: 'pointer',
            }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>
              Active Booking
            </p>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '1rem', margin: '0 0 0.2rem 0' }}>
              Token #{activeBooking.token_number}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0 }}>
              {new Date(activeBooking.booking_date).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short',
              })} · {activeBooking.slot_time}
            </p>
          </div>
        )}

        {/* ── Quick Actions ─────────────────────────────────── */}
        <h3 style={{ color: COLORS.primary, fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.875rem' }}>
          Quick Actions
        </h3>

        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <div key={i} onClick={() => onNavigate(action.screen)}
              style={{ cursor: 'pointer', marginBottom: '0.75rem' }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: COLORS.secondary }}>
                    <Icon size={24} color={COLORS.primary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.2rem 0', fontSize: '1rem' }}>
                      {action.title}
                    </h4>
                    <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.875rem' }}>
                      {action.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {/* ── This Month stats ──────────────────────────────── */}
        <Card variant="lilac" className="mt-2">
          <h4 style={{ color: COLORS.primary, fontWeight: '600', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
            This Month
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ color: `${COLORS.primary}99`, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                Bookings Made
              </p>
              <p style={{ color: COLORS.primary, fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                {thisMonth.length}
              </p>
            </div>
            <div>
              <p style={{ color: `${COLORS.primary}99`, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                Collections Done
              </p>
              <p style={{ color: COLORS.primary, fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                {collected.length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};