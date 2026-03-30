import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Users, Clock, CheckCircle, Hash, RefreshCw, Zap } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { bookingAPI, queueAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export const LiveQueueScreen = ({ onNavigate, params = {} }) => {
  const { rationCard } = useAuth();

  const [queueData, setQueueData]   = useState(null);
  const [waitInfo, setWaitInfo]     = useState(null);
  const [myBooking, setMyBooking]   = useState(params.booking || null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const shopId = myBooking?.shop_id || myBooking?.shop?.id || params.shopId;
  const today  = new Date().toISOString().split('T')[0];

  // ── Fetch active booking if not passed ────────────────
  useEffect(() => {
    if (!myBooking) {
      bookingAPI.getMyBookings()
        .then(r => {
          const active = (r.data.bookings || []).find(b => b.status === 'confirmed');
          setMyBooking(active || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Fetch queue data ──────────────────────────────────
  const fetchQueue = useCallback(async (silent = false) => {
    if (!shopId) return;
    if (!silent) setRefreshing(true);
    try {
      const [queueRes, waitRes] = await Promise.all([
        bookingAPI.getQueueToday(shopId, today),
        myBooking?.token_number
          ? queueAPI.getWaitTime(shopId, today, myBooking.token_number)
          : Promise.resolve(null),
      ]);
      setQueueData(queueRes.data);
      if (waitRes) setWaitInfo(waitRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('fetchQueue error:', err.message);
    } finally {
      setRefreshing(false);
    }
  }, [shopId, today, myBooking?.token_number]);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    if (shopId) {
      fetchQueue();
      const interval = setInterval(() => fetchQueue(true), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchQueue]);

  // ── Helpers ───────────────────────────────────────────
  const getTokenStatus = (token) => {
    if (!myBooking) return null;
    if (token === myBooking.token_number) return 'mine';
    if (token < myBooking.token_number)  return 'ahead';
    return 'behind';
  };

  const getStatusStyle = (booking) => {
    if (booking.status === 'completed') return { bg: '#D1FAE5', color: '#059669', label: 'Done' };
    if (booking.status === 'no_show')   return { bg: '#F3F4F6', color: '#9CA3AF', label: 'No Show' };
    return { bg: '#DBEAFE', color: '#2563EB', label: 'Waiting' };
  };

  const formatTime = (d) => d?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
    </div>
  );

  if (!myBooking) return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Live Queue
          </h2>
        </div>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: COLORS.secondary, borderRadius: '50%',
          width: 80, height: 80, display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '2rem auto 1rem' }}>
          <Users size={40} color={COLORS.primary} />
        </div>
        <h3 style={{ color: COLORS.primary, marginBottom: '0.5rem' }}>No Active Booking</h3>
        <p style={{ color: COLORS.textLight, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          You don't have a confirmed booking for today
        </p>
        <button onClick={() => onNavigate('nearby-shops')}
          style={{ backgroundColor: COLORS.primary, color: 'white',
            padding: '0.75rem 2rem', borderRadius: '0.75rem',
            border: 'none', cursor: 'pointer', fontWeight: '600' }}>
          Book a Slot
        </button>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );

  const bookings   = queueData?.bookings || [];
  const summary    = queueData?.summary  || {};
  const myPosition = bookings.findIndex(b => b.token_number === myBooking.token_number) + 1;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Header ── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => onNavigate('home')}
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={24} />
            </button>
            <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Live Queue
            </h2>
          </div>
          <button onClick={() => fetchQueue()}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* My token hero */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', padding: '1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 0.25rem', fontSize: '0.8rem' }}>
              Your Token
            </p>
            <p style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
              #{myBooking.token_number}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
              Slot: {myBooking.slot_time}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {waitInfo && (
              <>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 0.25rem', fontSize: '0.8rem' }}>
                  Est. Wait
                </p>
                <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: '700', margin: 0, lineHeight: 1 }}>
                  ~{waitInfo.estimatedWaitMinutes}m
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
                  {waitInfo.queueAhead} ahead
                </p>
              </>
            )}
          </div>
        </div>

        {lastUpdated && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem',
            textAlign: 'center', marginTop: '0.5rem', marginBottom: 0 }}>
            Last updated: {formatTime(lastUpdated)}
          </p>
        )}
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total',     value: summary.total     || 0, color: COLORS.primary },
            { label: 'Waiting',   value: summary.confirmed || 0, color: '#2563EB'      },
            { label: 'Done',      value: summary.completed || 0, color: '#059669'      },
          ].map(({ label, value, color }) => (
            <Card key={label} style={{ padding: '0.75rem', textAlign: 'center' }}>
              <p style={{ color, fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.15rem' }}>
                {value}
              </p>
              <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: 0 }}>{label}</p>
            </Card>
          ))}
        </div>

        {/* ── AI congestion badge ── */}
        {queueData && (
          <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '0.75rem',
            backgroundColor: COLORS.secondary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={14} color={COLORS.primary} />
            <p style={{ color: COLORS.primary, fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>
              {summary.confirmed <= 5  ? '🟢 Very light — head over anytime'
               : summary.confirmed <= 15 ? '🟡 Moderate crowd — plan accordingly'
               : '🔴 Busy — consider waiting a bit before leaving'}
            </p>
          </div>
        )}

        {/* ── Token list ── */}
        <h3 style={{ color: COLORS.primary, fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>
          Today's Queue
        </h3>

        {bookings.length === 0 ? (
          <Card>
            <p style={{ color: COLORS.textLight, textAlign: 'center', padding: '1rem 0' }}>
              No bookings yet for today
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bookings.map((b) => {
              const tokenStatus = getTokenStatus(b.token_number);
              const statusStyle = getStatusStyle(b);
              const isMe        = tokenStatus === 'mine';

              return (
                <div key={b.id}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '0.75rem',
                    padding:        '0.875rem 1rem',
                    borderRadius:   '0.875rem',
                    backgroundColor: isMe ? COLORS.primary : 'white',
                    border:         isMe
                      ? `2px solid ${COLORS.primary}`
                      : `2px solid ${tokenStatus === 'ahead' && b.status !== 'completed'
                          ? '#E5E7EB' : 'transparent'}`,
                    opacity: b.status === 'completed' || b.status === 'no_show' ? 0.6 : 1,
                    position: 'relative',
                  }}>

                  {/* Token number circle */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : COLORS.secondary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      color:      isMe ? 'white' : COLORS.primary,
                      fontWeight: '700', fontSize: '0.9rem',
                    }}>
                      {b.token_number}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <p style={{
                        color:      isMe ? 'white' : COLORS.primary,
                        fontWeight: '600', margin: 0, fontSize: '0.875rem',
                      }}>
                        Token #{b.token_number}
                      </p>
                      {isMe && (
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.25)',
                          color: 'white', fontSize: '0.65rem', padding: '1px 6px',
                          borderRadius: '4px', fontWeight: '600' }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                      <Clock size={11} color={isMe ? 'rgba(255,255,255,0.7)' : COLORS.textLight} />
                      <p style={{
                        color: isMe ? 'rgba(255,255,255,0.7)' : COLORS.textLight,
                        margin: 0, fontSize: '0.75rem',
                      }}>
                        {b.slot_time}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : statusStyle.bg,
                    color:           isMe ? 'white'                  : statusStyle.color,
                    fontSize: '0.7rem', fontWeight: '600',
                    padding: '0.2rem 0.6rem', borderRadius: '0.4rem',
                  }}>
                    {b.status === 'completed' ? '✓ Done'
                     : b.status === 'no_show' ? 'No Show'
                     : isMe                   ? '⏳ You'
                     : tokenStatus === 'ahead' ? 'Ahead'
                     : 'After you'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Progress bar ── */}
        {bookings.length > 0 && myPosition > 0 && (
          <Card variant="lilac" className="mt-4">
            <p style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.875rem',
              margin: '0 0 0.5rem' }}>
              Your Position: {myPosition} of {bookings.length}
            </p>
            <div style={{ backgroundColor: 'rgba(94,64,117,0.15)', borderRadius: '0.5rem',
              height: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '0.5rem',
                backgroundColor: COLORS.primary,
                width: `${Math.min(100, (myPosition / bookings.length) * 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ color: `${COLORS.primary}99`, fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
              Auto-refreshes every 30 seconds
            </p>
          </Card>
        )}

      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
};

export default LiveQueueScreen;