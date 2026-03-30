import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Zap, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { BottomNav } from '../shared/ButtomNav';
import { bookingAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export const SlotBookingScreen = ({ onNavigate, params = {} }) => {
  const { rationCard } = useAuth();
  const [slots, setSlots]             = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [items, setItems]             = useState([]);       // user-editable quantities
  const [loading, setLoading]         = useState(true);
  const [booking, setBooking]         = useState(false);
  const [error, setError]             = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showItems, setShowItems]     = useState(false);

  const shopId   = params.shopId   || rationCard?.shop_id;
  const shopName = params.shopName || 'Your Ration Shop';

  // Load slots + entitlements together
  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    Promise.all([
      bookingAPI.getSlots(shopId),
      bookingAPI.getEntitlements(shopId),
    ]).then(([slotsRes, entRes]) => {
      setSlots(slotsRes.data.slots || []);

      const ents = entRes.data.entitlements || [];
      setEntitlements(ents);
      // Initialise items with full allocated quantity
      setItems(ents.map(e => ({
        ...e,
        selected_qty: e.allocated_qty,
        is_skipped:   false,
      })));
    }).catch(() => setError('Failed to load slots'))
      .finally(() => setLoading(false));
  }, [shopId]);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const uniqueDates = Object.keys(slotsByDate).sort();

  const adjustQty = (index, delta) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(0, Math.min(
        parseFloat(item.allocated_qty),
        parseFloat(item.selected_qty) + delta
      ));
      return { ...item, selected_qty: newQty, is_skipped: newQty === 0 };
    }));
  };

  const toggleSkip = (index) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const skip = !item.is_skipped;
      return { ...item, is_skipped: skip, selected_qty: skip ? 0 : item.allocated_qty };
    }));
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setError('');
    setBooking(true);
    try {
      const res = await bookingAPI.create({
        shop_id:        shopId,
        booking_date:   selectedSlot.date,
        slot_time:      selectedSlot.slot_time,
        selected_items: items.map(item => ({
          item_name:     item.item_name,
          unit:          item.unit,
          allocated_qty: item.allocated_qty,
          selected_qty:  item.selected_qty,
          is_skipped:    item.is_skipped,
        })),
      });
      onNavigate('confirmation', { bookingId: res.data.booking.id, booking: res.data.booking });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const activeItems = items.filter(i => !i.is_skipped);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button onClick={() => onNavigate('nearby-shops')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Book Slot</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{shopName}</p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        {!rationCard && (
          <Card className="mb-4">
            <p style={{ color: COLORS.primary }} className="text-center font-semibold mb-2">
              No ration card found
            </p>
            <Button title="Register Card" onClick={() => onNavigate('ration-card')} fullWidth />
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-3" />
            <p style={{ color: COLORS.textLight }}>Loading available slots...</p>
          </div>
        ) : (
          <>
            {/* AI Recommended banner */}
            {slots.some(s => s.is_recommended) && (
              <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
                style={{ backgroundColor: COLORS.secondary }}>
                <Zap size={16} color={COLORS.primary} />
                <p style={{ color: COLORS.primary }} className="text-sm font-semibold">
                  AI has highlighted the best slots for you
                </p>
              </div>
            )}

            {/* ── Item Selection ───────────────────────────── */}
            {items.length > 0 && (
              <Card className="mb-4">
                <button
                  onClick={() => setShowItems(v => !v)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={18} color={COLORS.primary} />
                    <span style={{ color: COLORS.primary, fontWeight: '600' }}>
                      Your Items ({activeItems.length}/{items.length} selected)
                    </span>
                  </div>
                  {showItems
                    ? <ChevronUp size={18} color={COLORS.primary} />
                    : <ChevronDown size={18} color={COLORS.primary} />}
                </button>

                {showItems && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((item, i) => (
                      <div key={i} style={{
                        padding: '0.75rem', borderRadius: '0.75rem',
                        backgroundColor: item.is_skipped ? '#F3F4F6' : COLORS.secondary,
                        opacity: item.is_skipped ? 0.6 : 1,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>
                              {item.item_name}
                            </p>
                            <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.75rem' }}>
                              Max: {item.allocated_qty} {item.unit}
                            </p>
                          </div>

                          {/* Qty adjuster */}
                          {!item.is_skipped && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button onClick={() => adjustQty(i, -0.5)}
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none',
                                  backgroundColor: COLORS.primary, color: 'white', cursor: 'pointer',
                                  fontWeight: '700', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                −
                              </button>
                              <span style={{ color: COLORS.primary, fontWeight: '600', minWidth: '3rem', textAlign: 'center' }}>
                                {item.selected_qty} {item.unit}
                              </span>
                              <button onClick={() => adjustQty(i, 0.5)}
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none',
                                  backgroundColor: COLORS.primary, color: 'white', cursor: 'pointer',
                                  fontWeight: '700', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                +
                              </button>
                            </div>
                          )}

                          {/* Skip toggle */}
                          <button onClick={() => toggleSkip(i)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '0.5rem',
                              border: 'none', cursor: 'pointer', fontWeight: '600',
                              backgroundColor: item.is_skipped ? COLORS.primary : '#FEE2E2',
                              color: item.is_skipped ? 'white' : COLORS.error }}>
                            {item.is_skipped ? 'Add' : 'Skip'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Date selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CalendarIcon size={20} color={COLORS.primary} />
                <h3 style={{ color: COLORS.primary, fontWeight: '600', margin: 0 }}>Select Date</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {uniqueDates.map(date => {
                  const d = new Date(date);
                  const isSelected = selectedDate === date;
                  return (
                    <button key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      style={{
                        flexShrink: 0, padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                        backgroundColor: isSelected ? COLORS.primary : 'white',
                        color: isSelected ? 'white' : COLORS.text, cursor: 'pointer',
                        minWidth: '72px', textAlign: 'center',
                      }}>
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.textLight }}>
                        {d.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>{d.getDate()}</div>
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.textLight }}>
                        {d.toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Clock size={20} color={COLORS.primary} />
                  <h3 style={{ color: COLORS.primary, fontWeight: '600', margin: 0 }}>Select Time Slot</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
                  {(slotsByDate[selectedDate] || []).map((slot, i) => {
                    const isSelected = selectedSlot?.slot_time === slot.slot_time;
                    return (
                      <button key={i} onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '1rem', borderRadius: '0.75rem', textAlign: 'left',
                          border: `2px solid ${isSelected ? COLORS.primary : slot.is_recommended ? COLORS.primary + '44' : COLORS.border}`,
                          backgroundColor: isSelected ? COLORS.primary : slot.is_recommended ? COLORS.secondary : 'white',
                          cursor: 'pointer', position: 'relative',
                        }}>
                        {slot.is_recommended && !isSelected && (
                          <span style={{ position: 'absolute', top: 6, right: 6,
                            backgroundColor: COLORS.primary, color: 'white',
                            fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px' }}>
                            ⚡ Best
                          </span>
                        )}
                        <p style={{ color: isSelected ? 'white' : COLORS.primary,
                          fontWeight: '600', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                          {slot.slot_time}
                        </p>
                        <p style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.textLight,
                          margin: 0, fontSize: '0.75rem' }}>
                          {slot.available_count} spot{slot.available_count !== 1 ? 's' : ''} left
                        </p>
                        <p style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : COLORS.textLight,
                          margin: '0.25rem 0 0 0', fontSize: '0.7rem' }}>
                          Score: {slot.score}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm */}
            {selectedSlot && (
              <div style={{ marginTop: '1.5rem' }}>
                <Card variant="lilac" className="mb-4">
                  <p style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    {formatDate(selectedSlot.date)} at {selectedSlot.slot_time}
                  </p>
                  <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.875rem' }}>
                    {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} selected ·{' '}
                    {selectedSlot.available_count} spots left
                  </p>
                </Card>
                <Button
                  title={booking ? 'Booking...' : 'Confirm Booking'}
                  onClick={handleBook} fullWidth disabled={booking || activeItems.length === 0} />
                {activeItems.length === 0 && (
                  <p style={{ color: COLORS.error, textAlign: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Select at least one item to book
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav active="slot-booking" onNavigate={onNavigate} />
    </div>
  );
};

export default SlotBookingScreen;