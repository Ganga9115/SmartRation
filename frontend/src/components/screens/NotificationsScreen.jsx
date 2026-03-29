import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, AlertCircle, Clock, Package, Shield } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { welfareAPI } from '../../utils/api';

const ALERT_CONFIG = {
  missed_collection:  { icon: Bell,         bg: '#DBEAFE', color: '#2563EB', label: 'Missed Collection' },
  inactivity_warning: { icon: Clock,        bg: '#FEF3C7', color: '#B45309', label: 'Inactivity Warning' },
  fraud_flag:         { icon: Shield,       bg: '#FEE2E2', color: '#DC2626', label: 'Security Alert' },
  stock_low:          { icon: Package,      bg: '#D1FAE5', color: '#059669', label: 'Stock Alert' },
};

export const NotificationsScreen = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    welfareAPI.getMyAlerts()
      .then(r => setAlerts(r.data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Notifications
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
          {alerts.filter(a => !a.is_resolved).length} unread alerts
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-24 mb-3" />
          ))
        ) : alerts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0' }}>
            <div style={{ backgroundColor: COLORS.secondary, padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <Bell size={48} color={COLORS.primary} />
            </div>
            <h3 style={{ color: COLORS.primary, marginBottom: '0.5rem' }}>All caught up!</h3>
            <p style={{ color: COLORS.textLight, textAlign: 'center', fontSize: '0.875rem' }}>
              No notifications right now
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(alert => {
              const cfg = ALERT_CONFIG[alert.alert_type] || ALERT_CONFIG.stock_low;
              const Icon = cfg.icon;
              return (
                <div key={alert.id}
                  style={{ borderLeft: !alert.is_resolved ? `4px solid ${COLORS.primary}` : 'none',
                    paddingLeft: !alert.is_resolved ? '0.5rem' : '0' }}>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ backgroundColor: cfg.bg, color: cfg.color,
                        padding: '0.75rem', borderRadius: '0.75rem', flexShrink: 0 }}>
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>
                            {cfg.label}
                          </h4>
                          {!alert.is_resolved && (
                            <div style={{ width: '8px', height: '8px', backgroundColor: COLORS.primary,
                              borderRadius: '50%', flexShrink: 0, marginTop: '5px' }} />
                          )}
                        </div>
                        <p style={{ color: COLORS.textLight, margin: '0 0 0.5rem 0',
                          fontSize: '0.875rem', lineHeight: '1.5' }}>
                          {alert.message}
                        </p>
                        <p style={{ color: COLORS.textLight, fontSize: '0.75rem',
                          opacity: 0.7, margin: 0 }}>
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
      </div>
      <BottomNav active="notifications" onNavigate={onNavigate} />
    </div>
  );
};

export default NotificationsScreen;