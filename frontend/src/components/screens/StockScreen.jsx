import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { stockAPI, shopAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

const ITEM_ICONS = { Rice: '🌾', Wheat: '🌾', Sugar: '🍬', Kerosene: '⛽', Salt: '🧂', Oil: '🛢️' };

export const StockScreen = ({ onNavigate, params = {} }) => {
  const { rationCard } = useAuth();
  const [stock, setStock]   = useState([]);
  const [shop, setShop]     = useState(null);
  const [loading, setLoading] = useState(true);

  const shopId = params.shopId || rationCard?.shop_id;

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    Promise.all([
      stockAPI.getByShop(shopId),
      shopAPI.getById(shopId),
    ]).then(([stockRes, shopRes]) => {
      setStock(stockRes.data.stock || []);
      setShop(shopRes.data.shop);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId]);

  const getStatus = (item) => {
    const ratio = parseFloat(item.available_qty) / parseFloat(item.total_qty || 1);
    if (parseFloat(item.available_qty) <= 0) return 'unavailable';
    if (ratio < 0.2) return 'limited';
    return 'available';
  };

  const statusConfig = {
    available:   { icon: CheckCircle, color: COLORS.success, label: 'Available' },
    limited:     { icon: AlertCircle, color: COLORS.warning, label: 'Limited Stock' },
    unavailable: { icon: XCircle,     color: COLORS.error,   label: 'Out of Stock' },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Stock Availability
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
          {shop?.name || 'Your assigned shop'}
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {!shopId ? (
          <Card>
            <p style={{ color: COLORS.primary }} className="text-center font-semibold mb-3">
              No shop assigned yet
            </p>
            <button onClick={() => onNavigate('ration-card')}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: COLORS.primary }}>
              Register Ration Card
            </button>
          </Card>
        ) : loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-20 mb-3" />
          ))
        ) : (
          <>
            {shop && (
              <Card variant="lilac" className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 style={{ color: COLORS.primary }} className="font-semibold">{shop.name}</h4>
                    <p style={{ color: `${COLORS.primary}99` }} className="text-sm mt-1">{shop.address}</p>
                  </div>
                  <button onClick={() => onNavigate('nearby-shops')}
                    style={{ color: COLORS.primary }} className="text-sm font-semibold">
                    Change
                  </button>
                </div>
              </Card>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {stock.map(item => {
                const status = getStatus(item);
                const { icon: Icon, color, label } = statusConfig[status];
                const icon = Object.entries(ITEM_ICONS).find(([k]) =>
                  item.item_name.toLowerCase().includes(k.toLowerCase())
                )?.[1] || '📦';

                return (
                  <Card key={item.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ backgroundColor: COLORS.secondary, padding: '0.75rem', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                          {item.item_name}
                        </h4>
                        <p style={{ color: COLORS.textLight, fontSize: '0.875rem', margin: 0 }}>
                          Entitlement: {item.per_family_qty} {item.unit}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <Icon size={20} color={color} />
                        <span style={{ color, fontWeight: '600', fontSize: '0.8rem' }}>{label}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <button onClick={() => onNavigate('slot-booking', { shopId })}
              style={{ width: '100%', backgroundColor: COLORS.primary, color: 'white',
                padding: '1rem', borderRadius: '0.75rem', border: 'none',
                cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
              Book Slot to Collect
            </button>

            <div style={{ marginTop: '1rem' }}>
              <Card variant="lilac">
                <p style={{ color: COLORS.primary, textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>
                  Stock updated in real-time. Book early to ensure availability.
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
      <BottomNav active="stock" onNavigate={onNavigate} />
    </div>
  );
};

export default StockScreen;