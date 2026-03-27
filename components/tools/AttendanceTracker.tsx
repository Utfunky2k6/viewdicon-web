'use client';

import { useState } from 'react';

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
const RED = '#e74c3c';

type AttendanceStatus = 'present' | 'late' | 'absent' | null;

interface Participant {
  id: string;
  name: string;
}

interface HistorySession {
  id: string;
  name: string;
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}


const HISTORY: HistorySession[] = [
  { id: 'h1', name: 'Village Council Meeting', date: '2026-03-24', present: 12, late: 3, absent: 2, total: 17 },
  { id: 'h2', name: 'Youth Skills Workshop', date: '2026-03-22', present: 18, late: 1, absent: 4, total: 23 },
  { id: 'h3', name: 'Harvest Planning Session', date: '2026-03-20', present: 9, late: 2, absent: 1, total: 12 },
];

export default function AttendanceTracker({ villageId, roleKey }: Props) {
  const [sessionName, setSessionName] = useState('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const setStatus = (id: string, status: AttendanceStatus) => {
    setSaved(false);
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === status ? null : status,
    }));
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  const handleSave = () => {
    setSaved(true);
  };

  const getInitial = (name: string) => name.charAt(0);

  const pctBar = (present: number, late: number, absent: number, total: number) => {
    const pPct = (present / total) * 100;
    const lPct = (late / total) * 100;
    const aPct = (absent / total) * 100;
    return (
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ width: `${pPct}%`, background: GREEN, transition: 'width 0.3s' }} />
        <div style={{ width: `${lPct}%`, background: AMBER, transition: 'width 0.3s' }} />
        <div style={{ width: `${aPct}%`, background: RED, transition: 'width 0.3s' }} />
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TEXT, minHeight: '100vh', padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Attendance Tracker</h2>
      <p style={{ color: DIM, fontSize: 13, marginBottom: 16 }}>{today}</p>

      {/* Session Name */}
      <input
        type="text"
        placeholder="Enter event or session name..."
        value={sessionName}
        onChange={(e) => { setSessionName(e.target.value); setSaved(false); }}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: CARD_BG,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          color: TEXT,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: FONT,
          marginBottom: 16,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Summary Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          background: CARD_BG,
          borderRadius: 12,
          padding: '12px 16px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{presentCount}</div>
          <div style={{ fontSize: 11, color: DIM }}>Present</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: AMBER }}>{lateCount}</div>
          <div style={{ fontSize: 11, color: DIM }}>Late</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: RED }}>{absentCount}</div>
          <div style={{ fontSize: 11, color: DIM }}>Absent</div>
        </div>
      </div>

      {/* Participants */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {([] as Participant[]).map((p) => {
          const status = attendance[p.id] || null;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: CARD_BG,
                borderRadius: 12,
                padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(46,204,113,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: GREEN,
                  flexShrink: 0,
                }}
              >
                {getInitial(p.name)}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([
                  { key: 'present' as const, label: 'P', color: GREEN },
                  { key: 'late' as const, label: 'L', color: AMBER },
                  { key: 'absent' as const, label: 'A', color: RED },
                ]).map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setStatus(p.id, btn.key)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: `1px solid ${status === btn.key ? btn.color : 'rgba(255,255,255,0.1)'}`,
                      background: status === btn.key ? `${btn.color}22` : 'transparent',
                      color: status === btn.key ? btn.color : DIM,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: FONT,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 12,
          border: 'none',
          background: saved ? 'rgba(46,204,113,0.15)' : GREEN,
          color: saved ? GREEN : '#0a0f08',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: FONT,
          cursor: 'pointer',
          marginBottom: 28,
          transition: 'all 0.3s',
        }}
      >
        {saved ? 'Attendance Saved \u2713' : 'Save Attendance'}
      </button>

      {/* History */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Past Sessions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HISTORY.map((h) => (
          <div
            key={h.id}
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{h.name}</span>
              <span style={{ fontSize: 11, color: DIM }}>{h.date}</span>
            </div>
            {pctBar(h.present, h.late, h.absent, h.total)}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: DIM }}>
              <span><span style={{ color: GREEN, fontWeight: 600 }}>{h.present}</span> Present</span>
              <span><span style={{ color: AMBER, fontWeight: 600 }}>{h.late}</span> Late</span>
              <span><span style={{ color: RED, fontWeight: 600 }}>{h.absent}</span> Absent</span>
              <span style={{ marginLeft: 'auto' }}>{Math.round((h.present / h.total) * 100)}% attendance</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
