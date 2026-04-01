import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { stockAPI, shopAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

// Richer emoji icons matching screenshot style
const ITEM_ICONS = {
  rice:      '🌾',
  wheat:     '🌾',
  sugar:     '🍬',
  kerosene:  '⛽',
  salt:      '🧂',
  oil:       '🛢️',
  'cooking oil': '🫙',
};

const getIcon = (itemName) => {
  const lower = itemName.toLowerCase();
  for (const [key, icon] of Object.entries(ITEM_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📦';
};

const getStatus = (item) => {
  const avail = parseFloat(item.available_qty);
  const total = parseFloat(item.total_qty || 1);
  if (avail <= 0) return 'unavailable';
  if (avail / total < 0.2) return 'limited';
  return 'available';
};

const STATUS_CONFIG = {
  available:   { icon: CheckCircle, color: '#059669', bg: '#D1FAE5', label: 'Available' },
  limited:     { icon: AlertCircle, color: '#D97706', bg: '#FEF3C7', label: 'Limited Stock' },
  unavailable: { icon: XCircle,     color: '#DC2626', bg: '#FEE2E2', label: 'Out of Stock' },
};

const formatUpdateTime = (dateStr) => {
  if (!dateStr) {
    const now = new Date();
    return `Today, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const d = new Date(dateStr);
  return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

export const StockScreen = ({ onNavigate, params = {} }) => {
  const { rationCard } = useAuth();
  const [stock, setStock]       = useState([]);
  const [shop, setShop]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const shopId = params.shopId || rationCard?.shop_id;

  const fetchData = async (silent = false) => {
    if (!shopId) { setLoading(false); return; }
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [stockRes, shopRes] = await Promise.all([
        stockAPI.getByShop(shopId),
        shopAPI.getById(shopId),
      ]);
      setStock(stockRes.data.stock || []);
      setShop(shopRes.data.shop);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('StockScreen fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [shopId]);

  const isShopOpen = (s) => {
    if (!s) return false;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = (s.open_time || '09:00').split(':').map(Number);
    const [ch, cm] = (s.close_time || '17:00').split(':').map(Number);
    return cur >= oh * 60 + om && cur <= ch * 60 + cm;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <ArrowLeft size={24} />
            </button>
            <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Stock Availability
            </h2>
          </div>
          <button
            onClick={() => fetchData(true)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', opacity: refreshing ? 0.6 : 1 }}
          >
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0, paddingLeft: '2.25rem' }}>
          Check available items at your shop
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── No shop assigned ────────────────────────────── */}
        {!shopId ? (
          <Card>
            <p style={{ color: COLORS.primary, fontWeight: '600', textAlign: 'center', marginBottom: '1rem' }}>
              No shop assigned yet
            </p>
            <button
              onClick={() => onNavigate('ration-card')}
              style={{
                width: '100%', backgroundColor: COLORS.primary, color: 'white',
                padding: '0.875rem', borderRadius: '0.75rem', border: 'none',
                cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
              }}
            >
              Register Ration Card
            </button>
          </Card>

        ) : loading ? (
          // ── Skeleton ──────────────────────────────────────
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', height: 80, marginBottom: '1rem', opacity: 0.6 }} />
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', height: 72, marginBottom: '0.75rem', opacity: 0.6 - i * 0.08 }} />
            ))}
          </>

        ) : (
          <>
            {/* ── Shop info card ──────────────────────────── */}
            {shop && (
              <div style={{
                backgroundColor: COLORS.secondary,
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <h4 style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.2rem', fontSize: '1rem' }}>
                    {shop.name}
                  </h4>
                  <p style={{ color: `${COLORS.primary}B3`, margin: 0, fontSize: '0.8125rem' }}>
                    {shop.address}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <span style={{
                      backgroundColor: isShopOpen(shop) ? '#D1FAE5' : '#F3F4F6',
                      color: isShopOpen(shop) ? '#059669' : '#6B7280',
                      fontSize: '0.75rem', fontWeight: '600',
                      padding: '0.15rem 0.5rem', borderRadius: '0.375rem',
                    }}>
                      {isShopOpen(shop) ? '● Open' : '● Closed'}
                    </span>
                    <span style={{ color: `${COLORS.primary}99`, fontSize: '0.75rem' }}>
                      {shop.open_time?.slice(0,5)} – {shop.close_time?.slice(0,5)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('nearby-shops')}
                  style={{ color: COLORS.primary, background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', flexShrink: 0 }}
                >
                  Change
                </button>
              </div>
            )}

            {/* ── Entitlement header ──────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ color: COLORS.primary, fontWeight: '600', fontSize: '0.9rem' }}>
                Your Entitlement
              </span>
              <span style={{ color: COLORS.textLight, fontSize: '0.75rem' }}>
                Updated: {lastUpdated ? formatUpdateTime(lastUpdated) : '—'}
              </span>
            </div>

            {/* ── Stock items ─────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {stock.length === 0 ? (
                <Card>
                  <p style={{ color: COLORS.textLight, textAlign: 'center', padding: '1rem 0' }}>
                    No stock items found for this shop
                  </p>
                </Card>
              ) : (
                stock.map(item => {
                  const status = getStatus(item);
                  const { icon: Icon, color, bg, label } = STATUS_CONFIG[status];
                  const emoji = getIcon(item.item_name);

                  return (
                    <div key={item.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      {/* Emoji icon */}
                      <div style={{
                        backgroundColor: COLORS.secondary,
                        borderRadius: '0.875rem',
                        width: 52, height: 52, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                      </div>

                      {/* Name + entitlement */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ color: COLORS.primary, fontWeight: '700', margin: '0 0 0.2rem', fontSize: '1rem' }}>
                          {item.item_name}
                        </h4>
                        <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.8125rem' }}>
                          Entitlement: {item.per_family_qty} {item.unit}
                        </p>
                      </div>

                      {/* Status */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                        <Icon size={22} color={color} />
                        <span style={{ color, fontWeight: '600', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── CTA button ──────────────────────────────── */}
            <button
              onClick={() => onNavigate('slot-booking', { shopId, shopName: shop?.name })}
              style={{
                width: '100%', backgroundColor: COLORS.primary, color: 'white',
                padding: '1rem', borderRadius: '0.875rem', border: 'none',
                cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                boxShadow: `0 4px 16px ${COLORS.primary}40`,
              }}
            >
              Book Slot to Collect
            </button>

            {/* ── Info note ───────────────────────────────── */}
            <div style={{
              marginTop: '1rem',
              backgroundColor: COLORS.secondary,
              borderRadius: '1rem',
              padding: '0.875rem 1.25rem',
            }}>
              <p style={{ color: COLORS.primary, textAlign: 'center', fontSize: '0.8125rem', margin: 0, lineHeight: 1.6 }}>
                Stock availability is updated in real-time. Please book your slot in advance to ensure availability.
              </p>
            </div>
          </>
        )}
      </div>

      <BottomNav active="stock" onNavigate={onNavigate} />
    </div>
  );
};

export default StockScreen;