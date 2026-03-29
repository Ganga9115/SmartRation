import React, { useEffect, useState } from 'react';
import { MapPin, Clock, ArrowLeft } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { shopAPI, stockAPI } from '../../utils/api';

export const NearbyShopsScreen = ({ onNavigate }) => {
  const [shops, setShops]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await shopAPI.getAll();
        const shopsData = res.data.shops || [];

        // Fetch stock status for each shop
        const enriched = await Promise.all(
          shopsData.map(async (shop) => {
            try {
              const stockRes = await stockAPI.getByShop(shop.id);
              const items = stockRes.data.stock || [];
              const anyLow = items.some(i =>
                parseFloat(i.available_qty) < parseFloat(i.total_qty) * 0.2
              );
              const anyZero = items.every(i => parseFloat(i.available_qty) === 0);
              return {
                ...shop,
                stockStatus: anyZero ? 'Not Available' : anyLow ? 'Limited' : 'Available',
              };
            } catch {
              return { ...shop, stockStatus: 'Unknown' };
            }
          })
        );
        setShops(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const getStockColor = (s) =>
    s === 'Available' ? COLORS.success : s === 'Limited' ? COLORS.warning : COLORS.error;

  const isOpen = (shop) => {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = (shop.open_time || '09:00').split(':').map(Number);
    const [ch, cm] = (shop.close_time || '17:00').split(':').map(Number);
    return cur >= oh * 60 + om && cur <= ch * 60 + cm;
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
            Nearby Ration Shops
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
          {shops.length} shops found
        </p>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-32" />
          ))
        ) : shops.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No shops found</p>
          </Card>
        ) : (
          shops.map((shop) => {
            const open = isOpen(shop);
            return (
              <Card key={shop.id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                        {shop.name}
                      </h4>
                      <p style={{ color: COLORS.textLight, fontSize: '0.875rem', margin: 0 }}>
                        {shop.address}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '0.75rem', borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} color={COLORS.primary} />
                      <span style={{ fontSize: '0.875rem', color: COLORS.text }}>
                        {shop.open_time?.slice(0,5)} – {shop.close_time?.slice(0,5)}
                      </span>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600',
                      backgroundColor: open ? '#D1FAE5' : '#F3F4F6',
                      color: open ? '#059669' : COLORS.textLight
                    }}>
                      {open ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '0.5rem', borderTop: `1px solid ${COLORS.border}` }}>
                    <span style={{ color: COLORS.textLight, fontSize: '0.875rem' }}>Stock:</span>
                    <span style={{ color: getStockColor(shop.stockStatus), fontWeight: '600', fontSize: '0.875rem' }}>
                      {shop.stockStatus}
                    </span>
                  </div>

                  {open && shop.stockStatus !== 'Not Available' && (
                    <button
                      onClick={() => onNavigate('slot-booking', { shopId: shop.id, shopName: shop.name })}
                      style={{ width: '100%', backgroundColor: COLORS.primary, color: 'white',
                        padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
                        cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                      Book Slot
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
      <BottomNav active="nearby-shops" onNavigate={onNavigate} />
    </div>
  );
};

export default NearbyShopsScreen;