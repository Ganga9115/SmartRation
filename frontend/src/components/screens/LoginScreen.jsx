// src/components/screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { COLORS } from '../../utils/colors';

export const LoginScreen = ({ onNavigate }) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [step, setStep] = useState(1);
  const [rationCard, setRationCard] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOTP = async () => {
    if (!mobile) return alert('Enter mobile number');
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, rationCard })
      });
      const data = await res.json();
      if (data.success) {
        alert('OTP sent successfully');
        setStep(2);
        setResendTimer(30); // 30s cooldown
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const verifyOTP = async () => {
    if (!otp) return alert('Enter OTP');
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp })
      });
      const data = await res.json();
      if (data.success) {
        alert('Login successful');
        onNavigate('home');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const handleSubmit = () => {
    if (step === 1) sendOTP();
    else verifyOTP();
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    sendOTP();
  };

  return (
    <div
      className="w-full min-h-screen p-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl p-6 w-fit mx-auto mb-4">
            <ShoppingBag size={48} color={COLORS.primary} />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">SmartRation</h1>
          <p className="text-white/80">Welcome to your smart ration booking system</p>
        </div>

        {/* Card with Form */}
        <Card>
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsNewUser(false);
                setStep(1);
              }}
              className="flex-1 py-3 rounded-xl font-semibold transition"
              style={{
                backgroundColor: !isNewUser ? COLORS.primary : '#F3F4F6',
                color: !isNewUser ? 'white' : COLORS.text
              }}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsNewUser(true);
                setStep(1);
              }}
              className="flex-1 py-3 rounded-xl font-semibold transition"
              style={{
                backgroundColor: isNewUser ? COLORS.primary : '#F3F4F6',
                color: isNewUser ? 'white' : COLORS.text
              }}
            >
              New User
            </button>
          </div>

          {/* Step 1: Card and Mobile */}
          {step === 1 ? (
            <>
              <input
                type="text"
                placeholder="Ration Card Number"
                value={rationCard}
                onChange={(e) => setRationCard(e.target.value)}
                className="w-full p-3 border-2 rounded-xl mb-4"
                style={{ borderColor: COLORS.border }}
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full p-3 border-2 rounded-xl mb-4"
                style={{ borderColor: COLORS.border }}
              />
            </>
          ) : (
            <>
              {/* Step 2: OTP */}
              <input
                type="text"
                placeholder="Enter OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border-2 rounded-xl mb-4 text-center tracking-widest"
                style={{ borderColor: COLORS.border }}
              />
              <p className="text-sm text-gray-600 text-center mb-2">
                OTP sent to +91 {mobile.slice(-4).padStart(10, 'X')}
              </p>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="w-full text-center mb-4 font-semibold"
                style={{ color: resendTimer > 0 ? '#999' : COLORS.primary }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </>
          )}

          {/* Submit Button */}
          <Button
            title={step === 1 ? (isNewUser ? 'Register' : 'Send OTP') : 'Verify & Continue'}
            onClick={handleSubmit}
            fullWidth
          />
        </Card>
      </div>
    </div>
  );
};