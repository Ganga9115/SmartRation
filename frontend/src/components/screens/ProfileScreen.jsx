import React, { useState } from 'react';
import {
  ArrowLeft, User, CreditCard, Users, MapPin,
  Globe, HelpCircle, MessageSquare, LogOut, ChevronRight, Edit2
} from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { Card } from '../shared/Card';
import { BottomNav } from '../shared/ButtomNav';
import { useAuth } from '../../utils/AuthContext';
import { authAPI } from '../../utils/api';

const CARD_TYPE_LABELS = {
  APL: 'APL (Above Poverty Line)',
  BPL: 'BPL (Below Poverty Line)',
  AAY: 'AAY (Antyodaya Anna Yojana)',
};

export const ProfileScreen = ({ onNavigate }) => {
  const { user, rationCard, logout, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [saving, setSaving]   = useState(false);

  // Generate family member list based on family_members count
  // In a real app these would be stored individually — for now derive from count
  const RELATIONS = ['Head of Family', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother'];
  const familyList = rationCard
    ? Array.from({ length: rationCard.family_members }, (_, i) => ({
        name:     i === 0 ? (user?.name || 'Head') : `Member ${i + 1}`,
        relation: RELATIONS[i] || `Member ${i + 1}`,
      }))
    : [];

  const menuItems = [
    { icon: Globe,         title: 'Language / भाषा',       subtitle: 'English',              action: 'language' },
    { icon: HelpCircle,    title: 'Help & Support',         subtitle: 'FAQs, Contact us',     action: 'help' },
    { icon: MessageSquare, title: 'Feedback & Complaints',  subtitle: 'Share your experience', action: 'feedback' },
  ];

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

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLORS.primary, padding: '3rem 1.5rem 2rem' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => onNavigate('home')}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0, flex: 1 }}>
            Profile & Settings
          </h2>
          <button onClick={() => setEditing(!editing)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Edit2 size={20} />
          </button>
        </div>

        {/* Profile card inside header */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '1rem',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar */}
            <div style={{
              backgroundColor: 'white', padding: '0.875rem',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={32} color={COLORS.primary} />
            </div>

            {/* Name + phone */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.4)', borderRadius: '0.5rem',
                    padding: '0.375rem 0.625rem', fontSize: '1.125rem',
                    fontWeight: '700', outline: 'none', width: '100%',
                  }}
                  placeholder="Your name"
                />
              ) : (
                <h3 style={{ color: 'white', margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  {user?.name || 'User'}
                </h3>
              )}
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.875rem' }}>
                +91 {user?.phone}
              </p>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div style={{ marginTop: '0.875rem' }}>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                style={{
                  width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', outline: 'none',
                  marginBottom: '0.625rem', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{
                    flex: 1, backgroundColor: 'white', color: COLORS.primary,
                    border: 'none', borderRadius: '0.5rem', padding: '0.5rem',
                    fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer',
                  }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{
                    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white',
                    border: 'none', borderRadius: '0.5rem', padding: '0.5rem',
                    fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer',
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Ration Card Details */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CreditCard size={20} color={COLORS.primary} />
            <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '1rem' }}>
              Ration Card Details
            </h4>
          </div>

          {rationCard ? (
            <div style={{ backgroundColor: COLORS.secondary, padding: '1rem', borderRadius: '0.75rem' }}>
              {[
                ['Card Number', rationCard.card_number],
                ['Card Type',   CARD_TYPE_LABELS[rationCard.card_type] || rationCard.card_type],
                ['Status',      rationCard.is_active ? 'Active' : 'Inactive'],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < arr.length - 1 ? '0.625rem' : 0,
                  marginBottom: i < arr.length - 1 ? '0.625rem' : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                }}>
                  <span style={{ color: `${COLORS.primary}99`, fontSize: '0.875rem' }}>{label}</span>
                  <span style={{
                    color: label === 'Status' ? (rationCard.is_active ? COLORS.success : COLORS.error) : COLORS.primary,
                    fontWeight: '500', fontSize: '0.875rem',
                  }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('ration-card')}
              style={{
                width: '100%', backgroundColor: COLORS.primary, color: 'white',
                padding: '0.875rem', borderRadius: '0.75rem', border: 'none',
                cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
              }}>
              Register Ration Card
            </button>
          )}
        </Card>

        {/* Family Members */}
        {rationCard && familyList.length > 0 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Users size={20} color={COLORS.primary} />
              <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                Family Members
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {familyList.map((member, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: COLORS.background, borderRadius: '0.75rem',
                }}>
                  <div style={{
                    backgroundColor: COLORS.secondary, padding: '0.5rem',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={16} color={COLORS.primary} />
                  </div>
                  <div>
                    <p style={{ color: COLORS.primary, fontWeight: '500', margin: 0, fontSize: '0.875rem' }}>
                      {member.name}
                    </p>
                    <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.8rem' }}>
                      {member.relation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Registered Shop */}
        {rationCard?.Shop && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <MapPin size={20} color={COLORS.primary} />
              <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                Registered Shop
              </h4>
            </div>
            <div style={{
              backgroundColor: COLORS.secondary, padding: '1rem', borderRadius: '0.75rem',
            }}>
              <p style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                {rationCard.Shop.name}
              </p>
              <p style={{ color: `${COLORS.primary}B3`, margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                {rationCard.Shop.address}
              </p>
              <p style={{ color: `${COLORS.primary}99`, margin: 0, fontSize: '0.8rem' }}>
                {rationCard.Shop.phone}
              </p>
            </div>
          </Card>
        )}

        {/* Settings Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => {}}>
                  <div style={{
                    backgroundColor: COLORS.secondary, padding: '0.75rem',
                    borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={COLORS.primary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: COLORS.primary, fontWeight: '600', margin: '0 0 0.2rem 0', fontSize: '1rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: COLORS.textLight, margin: 0, fontSize: '0.875rem' }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <ChevronRight size={20} color={COLORS.textLight} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* App Info */}
        <Card variant="lilac">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: `${COLORS.primary}99`, margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
              SmartRation v1.0.0
            </p>
            <p style={{ color: COLORS.primary, fontWeight: '500', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
              Public Distribution System App
            </p>
            <p style={{ color: `${COLORS.primary}99`, margin: 0, fontSize: '0.875rem' }}>
              © 2024 Government of India
            </p>
          </div>
        </Card>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', backgroundColor: 'white',
            border: '2px solid #FECACA', color: '#DC2626',
            padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
            fontWeight: '600', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </div>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
};

export default ProfileScreen;