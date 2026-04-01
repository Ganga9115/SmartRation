import React from 'react';
import { Home, Calendar, Bell, User } from 'lucide-react';
import { COLORS } from '../../utils/colors';

const NAV_ITEMS = [
  { key: 'home',          icon: Home,     label: 'Home'    },
  { key: 'slot-booking',  icon: Calendar, label: 'Book'    },
  { key: 'notifications', icon: Bell,     label: 'Alerts'  },
  { key: 'profile',       icon: User,     label: 'Profile' },
];

// Map child screens back to their parent nav tab
const SCREEN_TO_NAV = {
  'home':          'home',
  'stock':         'home',
  'my-bookings':   'nearby-shops',
  'slot-booking':  'slot-booking',
  'confirmation':  'nearby-shops',
  'live-queue':    'nearby-shops',
  'nearby-shops':  'nearby-shops',
  'notifications': 'notifications',
  'profile':       'profile',
  'ration-card':   'profile',
};

export const BottomNav = ({ active, onNavigate }) => {
  const activeKey = SCREEN_TO_NAV[active] || active;

  return (
    <nav style={{
      position:        'fixed',
      bottom:          0,
      left:            0,
      right:           0,
      backgroundColor: 'white',
      borderTop:       '1px solid #EDE9F6',
      display:         'grid',
      gridTemplateColumns: `repeat(${NAV_ITEMS.length}, 1fr)`,
      padding:         '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex:          100,
      boxShadow:       '0 -4px 20px rgba(94, 45, 145, 0.08)',
    }}>
      {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              gap:             '0.2rem',
              padding:         '0.4rem 0.5rem',
              background:      'none',
              border:          'none',
              cursor:          'pointer',
              transition:      'all 0.15s',
            }}
          >
            <div style={{
              padding:         '0.3rem 1rem',
              borderRadius:    '1rem',
              backgroundColor: isActive ? COLORS.secondary : 'transparent',
              transition:      'all 0.2s',
            }}>
              <Icon
                size={22}
                color={isActive ? COLORS.primary : '#B0A0C8'}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
            </div>
            <span style={{
              fontSize:   '0.6875rem',
              fontWeight: isActive ? '700' : '500',
              color:      isActive ? COLORS.primary : '#B0A0C8',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};