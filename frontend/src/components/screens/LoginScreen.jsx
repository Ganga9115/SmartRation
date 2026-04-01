import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, Smartphone } from 'lucide-react';
import { COLORS } from '../../utils/colors';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export const LoginScreen = ({ onNavigate }) => {
  const { login } = useAuth();
  const [tab, setTab]                 = useState('login');   // 'login' | 'new'
  const [step, setStep]               = useState(1);          // 1=phone, 2=otp
  const [phone, setPhone]             = useState('');
  const [cardNumber, setCardNumber]   = useState('');
  const [otp, setOtp]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [devOtp, setDevOtp]           = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const reset = () => {
    setStep(1); setOtp(''); setError(''); setDevOtp(''); setPhone(''); setCardNumber('');
  };

  const handleTabSwitch = (t) => { setTab(t); reset(); };

  const handleSendOTP = async () => {
    setError('');
    if (!phone || phone.length !== 10)
      return setError('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(phone);
      if (res.data.success) {
        setStep(2);
        setResendTimer(30);
        if (res.data.otp) setDevOtp(res.data.otp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (!otp || otp.length !== 6)
      return setError('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(phone, otp);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.isNewUser) {
          onNavigate('ration-card');
        } else {
          onNavigate('home');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.875rem',
    border: '1.5px solid #E5E0ED',
    outline: 'none',
    fontSize: '0.9375rem',
    color: '#2D1B45',
    backgroundColor: '#FAFAFA',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${COLORS.primary} 0%, #7B5EA7 60%, #9B7BC7 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* ── Logo ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            width: 'fit-content',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <ShoppingBag size={48} color={COLORS.primary} strokeWidth={1.5} />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.25rem' }}>
            SmartRation
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem' }}>
            Welcome to your smart ration booking system
          </p>
        </div>

        {/* ── Card ─────────────────────────────────────── */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>

          {/* ── Tab switcher ────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#F3F0F8',
            borderRadius: '0.875rem',
            padding: '0.25rem',
            marginBottom: '1.5rem',
          }}>
            {['login', 'new'].map((t) => (
              <button
                key={t}
                onClick={() => handleTabSwitch(t)}
                style={{
                  padding: '0.625rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s',
                  backgroundColor: tab === t ? COLORS.primary : 'transparent',
                  color: tab === t ? 'white' : '#888',
                }}
              >
                {t === 'login' ? 'Login' : 'New User'}
              </button>
            ))}
          </div>

          {/* ── Error / Dev OTP ─────────────────────────── */}
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2', color: '#DC2626',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center',
            }}>
              {error}
            </div>
          )}
          {devOtp && !error && (
            <div style={{
              backgroundColor: '#F0FDF4', color: '#16A34A',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center',
              fontWeight: '600', letterSpacing: '0.05em',
            }}>
              Dev OTP: {devOtp}
            </div>
          )}

          {step === 1 ? (
            <>
              {/* ── Ration Card Number (both tabs show this) ─ */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  <CreditCard size={15} />
                  Ration Card Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your ration card number"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.toUpperCase())}
                  style={inputStyle}
                />
              </div>

              {/* ── Mobile Number ─────────────────────────── */}
              <div style={{ marginBottom: tab === 'new' ? '0.5rem' : '1.25rem' }}>
                <label style={labelStyle}>
                  <Smartphone size={15} />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter your mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={inputStyle}
                />
              </div>

              {/* New User note */}
              {tab === 'new' && (
                <p style={{
                  color: '#888', fontSize: '0.8125rem', textAlign: 'center',
                  margin: '0 0 1.25rem', lineHeight: 1.5,
                }}>
                  You will receive an OTP for verification
                </p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#B0A0C8' : COLORS.primary,
                  color: 'white',
                  padding: '0.9375rem',
                  borderRadius: '0.875rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '1rem',
                  letterSpacing: '0.01em',
                  transition: 'background-color 0.2s',
                }}
              >
                {loading ? 'Sending...' : tab === 'new' ? 'Register' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              {/* ── OTP Step ──────────────────────────────── */}
              <p style={{
                color: '#666', fontSize: '0.875rem', textAlign: 'center',
                marginBottom: '1.25rem', lineHeight: 1.5,
              }}>
                OTP sent to +91 {phone.slice(0, 3)}XXXXX{phone.slice(-2)}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>
                  <Smartphone size={15} />
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    letterSpacing: '0.4em',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                  }}
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#B0A0C8' : COLORS.primary,
                  color: 'white',
                  padding: '0.9375rem',
                  borderRadius: '0.875rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '1rem',
                  marginBottom: '0.75rem',
                  transition: 'background-color 0.2s',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                onClick={resendTimer > 0 ? undefined : handleSendOTP}
                disabled={resendTimer > 0}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  color: resendTimer > 0 ? '#999' : COLORS.primary,
                  fontWeight: '600', fontSize: '0.875rem',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  marginBottom: '0.5rem',
                }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>

              <button
                onClick={() => { setStep(1); setOtp(''); setError(''); setDevOtp(''); }}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  color: '#999', fontSize: '0.8125rem', cursor: 'pointer',
                }}
              >
                ← Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};