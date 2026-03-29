import React, { useState } from 'react';
import { ArrowLeft, User, CreditCard, Users, MapPin, LogOut, ChevronRight, Edit2 } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { useAuth } from '../../utils/AuthContext';
import { authAPI } from '../../utils/api';

export const ProfileScreen = ({ onNavigate }) => {
  const { user, rationCard, logout, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name, email });
      setUser(res.data.user);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0, flex: 1 }}>
            Profile
          </h2>
          <button onClick={() => setEditing(!editing)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Edit2 size={20} />
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '50%' }}>
              <User size={32} color={COLORS.primary} />
            </div>
            <div>
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)}
                  className="bg-white/20 text-white rounded-lg px-2 py-1 text-lg font-bold outline-none"
                  placeholder="Your name" />
              ) : (
                <h3 style={{ color: 'white', margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                  {user?.name || 'User'}
                </h3>
              )}
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.875rem' }}>
                +91 {user?.phone}
              </p>
            </div>
          </div>
          {editing && (
            <div className="mt-3">
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full bg-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2 outline-none text-sm mb-2" />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: 'white', color: COLORS.primary }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '1rem 1.5rem' }}>
        {/* Ration Card */}
        <div style={{ marginBottom: '1rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <CreditCard size={20} color={COLORS.primary} />
              <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0 }}>Ration Card</h4>
            </div>
            {rationCard ? (
              <div style={{ backgroundColor: COLORS.secondary, padding: '1rem', borderRadius: '0.75rem' }}>
                {[
                  ['Card Number', rationCard.card_number],
                  ['Card Type',   rationCard.card_type],
                  ['Status',      rationCard.is_active ? 'Active' : 'Inactive'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: `${COLORS.primary}99`, fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ color: label === 'Status' && rationCard.is_active ? COLORS.success : COLORS.primary,
                      fontWeight: '500', fontSize: '0.875rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => onNavigate('ration-card')}
                style={{ width: '100%', backgroundColor: COLORS.primary, color: 'white',
                  padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                Register Ration Card
              </button>
            )}
          </Card>
        </div>

        {/* Family Members */}
        {rationCard && (
          <div style={{ marginBottom: '1rem' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Users size={20} color={COLORS.primary} />
                <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0 }}>Family Members</h4>
              </div>
              <div style={{ backgroundColor: COLORS.secondary, padding: '1rem', borderRadius: '0.75rem',
                textAlign: 'center' }}>
                <span style={{ color: COLORS.primary, fontSize: '2rem', fontWeight: '700' }}>
                  {rationCard.family_members}
                </span>
                <p style={{ color: `${COLORS.primary}99`, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  members registered
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* App info */}
        <div style={{ marginBottom: '1rem' }}>
          <Card variant="lilac">
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                SmartRation v1.0.0
              </p>
              <p style={{ color: `${COLORS.primary}99`, margin: 0, fontSize: '0.875rem' }}>
                AI-powered ration distribution system
              </p>
            </div>
          </Card>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width: '100%', backgroundColor: 'white', border: '2px solid #FECACA',
            color: '#DC2626', padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
            fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
};

export default ProfileScreen;