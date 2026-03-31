import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, Users, Clock, RefreshCw, Zap, CheckCircle, XCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { bookingAPI } from '../../utils/api';

const POLL_INTERVAL = 10000; // 10 seconds — fast enough to feel real-time

export const LiveQueueScreen = ({ onNavigate, params = {} }) => {
  const [queueData,   setQueueData]   = useState(null);
  const [myPosition,  setMyPosition]  = useState(null);
  const [myBooking,   setMyBooking]   = useState(params.booking || null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulse,       setPulse]       = useState(false);  // flash on update
  const prevAheadRef = useRef(null);

  const shopId = myBooking?.shop_id || myBooking?.shop?.id || params.shopId;
  const today  = new Date().toISOString().split('T')[0];

  // ── Load active booking if not passed ─────────────────
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

  // ── Fetch queue + my slot-aware position ──────────────
  const fetchQueue = useCallback(async (silent = false) => {
    if (!shopId || !myBooking?.token_number) return;
    if (!silent) setRefreshing(true);
    try {
      const [queueRes, posRes] = await Promise.all([
        bookingAPI.getQueueToday(shopId, today),
        bookingAPI.getMyPosition(shopId, today, myBooking.token_number),
      ]);

      setQueueData(queueRes.data);
      const newPos = posRes.data;

      // Flash pulse animation if queue moved
      if (prevAheadRef.current !== null && prevAheadRef.current !== newPos.people_ahead) {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }
      prevAheadRef.current = newPos.people_ahead;
      setMyPosition(newPos);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('fetchQueue error:', err.message);
    } finally {
      setRefreshing(false);
    }
  }, [shopId, today, myBooking?.token_number]);

  // Initial + auto-poll every 10s
  useEffect(() => {
    if (shopId && myBooking?.token_number) {
      fetchQueue();
      const interval = setInterval(() => fetchQueue(true), POLL_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [fetchQueue]);

  const formatTime = (d) =>
    d?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── Avg serve time from queue logs (rough estimate) ───
  const estWaitMins = myPosition
    ? Math.max(0, myPosition.people_ahead * 5)  // ~5 min per family
    : null;

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

  const bookings    = queueData?.bookings    || [];
  const activeQueue = queueData?.active_queue || [];
  const summary     = queueData?.summary     || {};
  const bySlot      = summary.by_slot        || {};

  // My slot bookings — people in my same time window
  const mySlotBookings = bookings.filter(b => b.slot_time === myBooking.slot_time);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Header ────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem' }}>
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
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem',
              opacity: refreshing ? 0.6 : 1 }}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* ── My token hero card ─────────────────────── */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', padding: '1rem',
          transition: 'background-color 0.3s',
          ...(pulse ? { backgroundColor: 'rgba(255,255,255,0.3)' } : {}),
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 0.25rem', fontSize: '0.8rem' }}>
                Your Token
              </p>
              <p style={{ color: 'white', fontSize: '2.75rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                #{myBooking.token_number}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.3rem 0 0', fontSize: '0.8rem' }}>
                Slot: {myBooking.slot_time?.slice(0,5)}
              </p>
            </div>

            {/* People ahead + est wait */}
            {myPosition && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.75rem',
                  padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: '700',
                    margin: 0, lineHeight: 1 }}>
                    {myPosition.people_ahead}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', margin: '0.15rem 0 0' }}>
                    ahead of you
                  </p>
                </div>
                {estWaitMins !== null && (
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', margin: 0 }}>
                    ~{estWaitMins} min wait
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {lastUpdated && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem',
            textAlign: 'center', marginTop: '0.5rem', marginBottom: 0 }}>
            Auto-updates every 10s · Last: {formatTime(lastUpdated)}
          </p>
        )}
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── Day summary ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '0.6rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Today', value: summary.total     || 0, color: COLORS.primary },
            { label: 'Waiting',     value: summary.confirmed || 0, color: '#2563EB'      },
            { label: 'Served',      value: summary.completed || 0, color: '#059669'      },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <p style={{ color, fontSize: '1.5rem', fontWeight: '700',
                margin: '0 0 0.15rem', textAlign: 'center' }}>{value}</p>
              <p style={{ color: COLORS.textLight, fontSize: '0.7rem',
                margin: 0, textAlign: 'center' }}>{label}</p>
            </Card>
          ))}
        </div>

        {/* ── Congestion badge ──────────────────────── */}
        {queueData && (
          <div style={{ marginBottom: '1.25rem', padding: '0.6rem 1rem',
            borderRadius: '0.75rem', backgroundColor: COLORS.secondary,
            display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={14} color={COLORS.primary} />
            <p style={{ color: COLORS.primary, fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>
              {(summary.confirmed || 0) <= 5
                ? '🟢 Very light — head over anytime'
                : (summary.confirmed || 0) <= 15
                ? '🟡 Moderate crowd — plan accordingly'
                : '🔴 Busy — consider waiting a bit'}
            </p>
          </div>
        )}

        {/* ── My slot section ───────────────────────── */}
        {myPosition && (
          <Card variant="lilac" className="mb-4">
            <h4 style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.75rem',
              fontSize: '0.9rem' }}>
              Your Slot: {myBooking.slot_time?.slice(0,5)}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: COLORS.primary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  {myPosition.same_slot_total}
                </p>
                <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: 0 }}>In slot</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#059669', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  {myPosition.same_slot_completed}
                </p>
                <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: 0 }}>Done</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#2563EB', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  {myPosition.same_slot_waiting}
                </p>
                <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: 0 }}>Waiting</p>
              </div>
            </div>

            {/* Slot progress bar */}
            <div style={{ backgroundColor: 'rgba(94,64,117,0.15)', borderRadius: '0.5rem',
              height: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '0.5rem',
                backgroundColor: '#059669',
                width: myPosition.same_slot_total > 0
                  ? `${(myPosition.same_slot_completed / myPosition.same_slot_total) * 100}%`
                  : '0%',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ color: `${COLORS.primary}88`, fontSize: '0.7rem', margin: '0.4rem 0 0' }}>
              {myPosition.same_slot_total > 0
                ? `${Math.round((myPosition.same_slot_completed / myPosition.same_slot_total) * 100)}% of your slot served`
                : 'No data yet'}
            </p>
          </Card>
        )}

        {/* ── Full queue list ───────────────────────── */}
        <h3 style={{ color: COLORS.primary, fontWeight: '600',
          marginBottom: '0.75rem', fontSize: '1rem' }}>
          Today's Full Queue
        </h3>
        <p style={{ color: COLORS.textLight, fontSize: '0.75rem', marginBottom: '1rem', marginTop: 0 }}>
          Ordered by slot time, then token number
        </p>

        {bookings.length === 0 ? (
          <Card>
            <p style={{ color: COLORS.textLight, textAlign: 'center', padding: '1rem 0' }}>
              No bookings for today yet
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bookings.map((b) => {
              const isMe        = b.token_number === myBooking.token_number;
              const isDone      = b.status === 'completed';
              const isNoShow    = b.status === 'no_show';
              const isMySlot    = b.slot_time === myBooking.slot_time;

              // Is this person truly ahead in the slot-aware queue?
              const slotTime    = b.slot_time || '';
              const mySlotTime  = myBooking.slot_time || '';
              const isAhead     = !isMe && !isDone && !isNoShow && (
                slotTime < mySlotTime ||
                (slotTime === mySlotTime && b.token_number < myBooking.token_number)
              );

              return (
                <div key={b.id} style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '0.75rem',
                  padding:         '0.75rem 1rem',
                  borderRadius:    '0.875rem',
                  backgroundColor: isMe ? COLORS.primary : 'white',
                  border:          isMe
                    ? `2px solid ${COLORS.primary}`
                    : isAhead
                    ? '2px solid #E5E7EB'
                    : '2px solid transparent',
                  opacity:         isDone || isNoShow ? 0.55 : 1,
                  transition:      'all 0.3s ease',
                }}>

                  {/* Token circle */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : COLORS.secondary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone
                      ? <CheckCircle size={18} color={isMe ? 'white' : '#059669'} />
                      : isNoShow
                      ? <XCircle size={18} color="#9CA3AF" />
                      : <span style={{ color: isMe ? 'white' : COLORS.primary,
                          fontWeight: '700', fontSize: '0.85rem' }}>
                          {b.token_number}
                        </span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <p style={{ color: isMe ? 'white' : COLORS.primary,
                        fontWeight: '600', margin: 0, fontSize: '0.85rem' }}>
                        Token #{b.token_number}
                      </p>
                      {isMe && (
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.25)',
                          color: 'white', fontSize: '0.6rem', padding: '1px 5px',
                          borderRadius: '3px', fontWeight: '700' }}>
                          YOU
                        </span>
                      )}
                      {isMySlot && !isMe && (
                        <span style={{ backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : COLORS.secondary,
                          color: COLORS.primary, fontSize: '0.6rem', padding: '1px 5px',
                          borderRadius: '3px', fontWeight: '600' }}>
                          same slot
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} color={isMe ? 'rgba(255,255,255,0.6)' : COLORS.textLight} />
                      <p style={{ color: isMe ? 'rgba(255,255,255,0.65)' : COLORS.textLight,
                        margin: 0, fontSize: '0.72rem' }}>
                        {b.slot_time?.slice(0,5)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: '0.68rem', fontWeight: '600',
                    padding: '0.2rem 0.55rem', borderRadius: '0.4rem',
                    backgroundColor: isDone      ? '#D1FAE5'
                                   : isNoShow    ? '#F3F4F6'
                                   : isMe        ? 'rgba(255,255,255,0.2)'
                                   : isAhead     ? '#DBEAFE'
                                   : COLORS.secondary,
                    color:           isDone      ? '#059669'
                                   : isNoShow    ? '#9CA3AF'
                                   : isMe        ? 'white'
                                   : isAhead     ? '#2563EB'
                                   : `${COLORS.primary}99`,
                  }}>
                    {isDone    ? '✓ Done'
                   : isNoShow  ? 'No Show'
                   : isMe      ? '⏳ You'
                   : isAhead   ? 'Ahead'
                   : 'After you'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Overall position bar ─────────────────── */}
        {myPosition && bookings.length > 0 && (
          <Card variant="lilac" className="mt-4">
            <p style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.85rem',
              margin: '0 0 0.4rem' }}>
              Overall: {myPosition.people_ahead} people ahead of you today
            </p>
            <div style={{ backgroundColor: 'rgba(94,64,117,0.15)', borderRadius: '0.5rem',
              height: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '0.5rem', backgroundColor: COLORS.primary,
                width: bookings.length > 0
                  ? `${Math.min(100, ((bookings.length - myPosition.people_ahead) / bookings.length) * 100)}%`
                  : '0%',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ color: `${COLORS.primary}77`, fontSize: '0.68rem', margin: '0.35rem 0 0' }}>
              Updates every 10 seconds automatically
            </p>
          </Card>
        )}

      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
};

export default LiveQueueScreen;