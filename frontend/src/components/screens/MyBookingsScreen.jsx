import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Hash, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { bookingAPI } from '../../utils/api';

const STATUS_CONFIG = {
  confirmed:  { color: '#2563EB', bg: '#DBEAFE', icon: AlertCircle, label: 'Confirmed' },
  completed:  { color: COLORS.success, bg: '#D1FAE5', icon: CheckCircle, label: 'Completed' },
  cancelled:  { color: COLORS.error, bg: '#FEE2E2', icon: XCircle, label: 'Cancelled' },
  pending:    { color: COLORS.warning, bg: '#FEF3C7', icon: AlertCircle, label: 'Pending' },
  no_show:    { color: COLORS.textLight, bg: '#F3F4F6', icon: XCircle, label: 'No Show' },
};

export const MyBookingsScreen = ({ onNavigate }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(r => setBookings(r.data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>My Bookings</h2>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-2xl h-36 mb-3" />)
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Calendar size={48} color={COLORS.primary} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: COLORS.primary }}>No bookings yet</h3>
            <button onClick={() => onNavigate('nearby-shops')}
              style={{ backgroundColor: COLORS.primary, color: 'white', padding: '0.75rem 2rem',
                borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600', marginTop: '1rem' }}>
              Book Your First Slot
            </button>
          </div>
        ) : (
          bookings.map(booking => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={booking.id} style={{ marginBottom: '1rem' }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ backgroundColor: cfg.bg, color: cfg.color,
                      padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600',
                      display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                    <span style={{ color: COLORS.textLight, fontSize: '0.875rem' }}>
                      Token #{booking.token_number}
                    </span>
                  </div>

                  <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.75rem 0' }}>
                    {booking.Shop?.name}
                  </h4>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color={COLORS.primary} />
                      <span style={{ color: COLORS.textLight, fontSize: '0.875rem' }}>
                        {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} color={COLORS.primary} />
                      <span style={{ color: COLORS.textLight, fontSize: '0.875rem' }}>{booking.slot_time}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => onNavigate('confirmation', { bookingId: booking.id, booking })}
                      style={{ flex: 1, backgroundColor: COLORS.secondary, color: COLORS.primary,
                        padding: '0.625rem', borderRadius: '0.75rem', border: 'none',
                        cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleCancel(booking.id)}
                        style={{ flex: 1, backgroundColor: '#FEE2E2', color: COLORS.error,
                          padding: '0.625rem', borderRadius: '0.75rem', border: 'none',
                          cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>
      <BottomNav active="my-bookings" onNavigate={onNavigate} />
    </div>
  );
};

export default MyBookingsScreen;