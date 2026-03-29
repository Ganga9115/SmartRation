import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { COLORS } from '../../utils/colors';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export const LoginScreen = ({ onNavigate }) => {
  const { login } = useAuth();
  const [step, setStep]               = useState(1);
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    setError('');
    if (!phone || phone.length !== 10) return setError('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(phone);
      if (res.data.success) {
        setStep(2);
        setResendTimer(30);
        // Show OTP in dev mode
        if (res.data.otp) setError(`Dev OTP: ${res.data.otp}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(phone, otp);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        // New user → register ration card first
        if (res.data.user.isNewUser) {
          onNavigate('ration-card');
        } else {
          onNavigate('home');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.primary }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl p-6 w-fit mx-auto mb-4">
            <ShoppingBag size={48} color={COLORS.primary} />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">SmartRation</h1>
          <p className="text-white/80">Smart ration booking system</p>
        </div>

        <Card>
          <h2 style={{ color: COLORS.primary }} className="text-xl font-bold mb-6 text-center">
            {step === 1 ? 'Enter your mobile number' : 'Verify OTP'}
          </h2>

          {error && (
            <div className={`p-3 rounded-xl mb-4 text-sm text-center ${
              error.startsWith('Dev') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="flex border-2 rounded-xl mb-4 overflow-hidden"
                style={{ borderColor: COLORS.border }}>
                <span className="px-3 py-3 bg-gray-50 text-gray-500 border-r"
                  style={{ borderColor: COLORS.border }}>+91</span>
                <input
                  type="tel" maxLength="10"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 outline-none"
                />
              </div>
              <Button title={loading ? 'Sending...' : 'Send OTP'}
                onClick={handleSendOTP} fullWidth disabled={loading} />
            </>
          ) : (
            <>
              <p className="text-center text-gray-500 text-sm mb-4">
                OTP sent to +91 {phone.slice(0,3)}XXXXX{phone.slice(-2)}
              </p>
              <input
                type="text" maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 border-2 rounded-xl mb-4 text-center tracking-widest text-lg"
                style={{ borderColor: COLORS.border }}
              />
              <Button title={loading ? 'Verifying...' : 'Verify & Continue'}
                onClick={handleVerifyOTP} fullWidth disabled={loading} />
              <button onClick={resendTimer > 0 ? null : handleSendOTP}
                className="w-full text-center mt-3 text-sm font-semibold"
                style={{ color: resendTimer > 0 ? '#999' : COLORS.primary }}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
              <button onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-center mt-2 text-sm"
                style={{ color: COLORS.textLight }}>
                ← Change number
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};