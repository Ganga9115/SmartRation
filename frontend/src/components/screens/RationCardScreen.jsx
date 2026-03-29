import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { COLORS } from '../../utils/colors';
import { rationCardAPI, shopAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { useEffect } from 'react';

export const RationCardScreen = ({ onNavigate }) => {
  const { refreshCard } = useAuth();
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    card_number: '', card_type: 'APL',
    family_members: '1', address: '', shop_id: ''
  });

  useEffect(() => {
    shopAPI.getAll().then(r => setShops(r.data.shops)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.card_number || !form.address || !form.shop_id)
      return setError('All fields are required');
    setLoading(true);
    try {
      await rationCardAPI.register({
        ...form,
        family_members: parseInt(form.family_members),
        shop_id: parseInt(form.shop_id),
      });
      await refreshCard();
      onNavigate('home');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register card');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen p-6 flex flex-col justify-center"
      style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="p-4 rounded-2xl w-fit mx-auto mb-4"
            style={{ backgroundColor: COLORS.secondary }}>
            <CreditCard size={40} color={COLORS.primary} />
          </div>
          <h1 style={{ color: COLORS.primary }} className="text-2xl font-bold mb-2">
            Register Ration Card
          </h1>
          <p className="text-gray-500 text-sm">Enter your ration card details to continue</p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <label style={{ color: COLORS.primary }} className="block text-sm font-semibold mb-1">
            Ration Card Number
          </label>
          <input value={form.card_number}
            onChange={e => set('card_number', e.target.value)}
            placeholder="e.g. TN2024001234"
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none"
            style={{ borderColor: COLORS.border }}
          />

          <label style={{ color: COLORS.primary }} className="block text-sm font-semibold mb-1">
            Card Type
          </label>
          <select value={form.card_type} onChange={e => set('card_type', e.target.value)}
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none bg-white"
            style={{ borderColor: COLORS.border }}>
            <option value="APL">APL — Above Poverty Line</option>
            <option value="BPL">BPL — Below Poverty Line</option>
            <option value="AAY">AAY — Antyodaya Anna Yojana</option>
          </select>

          <label style={{ color: COLORS.primary }} className="block text-sm font-semibold mb-1">
            Family Members
          </label>
          <input type="number" min="1" max="20"
            value={form.family_members}
            onChange={e => set('family_members', e.target.value)}
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none"
            style={{ borderColor: COLORS.border }}
          />

          <label style={{ color: COLORS.primary }} className="block text-sm font-semibold mb-1">
            Address
          </label>
          <textarea value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Full residential address"
            rows={3}
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none resize-none"
            style={{ borderColor: COLORS.border }}
          />

          <label style={{ color: COLORS.primary }} className="block text-sm font-semibold mb-1">
            Assigned Ration Shop
          </label>
          <select value={form.shop_id} onChange={e => set('shop_id', e.target.value)}
            className="w-full p-3 border-2 rounded-xl mb-6 outline-none bg-white"
            style={{ borderColor: COLORS.border }}>
            <option value="">Select your shop</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <Button title={loading ? 'Registering...' : 'Register & Continue'}
            onClick={handleSubmit} fullWidth disabled={loading} />
        </Card>
      </div>
    </div>
  );
};