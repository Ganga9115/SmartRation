import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Clock, Package, Shield, Calendar, Gift, AlertCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { welfareAPI } from '../../utils/api';
import api from '../../utils/api';

// Map every alert_type to a label + icon + colors
const ALERT_CONFIG = {
  missed_collection:     { icon: Bell,         bg: '#DBEAFE', color: '#2563EB', label: 'Slot Reminder',       tab: 'Reminders' },
  booking_reminder_1day: { icon: Bell,         bg: '#DBEAFE', color: '#2563EB', label: 'Slot Reminder',       tab: 'Reminders' },
  booking_reminder_1hr:  { icon: Bell,         bg: '#DBEAFE', color: '#2563EB', label: 'Slot Reminder',       tab: 'Reminders' },
  booking_confirmed:     { icon: Calendar,     bg: '#EDE9FE', color: '#7C3AED', label: 'Booking Confirmed',   tab: 'Bookings'  },
  collection_missed:     { icon: AlertCircle,  bg: '#FEF3C7', color: '#B45309', label: 'Shop Timing Update',  tab: 'Reminders' },
  inactivity_warning:    { icon: Clock,        bg: '#FEF3C7', color: '#B45309', label: 'Inactivity Warning',  tab: 'Reminders' },
  fraud_flag:            { icon: Shield,       bg: '#FEE2E2', color: '#DC2626', label: 'Security Alert',      tab: 'Reminders' },
  stock_low:             { icon: Package,      bg: '#D1FAE5', color: '#059669', label: 'Stock Alert',         tab: 'Stock Updates' },
};

const TABS = ['All', 'Reminders', 'Stock Updates', 'Bookings'];

export const NotificationsScreen = ({ onNavigate }) => {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [marking, setMarking]     = useState(false);

  const fetchAlerts = () => {
    welfareAPI.getMyAlerts()
      .then(r => setAlerts(r.data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleMarkAllRead = async () => {
    const unresolved = alerts.filter(a => !a.is_resolved);
    if (!unresolved.length) return;
    setMarking(true);
    try {
      // Resolve each one individually using the existing resolve endpoint
      await Promise.all(
        unresolved.map(a =>
          api.put(`/welfare/alerts/${a.id}/resolve`)
        )
      );
      // Update local state — mark all as resolved
      setAlerts(prev => prev.map(a => ({ ...a, is_resolved: true })));
    } catch (err) {
      console.error('Mark all read error:', err.message);
    } finally {
      setMarking(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Filter by active tab
  const filtered = alerts.filter(a => {
    if (activeTab === 'All') return true;
    const cfg = ALERT_CONFIG[a.alert_type];
    return cfg?.tab === activeTab;
  });

  const unreadCount = alerts.filter(a => !a.is_resolved).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Notifications
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0 }}>
          Stay updated with latest alerts
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── Filter tabs ───────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.5rem', overflowX: 'auto',
          paddingBottom: '0.5rem', marginBottom: '1.25rem',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  flexShrink: 0, padding: '0.5rem 1.125rem',
                  borderRadius: '0.875rem', whiteSpace: 'nowrap',
                  fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer',
                  backgroundColor: isActive ? COLORS.primary : COLORS.surface,
                  color:           isActive ? 'white'        : COLORS.text,
                  border:          isActive ? 'none'         : `1px solid ${COLORS.border}`,
                }}>
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{
              backgroundColor: 'white', borderRadius: '1rem',
              height: '90px', marginBottom: '0.75rem',
              animation: 'pulse 2s infinite',
            }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0' }}>
            <div style={{ backgroundColor: COLORS.secondary, padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <Bell size={48} color={COLORS.primary} />
            </div>
            <h3 style={{ color: COLORS.primary, margin: '0 0 0.5rem 0' }}>No Notifications</h3>
            <p style={{ color: COLORS.textLight, textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>
              {activeTab === 'All'
                ? "You're all caught up! We'll notify you when there are updates."
                : `No ${activeTab.toLowerCase()} notifications`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(alert => {
              const cfg  = ALERT_CONFIG[alert.alert_type] || {
                icon: Bell, bg: COLORS.secondary, color: COLORS.primary, label: 'Alert',
              };
              const Icon = cfg.icon;
              const unread = !alert.is_resolved;

              return (
                <div key={alert.id} style={{
                  borderLeft: unread ? `4px solid ${COLORS.primary}` : 'none',
                  paddingLeft: unread ? '0.5rem' : '0',
                }}>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      {/* Icon badge */}
                      <div style={{
                        backgroundColor: cfg.bg, color: cfg.color,
                        padding: '0.75rem', borderRadius: '0.75rem',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>
                            {cfg.label}
                          </h4>
                          {unread && (
                            <div style={{
                              width: '8px', height: '8px', backgroundColor: COLORS.primary,
                              borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                            }} />
                          )}
                        </div>
                        <p style={{
                          color: COLORS.textLight, margin: '0 0 0.375rem 0',
                          fontSize: '0.875rem', lineHeight: '1.5',
                        }}>
                          {alert.message}
                        </p>
                        <p style={{ color: COLORS.textLight, fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
                          {timeAgo(alert.created_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Mark All as Read button ───────────────────────── */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            style={{
              width: '100%', marginTop: '1.5rem',
              padding: '0.875rem 1rem',
              backgroundColor: COLORS.surface,
              border: `2px solid ${COLORS.border}`,
              color: marking ? COLORS.textLight : COLORS.primary,
              borderRadius: '0.875rem', cursor: marking ? 'not-allowed' : 'pointer',
              fontSize: '1rem', fontWeight: '600',
              transition: 'transform 0.15s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {marking ? 'Marking as read...' : 'Mark All as Read'}
          </button>
        )}

      </div>

      <BottomNav active="notifications" onNavigate={onNavigate} />
    </div>
  );
};

export default NotificationsScreen;