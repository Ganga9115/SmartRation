// src/components/screens/BookingConfirmationScreen.jsx

import React from 'react';
import { CheckCircle, Calendar, Clock, MapPin, Home } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { COLORS } from '../../utils/colors';

export const BookingConfirmationScreen = ({ onNavigate }) => {
  // Sample booking data - you can replace this with dynamic data later
  const bookingData = {
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    time: '10:00 AM - 11:00 AM',
    tokenNumber: 'TKN123456',
    shopName: 'Fair Price Shop - Sector 12'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: COLORS.background }}>
      {/* Success Header */}
      <div 
        className="px-6 pt-12 pb-8 text-center"
        style={{
          background: `linear-gradient(to bottom right, ${COLORS.primary}, ${COLORS.secondary})`
        }}
      >
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} className="text-green-600" strokeWidth={2} />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-white/90">Your slot has been successfully booked</p>
      </div>

      <div className="px-6 -mt-4">
        {/* Token Card */}
        <Card 
          variant="lilac" 
          className="mb-6"
          style={{
            border: `4px solid ${COLORS.primary}`
          }}
        >
          <div className="text-center py-4">
            <p style={{ color: `${COLORS.primary}B3` }} className="mb-2">Your Token Number</p>
            <h1 style={{ color: COLORS.primary }} className="mb-4 tracking-widest text-4xl font-bold">
              {bookingData.tokenNumber}
            </h1>
            <div className="bg-white p-6 rounded-xl inline-block">
              {/* QR Code Placeholder */}
              <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1">
                  {[...Array(64)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${
                        Math.random() > 0.5 ? 'bg-[#5E4075]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p style={{ color: COLORS.primary }} className="mt-4 font-semibold">Scan at the ration shop</p>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <h3 style={{ color: COLORS.primary }} className="font-semibold mb-4">Booking Details</h3>

          <div className="space-y-4">
            {/* Shop Name */}
            <div className="flex items-start gap-3">
              <MapPin color={COLORS.primary} size={20} className="mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-600 text-sm">Shop Name</p>
                <p style={{ color: COLORS.primary }} className="font-semibold">
                  {bookingData.shopName}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 border-t" style={{ borderColor: COLORS.border }}>
              <Calendar color={COLORS.primary} size={20} className="mt-3 flex-shrink-0" />
              <div className="flex-1 pt-3">
                <p className="text-gray-600 text-sm">Date</p>
                <p style={{ color: COLORS.primary }} className="font-semibold">
                  {formatDate(bookingData.date)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3 border-t" style={{ borderColor: COLORS.border }}>
              <Clock color={COLORS.primary} size={20} className="mt-3 flex-shrink-0" />
              <div className="flex-1 pt-3">
                <p className="text-gray-600 text-sm">Time Slot</p>
                <p style={{ color: COLORS.primary }} className="font-semibold">
                  {bookingData.time}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card variant="lilac" className="mb-6">
          <h4 style={{ color: COLORS.primary }} className="font-semibold mb-3">Important Instructions</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span style={{ color: COLORS.primary }} className="mt-1 flex-shrink-0">•</span>
              <span style={{ color: COLORS.primary }}>Show this token at the ration shop counter</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: COLORS.primary }} className="mt-1 flex-shrink-0">•</span>
              <span style={{ color: COLORS.primary }}>Arrive 10 minutes before your slot time</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: COLORS.primary }} className="mt-1 flex-shrink-0">•</span>
              <span style={{ color: COLORS.primary }}>Bring your original ration card</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: COLORS.primary }} className="mt-1 flex-shrink-0">•</span>
              <span style={{ color: COLORS.primary }}>Track queue status in real-time</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            title="View Live Queue Status"
            onClick={() => onNavigate('nearby-shops')}
            fullWidth
          />

          <Button
            title="Back to Home"
            onClick={() => onNavigate('home')}
            variant="outline"
            fullWidth
          />
        </div>

        {/* Share/Download Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: '2px',
              borderColor: COLORS.border,
              color: COLORS.primary
            }}
          >
            Download Token
          </button>
          <button
            className="py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: '2px',
              borderColor: COLORS.border,
              color: COLORS.primary
            }}
          >
            Share Details
          </button>
        </div>
      </div>
    </div>
  );
};