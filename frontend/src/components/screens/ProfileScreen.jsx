// src/components/screens/ProfileScreen.jsx

import React from 'react';
import { ArrowLeft, User, CreditCard, Users, MapPin, Globe, HelpCircle, MessageSquare, LogOut, ChevronRight } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';

export const ProfileScreen = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 1,
      icon: Globe,
      title: 'Language / भाषा',
      subtitle: 'English',
      action: 'language'
    },
    {
      id: 2,
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'FAQs, Contact us',
      action: 'help'
    },
    {
      id: 3,
      icon: MessageSquare,
      title: 'Feedback & Complaints',
      subtitle: 'Share your experience',
      action: 'feedback'
    }
  ];

  const familyMembers = [
    { name: 'Rajesh Kumar', relation: 'Head of Family' },
    { name: 'Sunita Kumar', relation: 'Spouse' },
    { name: 'Amit Kumar', relation: 'Son' },
    { name: 'Priya Kumar', relation: 'Daughter' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      paddingBottom: '6rem'
    },
    header: {
      backgroundColor: COLORS.primary,
      padding: '3rem 1.5rem 2rem 1.5rem'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem'
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
    profileCardWrapper: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '1rem',
      padding: '1rem'
    },
    profileContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    profileIcon: {
      backgroundColor: COLORS.surface,
      padding: '1rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    profileInfo: {
      flex: 1
    },
    profileName: {
      color: COLORS.surface,
      marginBottom: '0.25rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    profilePhone: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      margin: 0
    },
    content: {
      padding: '0 1.5rem',
      marginTop: '-1rem'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    sectionTitle: {
      color: COLORS.primary,
      fontSize: '1rem',
      fontWeight: '600',
      margin: 0
    },
    detailsBox: {
      backgroundColor: COLORS.secondary,
      padding: '1rem',
      borderRadius: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    detailLabel: {
      color: `${COLORS.primary}B3`,
      fontSize: '0.875rem'
    },
    detailValue: {
      color: COLORS.primary,
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    statusActive: {
      color: COLORS.success,
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    familyMembersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    familyMember: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: COLORS.background,
      borderRadius: '0.75rem'
    },
    memberIcon: {
      backgroundColor: COLORS.secondary,
      padding: '0.5rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    memberInfo: {
      flex: 1
    },
    memberName: {
      color: COLORS.primary,
      fontSize: '0.875rem',
      fontWeight: '500',
      margin: 0
    },
    memberRelation: {
      color: COLORS.textLight,
      fontSize: '0.875rem',
      margin: 0
    },
    shopBox: {
      backgroundColor: COLORS.secondary,
      padding: '1rem',
      borderRadius: '0.75rem'
    },
    shopName: {
      color: COLORS.primary,
      marginBottom: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    shopAddress: {
      color: `${COLORS.primary}B3`,
      fontSize: '0.875rem',
      margin: 0
    },
    shopDistance: {
      color: `${COLORS.primary}B3`,
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      margin: '0.5rem 0 0 0'
    },
    menuList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: '2px solid transparent',
      transition: 'border-color 0.2s',
      cursor: 'pointer'
    },
    menuIconContainer: {
      backgroundColor: COLORS.secondary,
      padding: '0.75rem',
      borderRadius: '0.75rem'
    },
    menuContent: {
      flex: 1
    },
    menuTitle: {
      color: COLORS.primary,
      marginBottom: '0.25rem',
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    menuSubtitle: {
      color: COLORS.textLight,
      fontSize: '0.875rem',
      margin: 0
    },
    appInfo: {
      textAlign: 'center'
    },
    appInfoText: {
      color: `${COLORS.primary}B3`,
      marginBottom: '0.25rem',
      fontSize: '0.875rem',
      margin: '0 0 0.25rem 0'
    },
    appInfoTitle: {
      color: COLORS.primary,
      fontSize: '0.875rem',
      fontWeight: '500',
      margin: 0
    },
    appInfoCopyright: {
      color: `${COLORS.primary}B3`,
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      margin: '0.5rem 0 0 0'
    },
    logoutButton: {
      width: '100%',
      backgroundColor: COLORS.surface,
      border: '2px solid #FECACA',
      color: '#DC2626',
      padding: '1rem',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'transform 0.2s',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
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
          <h2 style={styles.headerTitle}>Profile & Settings</h2>
        </div>

        {/* Profile Card */}
        <div style={styles.profileCardWrapper}>
          <div style={styles.profileContent}>
            <div style={styles.profileIcon}>
              <User size={32} color={COLORS.primary} />
            </div>
            <div style={styles.profileInfo}>
              <h3 style={styles.profileName}>Rajesh Kumar</h3>
              <p style={styles.profilePhone}>+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Ration Card Details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card>
            <div style={styles.sectionHeader}>
              <CreditCard color={COLORS.primary} size={20} />
              <h4 style={styles.sectionTitle}>Ration Card Details</h4>
            </div>
            
            <div style={styles.detailsBox}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Card Number</span>
                <span style={styles.detailValue}>XXXX XXXX 1234</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Card Type</span>
                <span style={styles.detailValue}>APL (Above Poverty Line)</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>
                <span style={styles.statusActive}>Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Family Members */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card>
            <div style={styles.sectionHeader}>
              <Users color={COLORS.primary} size={20} />
              <h4 style={styles.sectionTitle}>Family Members</h4>
            </div>
            
            <div style={styles.familyMembersList}>
              {familyMembers.map((member, index) => (
                <div key={index} style={styles.familyMember}>
                  <div style={styles.memberIcon}>
                    <User size={16} color={COLORS.primary} />
                  </div>
                  <div style={styles.memberInfo}>
                    <p style={styles.memberName}>{member.name}</p>
                    <p style={styles.memberRelation}>{member.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Registered Shop */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card>
            <div style={styles.sectionHeader}>
              <MapPin color={COLORS.primary} size={20} />
              <h4 style={styles.sectionTitle}>Registered Shop</h4>
            </div>
            
            <div style={styles.shopBox}>
              <p style={styles.shopName}>Fair Price Shop - Sector 12</p>
              <p style={styles.shopAddress}>Shop No. 45, Sector 12, Near Market</p>
              <p style={styles.shopDistance}>Distance: 0.8 km</p>
            </div>
          </Card>
        </div>

        {/* Settings Menu */}
        <div style={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <Card>
                  <div style={styles.menuItem}>
                    <div style={styles.menuIconContainer}>
                      <Icon color={COLORS.primary} size={20} />
                    </div>
                    <div style={styles.menuContent}>
                      <h4 style={styles.menuTitle}>{item.title}</h4>
                      <p style={styles.menuSubtitle}>{item.subtitle}</p>
                    </div>
                    <ChevronRight color={COLORS.textLight} size={20} />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* App Info */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card variant="lilac">
            <div style={styles.appInfo}>
              <p style={styles.appInfoText}>SmartRation v1.0.0</p>
              <p style={styles.appInfoTitle}>Public Distribution System App</p>
              <p style={styles.appInfoCopyright}>© 2024 Government of India</p>
            </div>
          </Card>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => onNavigate('login')}
          style={styles.logoutButton}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
};

export default ProfileScreen;