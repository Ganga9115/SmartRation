// frontend/src/components/screens/SpecialEventsScreen.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Calendar, Clock, Users, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { BottomNav } from '../shared/ButtomNav';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';

const eventsAPI = {
  getUpcoming:     ()    => api.get('/events/upcoming'),
  generateToken:   (id)  => api.post(`/events/${id}/generate-token`),
  getMyTokens:     ()    => api.get('/events/my-tokens'),
  cancelToken:     (id)  => api.put(`/events/tokens/${id}/cancel`),
};

export const SpecialEventsScreen = ({ onNavigate }) => {
  const { rationCard } = useAuth();
  const [events, setEvents]       = useState([]);
  const [myTokens, setMyTokens]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(null);   // event id being generated
  const [tab, setTab]             = useState('events'); // 'events' | 'my-tokens'
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [evRes, tokRes] = await Promise.all([
        eventsAPI.getUpcoming(),
        eventsAPI.getMyTokens(),
      ]);
      setEvents(evRes.data.events || []);
      setMyTokens(tokRes.data.tokens || []);
    } catch (err) {
      console.error('SpecialEventsScreen fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleGenerate = async (eventId) => {
    setGenerating(eventId);
    try {
      const res = await eventsAPI.generateToken(eventId);
      showToast(`Token #${res.data.token.token_number} generated! Date: ${res.data.token.assigned_date}`);
      await fetchAll();
      setTab('my-tokens');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate token';
      showToast(msg, 'error');
    } finally {
      setGenerating(null);
    }
  };

  const handleCancel = async (tokenId) => {
    if (!confirm('Cancel this token?')) return;
    try {
      await eventsAPI.cancelToken(tokenId);
      showToast('Token cancelled');
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const isEventActive = (e) => {
    const today = new Date().toISOString().split('T')[0];
    return today >= e.start_date && today <= e.end_date && e.is_active;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
          color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
          fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => onNavigate('home')}
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={24} />
            </button>
            <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Special Events
            </h2>
          </div>
          <button onClick={fetchAll}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', margin: 0, paddingLeft: '2.25rem' }}>
          Pongal, festivals & special distributions
        </p>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '0.75rem', padding: '0.25rem',
          marginTop: '1rem',
        }}>
          {[
            { key: 'events',    label: 'Events' },
            { key: 'my-tokens', label: `My Tokens${myTokens.length > 0 ? ` (${myTokens.length})` : ''}` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding: '0.5rem', borderRadius: '0.5rem', border: 'none',
                backgroundColor: tab === key ? 'white' : 'transparent',
                color: tab === key ? COLORS.primary : 'rgba(255,255,255,0.8)',
                fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── No ration card warning ────────────────────────── */}
        {!rationCard && (
          <div style={{
            backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: '1rem', padding: '1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ color: '#92400E', fontWeight: '600', margin: 0, fontSize: '0.875rem' }}>
              Register a ration card to generate tokens
            </p>
            <button onClick={() => onNavigate('ration-card')}
              style={{ backgroundColor: '#92400E', color: 'white', border: 'none',
                borderRadius: '0.5rem', padding: '0.375rem 0.75rem',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
              Register
            </button>
          </div>
        )}

        {/* ══ EVENTS TAB ══════════════════════════════════════ */}
        {tab === 'events' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', height: 160, opacity: 0.6 }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                backgroundColor: COLORS.secondary, borderRadius: '50%',
                width: 80, height: 80, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <Gift size={36} color={COLORS.primary} />
              </div>
              <h3 style={{ color: COLORS.primary, margin: '0 0 0.5rem' }}>No Events Right Now</h3>
              <p style={{ color: COLORS.textLight, fontSize: '0.875rem', margin: 0 }}>
                Special events like Pongal distribution will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map(event => {
                const active  = isEventActive(event);
                const myToken = myTokens.find(t => t.event_id === event.id && t.status !== 'cancelled');
                const fillPct = event.tokens_issued && (event.tokens_per_day)
                  ? Math.min(100, Math.round((event.tokens_issued / (event.tokens_per_day * getDayCount(event.start_date, event.end_date))) * 100))
                  : 0;

                return (
                  <div key={event.id} style={{
                    backgroundColor: 'white', borderRadius: '1.25rem',
                    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: myToken ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                  }}>
                    {/* Top gradient bar */}
                    <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.primary}, #8B6FA8)` }} />

                    <div style={{ padding: '1.25rem' }}>
                      {/* Title row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.25rem', fontSize: '1rem' }}>
                            {event.name}
                          </h3>
                          <p style={{ color: COLORS.textLight, fontSize: '0.8125rem', margin: 0 }}>
                            {event.Shop?.name}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.625rem',
                          borderRadius: '0.5rem', flexShrink: 0,
                          backgroundColor: active ? '#D1FAE5' : event.status_label === 'upcoming' ? '#DBEAFE' : '#F3F4F6',
                          color: active ? '#059669' : event.status_label === 'upcoming' ? '#2563EB' : '#6B7280',
                        }}>
                          {active ? '● Active' : event.status_label === 'upcoming' ? '● Upcoming' : '● Ended'}
                        </span>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p style={{ color: COLORS.textLight, fontSize: '0.8125rem', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                          {event.description}
                        </p>
                      )}

                      {/* Date + time */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} color={COLORS.primary} />
                          <span style={{ color: COLORS.text, fontSize: '0.8125rem' }}>
                            {formatDate(event.start_date)} – {formatDate(event.end_date)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} color={COLORS.primary} />
                          <span style={{ color: COLORS.text, fontSize: '0.8125rem' }}>
                            {event.open_time?.slice(0,5)} – {event.close_time?.slice(0,5)}
                          </span>
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ color: COLORS.textLight, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={12} /> {event.tokens_issued || 0} tokens taken
                          </span>
                          <span style={{ color: COLORS.textLight, fontSize: '0.75rem' }}>
                            {event.slots_remaining} spots left
                          </span>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', borderRadius: '0.5rem', height: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '0.5rem',
                            backgroundColor: fillPct > 80 ? '#DC2626' : COLORS.primary,
                            width: `${fillPct}%`, transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>

                      {/* Already has token */}
                      {myToken ? (
                        <div style={{
                          backgroundColor: COLORS.secondary, borderRadius: '0.875rem',
                          padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <CheckCircle size={16} color='#059669' />
                              <span style={{ color: COLORS.primary, fontWeight: '700', fontSize: '0.9rem' }}>
                                Token #{myToken.token_number}
                              </span>
                            </div>
                            <p style={{ color: COLORS.textLight, fontSize: '0.75rem', margin: 0 }}>
                              {formatDate(myToken.assigned_date)} · {myToken.slot_time?.slice(0,5)}
                            </p>
                          </div>
                          <button onClick={() => { setTab('my-tokens'); }}
                            style={{ color: COLORS.primary, background: 'none', border: 'none',
                              cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                            View →
                          </button>
                        </div>
                      ) : active && !event.is_fully_booked && rationCard ? (
                        <button
                          onClick={() => handleGenerate(event.id)}
                          disabled={generating === event.id}
                          style={{
                            width: '100%', backgroundColor: generating === event.id ? '#B0A0C8' : COLORS.primary,
                            color: 'white', padding: '0.875rem', borderRadius: '0.875rem',
                            border: 'none', cursor: generating === event.id ? 'not-allowed' : 'pointer',
                            fontWeight: '700', fontSize: '0.9375rem',
                            boxShadow: generating === event.id ? 'none' : `0 4px 16px ${COLORS.primary}40`,
                          }}
                        >
                          {generating === event.id ? 'Generating...' : '🎟 Generate My Token'}
                        </button>
                      ) : event.is_fully_booked ? (
                        <div style={{
                          backgroundColor: '#FEF2F2', borderRadius: '0.875rem',
                          padding: '0.75rem', textAlign: 'center',
                          color: '#DC2626', fontWeight: '600', fontSize: '0.875rem',
                        }}>
                          All tokens fully booked
                        </div>
                      ) : !active ? (
                        <div style={{
                          backgroundColor: '#EFF6FF', borderRadius: '0.875rem',
                          padding: '0.75rem', textAlign: 'center',
                          color: '#2563EB', fontWeight: '600', fontSize: '0.875rem',
                        }}>
                          {event.status_label === 'upcoming' ? `Opens on ${formatDate(event.start_date)}` : 'Event ended'}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ══ MY TOKENS TAB ═══════════════════════════════════ */}
        {tab === 'my-tokens' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', height: 140, opacity: 0.6 }} />
              ))}
            </div>
          ) : myTokens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                backgroundColor: COLORS.secondary, borderRadius: '50%',
                width: 80, height: 80, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <Gift size={36} color={COLORS.primary} />
              </div>
              <h3 style={{ color: COLORS.primary, margin: '0 0 0.5rem' }}>No Tokens Yet</h3>
              <p style={{ color: COLORS.textLight, fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
                Generate a token from an active event
              </p>
              <button onClick={() => setTab('events')}
                style={{ backgroundColor: COLORS.primary, color: 'white', border: 'none',
                  padding: '0.75rem 2rem', borderRadius: '0.875rem', cursor: 'pointer', fontWeight: '600' }}>
                View Events
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myTokens.map(token => {
                const event = token.SpecialEvent;
                const statusColor = {
                  active:    { bg: '#DBEAFE', color: '#2563EB', label: 'Active' },
                  used:      { bg: '#D1FAE5', color: '#059669', label: 'Used' },
                  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
                  no_show:   { bg: '#FEE2E2', color: '#DC2626', label: 'No Show' },
                }[token.status] || { bg: '#F3F4F6', color: '#6B7280', label: token.status };

                return (
                  <div key={token.id} style={{
                    backgroundColor: 'white', borderRadius: '1.25rem',
                    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    opacity: token.status === 'cancelled' ? 0.65 : 1,
                  }}>
                    <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.primary}, #8B6FA8)` }} />

                    <div style={{ padding: '1.25rem' }}>
                      {/* Token number + status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                        <div>
                          <p style={{ color: COLORS.textLight, fontSize: '0.75rem', margin: '0 0 0.2rem' }}>Token Number</p>
                          <h2 style={{ color: COLORS.primary, fontSize: '2rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                            #{token.token_number}
                          </h2>
                        </div>
                        <span style={{
                          backgroundColor: statusColor.bg, color: statusColor.color,
                          fontSize: '0.75rem', fontWeight: '700',
                          padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                        }}>
                          {statusColor.label}
                        </span>
                      </div>

                      {/* Event name */}
                      <p style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.5rem', fontSize: '0.9375rem' }}>
                        {event?.name}
                      </p>
                      <p style={{ color: COLORS.textLight, fontSize: '0.8125rem', margin: '0 0 0.875rem' }}>
                        {event?.Shop?.name}
                      </p>

                      {/* Date + slot */}
                      <div style={{
                        backgroundColor: COLORS.secondary, borderRadius: '0.875rem',
                        padding: '0.75rem 1rem', display: 'flex', gap: '1.5rem', marginBottom: '0.875rem',
                      }}>
                        <div>
                          <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: '0 0 0.2rem' }}>Date</p>
                          <p style={{ color: COLORS.primary, fontWeight: '700', margin: 0, fontSize: '0.875rem' }}>
                            {formatDate(token.assigned_date)}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: COLORS.textLight, fontSize: '0.7rem', margin: '0 0 0.2rem' }}>Time Slot</p>
                          <p style={{ color: COLORS.primary, fontWeight: '700', margin: 0, fontSize: '0.875rem' }}>
                            {token.slot_time?.slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      {/* QR code */}
                      {token.qr_code && token.status === 'active' && (
                        <div style={{ textAlign: 'center', marginBottom: '0.875rem' }}>
                          <div style={{ backgroundColor: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '0.75rem', padding: '0.75rem', display: 'inline-block' }}>
                            <img src={token.qr_code} alt="QR Code" style={{ width: 120, height: 120 }} />
                          </div>
                          <p style={{ color: COLORS.textLight, fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                            Show this QR at the shop
                          </p>
                        </div>
                      )}

                      {/* Cancel button */}
                      {token.status === 'active' && (
                        <button onClick={() => handleCancel(token.id)}
                          style={{
                            width: '100%', backgroundColor: '#FEF2F2', color: '#DC2626',
                            border: '1px solid #FECACA', borderRadius: '0.875rem',
                            padding: '0.75rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
                          }}>
                          Cancel Token
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
};

export default SpecialEventsScreen;

// Helper
function getDayCount(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  let count   = 0;
  const cur   = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count || 1;
}