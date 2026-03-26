// src/components/screens/StockScreen.jsx

import React from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';

export const StockScreen = ({ onNavigate }) => {
  const stockItems = [
    {
      id: 1,
      name: 'Rice',
      entitlement: '5 kg',
      available: 'Available',
      icon: '🌾',
      status: 'available'
    },
    {
      id: 2,
      name: 'Wheat',
      entitlement: '5 kg',
      available: 'Available',
      icon: '🌾',
      status: 'available'
    },
    {
      id: 3,
      name: 'Sugar',
      entitlement: '2 kg',
      available: 'Limited Stock',
      icon: '🍬',
      status: 'limited'
    },
    {
      id: 4,
      name: 'Cooking Oil',
      entitlement: '1 liter',
      available: 'Available',
      icon: '🛢️',
      status: 'available'
    },
    {
      id: 5,
      name: 'Kerosene',
      entitlement: '3 liters',
      available: 'Out of Stock',
      icon: '⛽',
      status: 'unavailable'
    },
    {
      id: 6,
      name: 'Salt',
      entitlement: '1 kg',
      available: 'Available',
      icon: '🧂',
      status: 'available'
    }
  ];

  const getStatusIcon = (status) => {
    if (status === 'available') return <CheckCircle size={20} style={{ color: COLORS.success }} />;
    if (status === 'limited') return <AlertCircle size={20} style={{ color: COLORS.warning }} />;
    return <XCircle size={20} style={{ color: COLORS.error }} />;
  };

  const getStatusColor = (status) => {
    if (status === 'available') return COLORS.success;
    if (status === 'limited') return COLORS.warning;
    return COLORS.error;
  };

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
    updateRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    updateText: {
      color: COLORS.textLight,
      fontSize: '0.875rem',
      margin: 0
    },
    stockList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    stockItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    iconContainer: {
      backgroundColor: COLORS.secondary,
      padding: '0.75rem',
      borderRadius: '0.75rem'
    },
    icon: {
      fontSize: '1.5rem'
    },
    itemInfo: {
      flex: 1
    },
    itemName: {
      color: COLORS.primary,
      marginBottom: '0.25rem',
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    itemEntitlement: {
      color: COLORS.textLight,
      fontSize: '0.875rem',
      margin: 0
    },
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.25rem'
    },
    statusText: {
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    actionButton: {
      width: '100%',
      backgroundColor: COLORS.primary,
      color: COLORS.surface,
      padding: '1rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'transform 0.2s',
      marginTop: '1.5rem'
    },
    changeButton: {
      color: COLORS.primary,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
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
          <h2 style={styles.headerTitle}>Stock Availability</h2>
        </div>
        <p style={styles.headerSubtitle}>Check available items at your shop</p>
      </div>

      <div style={styles.content}>
        {/* Shop Info Card */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card variant="lilac">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ color: COLORS.primary, marginBottom: '0.25rem', fontSize: '1rem', fontWeight: '600' }}>
                  Fair Price Shop - Sector 12
                </h4>
                <p style={{ color: `${COLORS.primary}B3`, fontSize: '0.875rem', margin: 0 }}>
                  0.8 km away
                </p>
              </div>
              <button 
                onClick={() => onNavigate('nearby-shops')}
                style={styles.changeButton}
              >
                Change
              </button>
            </div>
          </Card>
        </div>

        {/* Last Updated */}
        <div style={styles.updateRow}>
          <p style={styles.updateText}>Your Entitlement</p>
          <p style={styles.updateText}>Updated: Today, 2:30 PM</p>
        </div>

        {/* Stock Items List */}
        <div style={styles.stockList}>
          {stockItems.map((item) => (
            <Card key={item.id}>
              <div style={styles.stockItem}>
                {/* Icon */}
                <div style={styles.iconContainer}>
                  <span style={styles.icon}>{item.icon}</span>
                </div>

                {/* Item Info */}
                <div style={styles.itemInfo}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <p style={styles.itemEntitlement}>Entitlement: {item.entitlement}</p>
                </div>

                {/* Status */}
                <div style={styles.statusContainer}>
                  {getStatusIcon(item.status)}
                  <span style={{ ...styles.statusText, color: getStatusColor(item.status) }}>
                    {item.available}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onNavigate('slot-booking')}
          style={styles.actionButton}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Book Slot to Collect
        </button>

        {/* Info Note */}
        <div style={{ marginTop: '1rem' }}>
          <Card variant="lilac">
            <p style={{ color: COLORS.primary, textAlign: 'center', margin: 0, fontSize: '0.875rem' }}>
              Stock availability is updated in real-time. Please book your slot in advance to ensure availability.
            </p>
          </Card>
        </div>
      </div>

      <BottomNav active="stock" onNavigate={onNavigate} />
    </div>
  );
};

export default StockScreen;