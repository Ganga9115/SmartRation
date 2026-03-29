import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, MapPin, Hash } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { COLORS } from '../../utils/colors';
import { bookingAPI, queueAPI } from '../../utils/api';

export const BookingConfirmationScreen = ({ onNavigate, params = {} }) => {
  const [booking, setBooking]     = useState(params.booking || null);
  const [waitInfo, setWaitInfo]   = useState(null);
  const [loading, setLoading]     = useState(!params.booking);

  useEffect(() => {
    if (params.bookingId && !params.booking) {
      bookingAPI.getById(params.bookingId)
        .then(r => setBooking(r.data.booking))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.bookingId]);

  useEffect(() => {
    if (booking) {
      queueAPI.getWaitTime(booking.shop_id, booking.booking_date, booking.token_number)
        .then(r => setWaitInfo(r.data))
        .catch(() => {});
    }
  }, [booking]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.background }}>
      <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: COLORS.background }}>
      <Card>
        <p className="text-center text-gray-500">Booking not found</p>
        <Button title="Go Home" onClick={() => onNavigate('home')} fullWidth />
      </Card>
    </div>
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: COLORS.background }}>
      {/* Success header */}
      <div className="px-6 pt-12 pb-8 text-center"
        style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #7B5EA7)` }}>
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} color="#059669" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-1">Booking Confirmed!</h2>
        <p className="text-white/80">Your slot has been successfully booked</p>
      </div>

      <div className="px-6 -mt-4">
        {/* Token card */}
        <Card variant="lilac" className="mb-4" style={{ border: `3px solid ${COLORS.primary}` }}>
          <div className="text-center py-2">
            <p style={{ color: `${COLORS.primary}99` }} className="text-sm mb-1">Token Number</p>
            <h1 style={{ color: COLORS.primary }} className="text-5xl font-bold tracking-widest mb-4">
              #{booking.token_number}
            </h1>
            {/* Real QR code from backend */}
            {booking.qr_code && (
              <div className="bg-white p-4 rounded-xl inline-block mb-3">
                <img src={booking.qr_code} alt="QR Code" className="w-40 h-40" />
              </div>
            )}
            <p style={{ color: COLORS.primary }} className="text-sm font-semibold">
              Show this QR at the shop counter
            </p>
          </div>
        </Card>

        {/* Wait time */}
        {waitInfo && (
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: COLORS.textLight }} className="text-sm">Estimated Wait</p>
                <p style={{ color: COLORS.primary }} className="text-2xl font-bold">
                  ~{waitInfo.estimatedWaitMinutes} min
                </p>
              </div>
              <div className="text-right">
                <p style={{ color: COLORS.textLight }} className="text-sm">People ahead</p>
                <p style={{ color: COLORS.primary }} className="text-2xl font-bold">
                  {waitInfo.queueAhead}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Booking details */}
        <Card className="mb-4">
          <h3 style={{ color: COLORS.primary }} className="font-semibold mb-4">Booking Details</h3>
          <div className="space-y-4">
            {[
              { icon: MapPin,   label: 'Shop',  value: booking.Shop?.name || booking.shop?.name },
              { icon: Calendar, label: 'Date',  value: formatDate(booking.booking_date) },
              { icon: Clock,    label: 'Slot',  value: booking.slot_time },
              { icon: Hash,     label: 'Card',  value: booking.RationCard?.card_number || booking.ration_card?.card_number },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 pt-3 border-t first:pt-0 first:border-0"
                style={{ borderColor: COLORS.border }}>
                <Icon size={18} color={COLORS.primary} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p style={{ color: COLORS.primary }} className="font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <Card variant="lilac" className="mb-6">
          <h4 style={{ color: COLORS.primary }} className="font-semibold mb-3">Instructions</h4>
          {[
            'Show your QR code or token number at the counter',
            'Arrive 10 minutes before your slot time',
            'Bring your original ration card',
            'Track live queue status before heading out',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span style={{ color: COLORS.primary }}>•</span>
              <span style={{ color: COLORS.primary }} className="text-sm">{tip}</span>
            </div>
          ))}
        </Card>

        <div className="space-y-3">
          <Button title="Track Live Queue" onClick={() => onNavigate('home')} fullWidth />
          <Button title="Back to Home" onClick={() => onNavigate('home')} variant="outline" fullWidth />
        </div>
      </div>
    </div>
  );
};