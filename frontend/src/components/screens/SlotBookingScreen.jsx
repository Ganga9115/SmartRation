// src/components/screens/SlotBookingScreen.jsx

import React, { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import {Card} from '../shared/Card';
import {Button} from '../shared/Button';
import {BottomNav} from '../shared/ButtomNav';

export const SlotBookingScreen = ({ onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Generate next 7 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return dates;
  };

  const timeSlots = [
    { id: 1, time: '9:00 AM - 10:00 AM', waiting: '5 mins', available: true },
    { id: 2, time: '10:00 AM - 11:00 AM', waiting: '10 mins', available: true },
    { id: 3, time: '11:00 AM - 12:00 PM', waiting: '8 mins', available: true },
    { id: 4, time: '12:00 PM - 1:00 PM', waiting: 'Lunch Break', available: false },
    { id: 5, time: '2:00 PM - 3:00 PM', waiting: '12 mins', available: true },
    { id: 6, time: '3:00 PM - 4:00 PM', waiting: '6 mins', available: true },
    { id: 7, time: '4:00 PM - 5:00 PM', waiting: '15 mins', available: true },
    { id: 8, time: '5:00 PM - 6:00 PM', waiting: 'Fully Booked', available: false }
  ];

  const dates = getDates();

  const handleBooking = () => {
    if (selectedDate && selectedSlot) {
      const slot = timeSlots.find(s => s.id.toString() === selectedSlot);
      onNavigate('confirmation', {
        date: selectedDate,
        time: slot?.time,
        tokenNumber: 'TKN' + Math.floor(100000 + Math.random() * 900000),
        shopName: 'Fair Price Shop - Sector 12'
      });
    }
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
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    sectionTitle: {
      color: COLORS.primary,
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: 0
    },
    dateContainer: {
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    dateButton: (isSelected) => ({
      flexShrink: 0,
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
      backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
      color: isSelected ? COLORS.surface : COLORS.text,
      cursor: 'pointer',
      transition: 'all 0.2s',
      minWidth: '80px'
    }),
    dateText: (isSelected) => ({
      textAlign: 'center',
      color: isSelected ? 'rgba(255, 255, 255, 0.7)' : COLORS.textLight,
      fontSize: '0.75rem',
      margin: 0
    }),
    dateNum: {
      marginTop: '0.25rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0.25rem 0'
    },
    timeSlotGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem'
    },
    timeSlotButton: (isSelected, isAvailable) => ({
      padding: '1rem',
      borderRadius: '0.75rem',
      border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
      backgroundColor: isSelected ? COLORS.primary : isAvailable ? COLORS.surface : COLORS.background,
      color: isSelected ? COLORS.surface : isAvailable ? COLORS.text : COLORS.textLight,
      cursor: isAvailable ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
      textAlign: 'left'
    }),
    slotTime: (isSelected) => ({
      color: isSelected ? COLORS.surface : COLORS.primary,
      fontSize: '0.875rem',
      fontWeight: '500',
      margin: 0
    }),
    slotWaiting: (isSelected, isAvailable) => ({
      marginTop: '0.5rem',
      color: isSelected ? 'rgba(255, 255, 255, 0.7)' : isAvailable ? COLORS.textLight : COLORS.textLight,
      fontSize: '0.75rem',
      margin: '0.5rem 0 0 0'
    })
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button 
            onClick={() => onNavigate('nearby-shops')} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={styles.headerTitle}>Book Your Slot</h2>
        </div>
        <p style={styles.headerSubtitle}>Choose date and time</p>
      </div>

      <div style={styles.content}>
        {/* Shop Info */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card variant="lilac">
            <h4 style={{ color: COLORS.primary, marginBottom: '0.25rem', fontSize: '1rem', fontWeight: '600' }}>
              Fair Price Shop - Sector 12
            </h4>
            <p style={{ color: `${COLORS.primary}B3`, fontSize: '0.875rem', margin: 0 }}>
              Shop No. 45, Sector 12, Near Market
            </p>
          </Card>
        </div>

        {/* Date Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={styles.sectionHeader}>
            <CalendarIcon size={20} color={COLORS.primary} />
            <h3 style={styles.sectionTitle}>Select Date</h3>
          </div>
          
          <div style={styles.dateContainer}>
            {dates.map((date) => (
              <button
                key={date.date}
                onClick={() => setSelectedDate(date.date)}
                style={styles.dateButton(selectedDate === date.date)}
              >
                <div>
                  <p style={styles.dateText(selectedDate === date.date)}>
                    {date.day}
                  </p>
                  <p style={styles.dateNum}>{date.dayNum}</p>
                  <p style={styles.dateText(selectedDate === date.date)}>
                    {date.month}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <div style={styles.sectionHeader}>
              <Clock size={20} color={COLORS.primary} />
              <h3 style={styles.sectionTitle}>Select Time Slot</h3>
            </div>

            <div style={styles.timeSlotGrid}>
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot.id.toString())}
                  disabled={!slot.available}
                  style={styles.timeSlotButton(
                    selectedSlot === slot.id.toString(),
                    slot.available
                  )}
                >
                  <p style={styles.slotTime(selectedSlot === slot.id.toString())}>
                    {slot.time}
                  </p>
                  <p style={styles.slotWaiting(
                    selectedSlot === slot.id.toString(),
                    slot.available
                  )}>
                    {slot.available ? `⏱️ ${slot.waiting}` : slot.waiting}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        {selectedSlot && (
          <div style={{ marginTop: '1.5rem' }}>
            <Card variant="lilac">
              <p style={{ color: COLORS.primary, textAlign: 'center', margin: 0, fontSize: '0.875rem' }}>
                Your estimated waiting time at the shop will be displayed after booking confirmation.
              </p>
            </Card>
          </div>
        )}

        {/* Confirm Button */}
        {selectedDate && selectedSlot && (
          <div style={{ marginTop: '1.5rem' }}>
            <Button fullWidth onClick={handleBooking}>
              Confirm Booking
            </Button>
          </div>
        )}
      </div>

      <BottomNav active="slot-booking" onNavigate={onNavigate} />
    </div>
  );
};

export default SlotBookingScreen;