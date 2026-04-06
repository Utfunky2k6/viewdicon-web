'use client';

import { useState, useEffect, useCallback } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

const FONT = 'DM Sans, Inter, sans-serif';
const BG = '#0a0f08';
const CARD_BG = 'rgba(255,255,255,0.03)';
const TEXT = '#f0f7f0';
const DIM = 'rgba(255,255,255,0.4)';
const GREEN = '#2ecc71';
const AMBER = '#f39c12';

interface Payment {
  id: string;
  name: string;
  amount: number;
  time: string;
  status: 'RECEIVED' | 'PENDING';
}


export default function MobilePaymentCollect({ villageId, roleKey }: Props) {
  const [amount, setAmount] = useState('');
  const [generated, setGenerated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'received'>('idle');
  const [copied, setCopied] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [shared, setShared] = useState<'seso' | 'sms' | null>(null);

  const totalCollected = payments
    .filter((p) => p.status === 'RECEIVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleGenerate = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) return;
    setGenerated(true);
    setPaymentStatus('pending');
  }, [amount]);

  useEffect(() => {
    if (paymentStatus !== 'pending') return;
    const timer = setTimeout(() => {
      setPaymentStatus('received');
      const newPayment: Payment = {
        id: `tx${Date.now()}`,
        name: 'Kofi Mensah',
        amount: parseFloat(amount) || 0,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        status: 'RECEIVED',
      };
      setPayments((prev) => [newPayment, ...prev]);
    }, 3000);
    return () => clearTimeout(timer);
  }, [paymentStatus, amount]);

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setAmount('');
    setGenerated(false);
    setPaymentStatus('idle');
  };

  const formatCowrie = (n: number) =>
    `\u20A1${n.toLocaleString()}`;

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TEXT, minHeight: '100vh', padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mobile Payment Collect</h2>
      <p style={{ color: DIM, fontSize: 13, marginBottom: 20 }}>Accept payments via shareable payment links</p>

      {/* Today's Total */}
      <div
        style={{
          background: 'rgba(46,204,113,0.08)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
          border: '1px solid rgba(46,204,113,0.15)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 12, color: DIM, marginBottom: 4 }}>Today&apos;s Total Collected</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>{formatCowrie(totalCollected)}</div>
      </div>

      {!generated ? (
        <>
          {/* Amount Input */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 14,
              padding: '24px 20px',
              marginBottom: 16,
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: DIM, marginBottom: 12 }}>Enter Amount</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: DIM }}>{'\u20A1'}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: TEXT,
                  fontSize: 42,
                  fontWeight: 700,
                  fontFamily: FONT,
                  width: 200,
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              background: GREEN,
              color: '#0a0f08',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            Generate Payment Link
          </button>
        </>
      ) : (
        <>
          {/* QR Code Area */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 14,
              padding: '24px 20px',
              marginBottom: 16,
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Payment for {formatCowrie(parseFloat(amount) || 0)}
            </div>

            {/* QR Placeholder */}
            <div
              style={{
                width: 180,
                height: 180,
                margin: '0 auto 16px',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <span style={{ fontSize: 48 }}>{'\uD83D\uDD32'}</span>
              <span style={{ fontSize: 11, color: DIM, marginTop: 8 }}>QR Code</span>
            </div>

            {/* Payment Status */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 20,
                background: paymentStatus === 'received' ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)',
                color: paymentStatus === 'received' ? GREEN : AMBER,
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.3s',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: paymentStatus === 'received' ? GREEN : AMBER,
                  display: 'inline-block',
                  animation: paymentStatus === 'pending' ? 'pulse 1.5s infinite' : 'none',
                }}
              />
              {paymentStatus === 'received' ? 'Payment Received' : 'Awaiting Payment...'}
            </div>
          </div>

          {/* Share Buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: copied ? 'rgba(46,204,113,0.12)' : CARD_BG,
                color: copied ? GREEN : TEXT,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => { setShared('seso'); setTimeout(() => setShared(null), 2000) }}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: shared === 'seso' ? 'rgba(46,204,113,0.12)' : CARD_BG,
                color: shared === 'seso' ? GREEN : TEXT,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: 'pointer',
              }}
            >
              {shared === 'seso' ? 'Sent!' : '💬 Seso Chat'}
            </button>
            <button
              onClick={() => { setShared('sms'); setTimeout(() => setShared(null), 2000) }}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: shared === 'sms' ? 'rgba(46,204,113,0.12)' : CARD_BG,
                color: shared === 'sms' ? GREEN : TEXT,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: 'pointer',
              }}
            >
              {shared === 'sms' ? 'Sent!' : 'SMS'}
            </button>
          </div>

          <button
            onClick={resetForm}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: DIM,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            New Payment
          </button>
        </>
      )}

      {/* Recent Payments */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Payments</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {payments.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: CARD_BG,
              borderRadius: 12,
              padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: p.status === 'RECEIVED' ? 'rgba(46,204,113,0.12)' : 'rgba(243,156,18,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: p.status === 'RECEIVED' ? GREEN : AMBER,
                flexShrink: 0,
              }}
            >
              {p.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: DIM }}>{p.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{formatCowrie(p.amount)}</div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: p.status === 'RECEIVED' ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)',
                  color: p.status === 'RECEIVED' ? GREEN : AMBER,
                }}
              >
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
