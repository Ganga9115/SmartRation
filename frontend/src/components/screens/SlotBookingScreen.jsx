import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Zap, Package, ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { BottomNav } from '../shared/ButtomNav';
import { bookingAPI, shopAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export const SlotBookingScreen = ({ onNavigate, params = {} }) => {
  const { rationCard } = useAuth();
  const [slots, setSlots]               = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [items, setItems]               = useState([]);
  const [shopDetail, setShopDetail]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [booking, setBooking]           = useState(false);
  const [error, setError]               = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showItems, setShowItems]       = useState(false);

  const shopId   = params.shopId   || rationCard?.shop_id;
  const shopName = params.shopName || shopDetail?.name || 'Your Ration Shop';

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    Promise.all([
      bookingAPI.getSlots(shopId),
      bookingAPI.getEntitlements(shopId),
      shopAPI.getById(shopId),
    ]).then(([slotsRes, entRes, shopRes]) => {
      const fetchedSlots = slotsRes.data.slots || [];
      setSlots(fetchedSlots);
      setShopDetail(shopRes.data.shop || null);

      const ents = entRes.data.entitlements || [];
      setEntitlements(ents);
      setItems(ents.map(e => ({
        ...e,
        selected_qty: e.allocated_qty ?? e.per_family_qty,
        is_skipped:   false,
      })));

      // Auto-select first available date
      if (fetchedSlots.length > 0) {
        const firstDate = [...new Set(fetchedSlots.map(s => s.date))].sort()[0];
        setSelectedDate(firstDate);
      }
    }).catch(() => setError('Failed to load slots. Please try again.'))
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
      const max = parseFloat(item.allocated_qty ?? item.per_family_qty);
      const newQty = Math.max(0, Math.min(max, parseFloat(item.selected_qty) + delta));
      return { ...item, selected_qty: newQty, is_skipped: newQty === 0 };
    }));
  };

  const toggleSkip = (index) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const skip = !item.is_skipped;
      const max  = parseFloat(item.allocated_qty ?? item.per_family_qty);
      return { ...item, is_skipped: skip, selected_qty: skip ? 0 : max };
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
          allocated_qty: item.allocated_qty ?? item.per_family_qty,
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

  const activeItems = items.filter(i => !i.is_skipped);

  const formatDateLabel = (d) => {
    const date = new Date(d);
    return {
      day:   date.toLocaleDateString('en', { weekday: 'short' }),
      num:   date.getDate(),
      month: date.toLocaleDateString('en', { month: 'short' }),
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <button
            onClick={() => onNavigate('nearby-shops')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Book Your Slot
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0, paddingLeft: '2.25rem' }}>
          Choose date and time
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── No ration card ───────────────────────────────── */}
        {!rationCard && (
          <div style={{
            backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: '1rem', padding: '1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ color: '#92400E', fontWeight: '600', margin: 0, fontSize: '0.875rem' }}>
              No ration card found
            </p>
            <button
              onClick={() => onNavigate('ration-card')}
              style={{ backgroundColor: '#92400E', color: 'white', border: 'none',
                borderRadius: '0.5rem', padding: '0.375rem 0.75rem',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
            >
              Register
            </button>
          </div>
        )}

        {/* ── Shop info card — always visible ─────────────── */}
        {(shopDetail || shopName) && (
          <div style={{
            backgroundColor: COLORS.secondary,
            borderRadius: '1rem',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}>
            <h4 style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.2rem', fontSize: '1rem' }}>
              {shopDetail?.name || shopName}
            </h4>
            {shopDetail?.address && (
              <p style={{ color: `${COLORS.primary}B3`, margin: 0, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} color={`${COLORS.primary}B3`} />
                {shopDetail.address}
              </p>
            )}
          </div>
        )}

        {/* ── Error banner ────────────────────────────────── */}
        {error && (
          <div style={{
            backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA',
            padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem',
            fontSize: '0.875rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '4px solid #E9D5FF', borderTopColor: COLORS.primary,
              animation: 'spin 1s linear infinite', margin: '0 auto 1rem',
            }} />
            <p style={{ color: COLORS.textLight }}>Loading available slots...</p>
          </div>
        ) : (
          <>
            {/* ── AI recommendation banner ─────────────────── */}
            {slots.some(s => s.is_recommended) && (
              <div style={{
                backgroundColor: COLORS.secondary,
                borderRadius: '0.875rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Zap size={16} color={COLORS.primary} />
                <p style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.875rem', margin: 0 }}>
                  AI has highlighted the best slots for you
                </p>
              </div>
            )}

            {/* ── Item Selection (collapsible) ─────────────── */}
            {items.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '1rem',
                marginBottom: '1.5rem', overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <button
                  onClick={() => setShowItems(v => !v)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: showItems ? `1px solid ${COLORS.border}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={18} color={COLORS.primary} />
                    <span style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.9375rem' }}>
                      Your Items ({activeItems.length}/{items.length} selected)
                    </span>
                  </div>
                  {showItems
                    ? <ChevronUp size={18} color={COLORS.primary} />
                    : <ChevronDown size={18} color={COLORS.primary} />}
                </button>

                {showItems && (
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((item, i) => {
                      const max = parseFloat(item.allocated_qty ?? item.per_family_qty);
                      return (
                        <div key={i} style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          backgroundColor: item.is_skipped ? '#F9FAFB' : COLORS.secondary,
                          opacity: item.is_skipped ? 0.65 : 1,
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>
                                {item.item_name}
                              </p>
                              <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.75rem' }}>
                                Max: {max} {item.unit}
                              </p>
                            </div>

                            {/* Qty stepper */}
                            {!item.is_skipped && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                <button
                                  onClick={() => adjustQty(i, -0.5)}
                                  style={{
                                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                                    backgroundColor: COLORS.primary, color: 'white',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >−</button>
                                <span style={{
                                  color: COLORS.primary, fontWeight: '700',
                                  minWidth: '3.5rem', textAlign: 'center', fontSize: '0.875rem',
                                }}>
                                  {item.selected_qty} {item.unit}
                                </span>
                                <button
                                  onClick={() => adjustQty(i, 0.5)}
                                  style={{
                                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                                    backgroundColor: COLORS.primary, color: 'white',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >+</button>
                              </div>
                            )}

                            {/* Skip/Add toggle */}
                            <button
                              onClick={() => toggleSkip(i)}
                              style={{
                                fontSize: '0.75rem', padding: '0.3rem 0.7rem',
                                borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                fontWeight: '600', flexShrink: 0,
                                backgroundColor: item.is_skipped ? COLORS.primary : '#FEE2E2',
                                color: item.is_skipped ? 'white' : '#DC2626',
                              }}
                            >
                              {item.is_skipped ? 'Add' : 'Skip'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Date selector ────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CalendarIcon size={20} color={COLORS.primary} />
                <h3 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                  Select Date
                </h3>
              </div>

              <div style={{
                display: 'flex', gap: '0.625rem',
                overflowX: 'auto', paddingBottom: '0.5rem',
                scrollbarWidth: 'none',
              }}>
                {uniqueDates.map(date => {
                  const { day, num, month } = formatDateLabel(date);
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      style={{
                        flexShrink: 0,
                        width: '4.5rem',
                        padding: '0.75rem 0.5rem',
                        borderRadius: '0.875rem',
                        border: `1.5px solid ${isSelected ? COLORS.primary : '#E5E0ED'}`,
                        backgroundColor: isSelected ? COLORS.primary : 'white',
                        color: isSelected ? 'white' : COLORS.text,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.75)' : COLORS.textLight, marginBottom: '0.2rem' }}>
                        {day}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1 }}>
                        {num}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.75)' : COLORS.textLight, marginTop: '0.2rem' }}>
                        {month}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Time slots ───────────────────────────────── */}
            {selectedDate && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Clock size={20} color={COLORS.primary} />
                  <h3 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                    Select Time Slot
                  </h3>
                </div>

                {(slotsByDate[selectedDate] || []).length === 0 ? (
                  <div style={{
                    backgroundColor: 'white', borderRadius: '1rem',
                    padding: '2rem', textAlign: 'center',
                    color: COLORS.textLight, fontSize: '0.875rem',
                  }}>
                    No slots available for this date
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {(slotsByDate[selectedDate] || []).map((slot, i) => {
                      const isSelected    = selectedSlot?.slot_time === slot.slot_time;
                      const isRecommended = slot.is_recommended;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '1rem',
                            borderRadius: '0.875rem',
                            textAlign: 'left',
                            border: `2px solid ${isSelected ? COLORS.primary : isRecommended ? `${COLORS.primary}55` : '#E5E0ED'}`,
                            backgroundColor: isSelected ? COLORS.primary : isRecommended ? COLORS.secondary : 'white',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? `0 4px 12px ${COLORS.primary}30` : 'none',
                          }}
                        >
                          {isRecommended && !isSelected && (
                            <span style={{
                              position: 'absolute', top: 6, right: 6,
                              backgroundColor: COLORS.primary, color: 'white',
                              fontSize: '0.6rem', padding: '2px 6px',
                              borderRadius: '4px', fontWeight: '700',
                            }}>
                              ⚡ Best
                            </span>
                          )}
                          <p style={{
                            color: isSelected ? 'white' : COLORS.primary,
                            fontWeight: '700', margin: '0 0 0.2rem', fontSize: '1rem',
                          }}>
                            {slot.slot_time?.slice(0, 5)}
                          </p>
                          <p style={{
                            color: isSelected ? 'rgba(255,255,255,0.75)' : COLORS.textLight,
                            margin: 0, fontSize: '0.75rem',
                          }}>
                            {slot.available_count} spot{slot.available_count !== 1 ? 's' : ''} left
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Confirm summary + button ─────────────────── */}
            {selectedSlot && (
              <div>
                <div style={{
                  backgroundColor: COLORS.secondary,
                  borderRadius: '1rem',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>
                    {new Date(selectedSlot.date).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })} at {selectedSlot.slot_time?.slice(0,5)}
                  </p>
                  <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.8125rem' }}>
                    {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} selected
                    {selectedSlot.available_count != null ? ` · ${selectedSlot.available_count} spots left` : ''}
                  </p>
                </div>

                {activeItems.length === 0 && (
                  <p style={{ color: '#DC2626', textAlign: 'center', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Please select at least one item to book
                  </p>
                )}

                <button
                  onClick={handleBook}
                  disabled={booking || activeItems.length === 0}
                  style={{
                    width: '100%',
                    backgroundColor: (booking || activeItems.length === 0) ? '#B0A0C8' : COLORS.primary,
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '0.875rem',
                    border: 'none',
                    cursor: (booking || activeItems.length === 0) ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: activeItems.length > 0 && !booking ? `0 4px 16px ${COLORS.primary}40` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
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