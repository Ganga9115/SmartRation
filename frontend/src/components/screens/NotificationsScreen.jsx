// src/components/screens/NotificationsScreen.jsx

import React from 'react';
import { ArrowLeft, Bell, Package, Calendar, Gift, AlertCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';

export const NotificationsScreen = ({ onNavigate }) => {
  const notifications = [
    {
      id: 1,
      type: 'reminder',
      icon: Bell,
      title: 'Slot Reminder',
      message: 'Your slot is tomorrow at 10:00 AM at Fair Price Shop - Sector 12',
      time: '2 hours ago',
      read: false,
      bgColor: '#DBEAFE',
      iconColor: '#2563EB'
    },
    {
      id: 2,
      type: 'stock',
      icon: Package,
      title: 'Stock Update',
      message: 'Sugar is now available at your designated shop. Book your slot now!',
      time: '5 hours ago',
      read: false,
      bgColor: '#D1FAE5',
      iconColor: '#059669'
    },
    {
      id: 3,
      type: 'booking',
      icon: Calendar,
      title: 'Booking Confirmed',
      message: 'Your slot for 18 Dec, 10:00 AM has been confirmed. Token: TKN123456',
      time: '1 day ago',
      read: true,
      bgColor: COLORS.secondary,
      iconColor: COLORS.primary
    },
    {
      id: 4,
      type: 'festival',
      icon: Gift,
      title: 'Festival Distribution',
      message: 'Special festival quota available from 20-25 Dec. Additional sugar and rice allocation.',
      time: '1 day ago',
      read: true,
      bgColor: '#FED7AA',
      iconColor: '#EA580C'
    },
    {
      id: 5,
      type: 'alert',
      icon: AlertCircle,
      title: 'Shop Timing Update',
      message: 'Fair Price Shop - Sector 12 will open at 10:00 AM tomorrow due to maintenance.',
      time: '2 days ago',
      read: true,
      bgColor: '#FEF3C7',
      iconColor: '#B45309'
    },
    {
      id: 6,
      type: 'stock',
      icon: Package,
      title: 'Stock Alert',
      message: 'Limited stock of cooking oil. Book early to ensure availability.',
      time: '3 days ago',
      read: true,
      bgColor: '#D1FAE5',
      iconColor: '#059669'
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      paddingBottom: '6rem'
    },
    header: {
      backgroundColor: COLORS.primary,
      padding: '3rem 1.5rem 1.5rem 1.5rem'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    backButton: {
      color: COLORS.surface,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    },
    headerTitle: {
      color: COLORS.surface,
      flex: 1,
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.875rem'
    },
    content: {
      padding: '1.5rem'
    },
    filterTabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    filterButton: (isActive) => ({
      padding: '0.5rem 1rem',
      backgroundColor: isActive ? COLORS.primary : COLORS.surface,
      border: isActive ? 'none' : `1px solid ${COLORS.border}`,
      color: isActive ? COLORS.surface : COLORS.text,
      borderRadius: '0.75rem',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    notificationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    notificationCard: (isUnread) => ({
      borderLeft: isUnread ? `4px solid ${COLORS.primary}` : 'none',
      paddingLeft: isUnread ? '0.75rem' : '1rem'
    }),
    notificationContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem'
    },
    iconContainer: (bgColor, iconColor) => ({
      backgroundColor: bgColor,
      color: iconColor,
      padding: '0.75rem',
      borderRadius: '0.75rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    textContent: {
      flex: 1,
      minWidth: 0
    },
    titleRow: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '0.5rem',
      marginBottom: '0.25rem'
    },
    notificationTitle: {
      color: COLORS.primary,
      fontSize: '1rem',
      fontWeight: '600',
      margin: 0
    },
    unreadDot: {
      width: '0.5rem',
      height: '0.5rem',
      backgroundColor: COLORS.primary,
      borderRadius: '50%',
      flexShrink: 0,
      marginTop: '0.5rem'
    },
    notificationMessage: {
      color: COLORS.textLight,
      marginBottom: '0.5rem',
      lineHeight: '1.5',
      fontSize: '0.875rem',
      margin: '0 0 0.5rem 0'
    },
    notificationTime: {
      color: COLORS.textLight,
      opacity: 0.7,
      fontSize: '0.75rem',
      margin: 0
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 0'
    },
    emptyIconContainer: {
      backgroundColor: COLORS.secondary,
      padding: '1.5rem',
      borderRadius: '50%',
      marginBottom: '1rem'
    },
    emptyTitle: {
      color: COLORS.primary,
      marginBottom: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    emptyText: {
      color: COLORS.textLight,
      textAlign: 'center',
      fontSize: '0.875rem',
      margin: 0
    },
    markReadButton: {
      width: '100%',
      padding: '0.75rem 1rem',
      backgroundColor: COLORS.surface,
      border: `2px solid ${COLORS.border}`,
      color: COLORS.primary,
      borderRadius: '0.75rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'transform 0.2s',
      marginTop: '1.5rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button onClick={() => onNavigate('home')} style={styles.backButton}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={styles.headerTitle}>Notifications</h2>
        </div>
        <p style={styles.headerSubtitle}>Stay updated with latest alerts</p>
      </div>

      <div style={styles.content}>
        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <button style={styles.filterButton(true)}>
            All
          </button>
          <button style={styles.filterButton(false)}>
            Reminders
          </button>
          <button style={styles.filterButton(false)}>
            Stock Updates
          </button>
          <button style={styles.filterButton(false)}>
            Bookings
          </button>
        </div>

        {/* Notifications List */}
        <div style={styles.notificationsList}>
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} style={styles.notificationCard(!notification.read)}>
                <Card>
                  <div style={styles.notificationContent}>
                    {/* Icon */}
                    <div style={styles.iconContainer(notification.bgColor, notification.iconColor)}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div style={styles.textContent}>
                      <div style={styles.titleRow}>
                        <h4 style={styles.notificationTitle}>{notification.title}</h4>
                        {!notification.read && (
                          <div style={styles.unreadDot}></div>
                        )}
                      </div>
                      <p style={styles.notificationMessage}>
                        {notification.message}
                      </p>
                      <p style={styles.notificationTime}>{notification.time}</p>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty State (when no notifications) */}
        {notifications.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconContainer}>
              <Bell size={48} color={COLORS.primary} />
            </div>
            <h3 style={styles.emptyTitle}>No Notifications</h3>
            <p style={styles.emptyText}>
              You're all caught up! We'll notify you when there are updates.
            </p>
          </div>
        )}

        {/* Mark All Read */}
        {notifications.some(n => !n.read) && (
          <button 
            style={styles.markReadButton}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Mark All as Read
          </button>
        )}
      </div>

      <BottomNav active="notifications" onNavigate={onNavigate} />
    </div>
  );
};

export default NotificationsScreen;