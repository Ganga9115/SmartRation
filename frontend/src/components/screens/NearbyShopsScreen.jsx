// src/components/screens/NearbyShopsScreen.jsx

import React from 'react';
import { MapPin, Clock, ArrowLeft, Navigation } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';

export const NearbyShopsScreen = ({ onNavigate }) => {
  const shops = [
    {
      id: 1,
      name: 'Fair Price Shop - Sector 12',
      distance: '0.8 km',
      status: 'Open',
      stockStatus: 'Available',
      address: 'Shop No. 45, Sector 12, Near Market',
      timing: '9:00 AM - 6:00 PM'
    },
    {
      id: 2,
      name: 'PDS Store - Gandhi Nagar',
      distance: '1.2 km',
      status: 'Open',
      stockStatus: 'Limited',
      address: 'Gandhi Nagar Main Road, Block A',
      timing: '9:00 AM - 6:00 PM'
    },
    {
      id: 3,
      name: 'Ration Shop - MG Road',
      distance: '2.1 km',
      status: 'Closed',
      stockStatus: 'Not Available',
      address: 'MG Road, Near Post Office',
      timing: '9:00 AM - 6:00 PM'
    },
    {
      id: 4,
      name: 'Fair Price Shop - Nehru Colony',
      distance: '2.8 km',
      status: 'Open',
      stockStatus: 'Available',
      address: 'Nehru Colony, Ward 5',
      timing: '9:00 AM - 6:00 PM'
    }
  ];

  const getStockColor = (status) => {
    if (status === 'Available') return COLORS.success;
    if (status === 'Limited') return COLORS.warning;
    return COLORS.error;
  };

  const getStatusStyle = (status) => {
    return status === 'Open' 
      ? { backgroundColor: '#D1FAE5', color: '#059669' }
      : { backgroundColor: COLORS.background, color: COLORS.textLight };
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
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    locationCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    locationInfo: {
      flex: 1
    },
    locationTitle: {
      color: COLORS.primary,
      fontSize: '0.875rem',
      margin: 0
    },
    locationSubtitle: {
      color: `${COLORS.primary}B3`,
      fontSize: '0.875rem',
      margin: 0
    },
    changeButton: {
      color: COLORS.primary,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    shopsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    shopCard: {
      border: `2px solid transparent`,
      cursor: 'pointer',
      transition: 'border-color 0.2s'
    },
    shopContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    shopHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    shopInfo: {
      flex: 1
    },
    shopName: {
      color: COLORS.primary,
      marginBottom: '0.25rem',
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    shopAddress: {
      color: COLORS.textLight,
      fontSize: '0.875rem',
      margin: 0
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '0.75rem',
      borderTop: `1px solid ${COLORS.border}`
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    infoText: {
      color: COLORS.text,
      fontSize: '0.875rem'
    },
    statusBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    stockRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '0.5rem',
      borderTop: `1px solid ${COLORS.border}`
    },
    stockLabel: {
      color: COLORS.textLight,
      fontSize: '0.875rem'
    },
    stockStatus: {
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    bookButton: {
      width: '100%',
      backgroundColor: COLORS.primary,
      color: COLORS.surface,
      padding: '0.75rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: '0.5rem',
      transition: 'transform 0.2s'
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
          <h2 style={styles.headerTitle}>Nearby Ration Shops</h2>
        </div>
        <p style={styles.headerSubtitle}>Find shops near your location</p>
      </div>

      <div style={styles.content}>
        {/* Location Card */}
        <Card variant="lilac">
          <div style={styles.locationCard}>
            <Navigation color={COLORS.primary} size={20} />
            <div style={styles.locationInfo}>
              <p style={styles.locationTitle}>Current Location</p>
              <p style={styles.locationSubtitle}>Sector 12, Delhi</p>
            </div>
            <button style={styles.changeButton}>Change</button>
          </div>
        </Card>

        {/* Shops List */}
        <div style={styles.shopsList}>
          {shops.map((shop) => (
            <div 
              key={shop.id}
              onClick={() => onNavigate('slot-booking')}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.primary}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <Card>
                <div style={styles.shopContent}>
                  {/* Header */}
                  <div style={styles.shopHeader}>
                    <div style={styles.shopInfo}>
                      <h4 style={styles.shopName}>{shop.name}</h4>
                      <p style={styles.shopAddress}>{shop.address}</p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div style={styles.infoRow}>
                    <div style={styles.infoItem}>
                      <MapPin size={16} color={COLORS.primary} />
                      <span style={styles.infoText}>{shop.distance}</span>
                    </div>

                    <div style={styles.infoItem}>
                      <Clock size={16} color={COLORS.primary} />
                      <span style={{ ...styles.statusBadge, ...getStatusStyle(shop.status) }}>
                        {shop.status}
                      </span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div style={styles.stockRow}>
                    <span style={styles.stockLabel}>Stock Status:</span>
                    <span style={{ ...styles.stockStatus, color: getStockColor(shop.stockStatus) }}>
                      {shop.stockStatus}
                    </span>
                  </div>

                  {/* Action Button */}
                  {shop.status === 'Open' && shop.stockStatus !== 'Not Available' && (
                    <button 
                      style={styles.bookButton}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Book Slot
                    </button>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="nearby-shops" onNavigate={onNavigate} />
    </div>
  );
};

export default NearbyShopsScreen;