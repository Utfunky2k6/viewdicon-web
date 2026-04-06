'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Staff { id: string; name: string; initials: string; role: string; status: 'ACTIVE' | 'BREAK' | 'OFF'; shift: string; phone: string; rating: number; pay?: string }
interface LeaveRequest { id: string; name: string; from: string; to: string; reason: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100'

const INIT_STAFF: Staff[] = [
  { id: 's1', name: 'Elder Adewale Fashola',  initials: 'AF', role: 'Market Elder',   status: 'ACTIVE', shift: '07:00–15:00', phone: '+234 801 111 2222', rating: 5 },
  { id: 's2', name: 'Ngozi Adaeze Obi',       initials: 'NO', role: 'Health Officer', status: 'ACTIVE', shift: '08:00–16:00', phone: '+234 802 333 4444', rating: 4 },
  { id: 's3', name: 'Kwame Asante Boateng',   initials: 'KB', role: 'Security Lead',  status: 'BREAK',  shift: '00:00–08:00', phone: '+234 803 555 6666', rating: 4 },
  { id: 's4', name: 'Amina Bello Yusuf',      initials: 'AY', role: 'Finance Clerk',  status: 'ACTIVE', shift: '09:00–17:00', phone: '+234 804 777 8888', rating: 5 },
  { id: 's5', name: 'Chukwu Eze Ifeoma',      initials: 'CE', role: 'Logistics',      status: 'OFF',    shift: 'Rest day',     phone: '+234 805 999 0000', rating: 3 },
  { id: 's6', name: 'Fatima Usman Aliyu',     initials: 'FA', role: 'Admin',          status: 'ACTIVE', shift: '08:30–16:30', phone: '+234 806 111 3333', rating: 4 },
]

const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', name: 'Chukwu Eze Ifeoma',  from: '2026-03-28', to: '2026-04-02', reason: 'Family naming ceremony' },
  { id: 'l2', name: 'Kwame Asante Boateng', from: '2026-04-05', to: '2026-04-07', reason: 'Medical appointment' },
]

const statusColor = (s: string) => s === 'ACTIVE' ? '#4caf50' : s === 'BREAK' ? '#fbc02d' : '#546e7a'
const statusLabel = (s: string) => s === 'ACTIVE' ? 'ACTIVE' : s === 'BREAK' ? 'BREAK' : 'OFF'

export default function StaffManager({ villageId: _v, roleKey: _r }: ToolProps) {
  const [staff, setStaff] = useState<Staff[]>(INIT_STAFF)
  const [leaves, setLeaves] = useState<LeaveRequest[]>(LEAVE_REQUESTS)
  const [showShift, setShowShift] = useState(false)
  const [shiftStaff, setShiftStaff] = useState('s1')
  const [shiftDate, setShiftDate] = useState('')
  const [shiftStart, setShiftStart] = useState('')
  const [shiftEnd, setShiftEnd] = useState('')
  const [shiftSaved, setShiftSaved] = useState(false)

  const onDuty = staff.filter(s => s.status !== 'OFF').length

  const setRating = (id: string, r: number) =>
    setStaff(st => st.map(s => s.id === id ? { ...s, rating: r } : s))

  const saveShift = () => {
    if (!shiftDate || !shiftStart) return
    setShiftSaved(true)
    setTimeout(() => { setShiftSaved(false); setShowShift(false) }, 2000)
  }

  const handleLeave = (id: string, approved: boolean) => {
    setLeaves(ls => ls.filter(l => l.id !== id))
    if (approved) {
      // mark staff as off for that period
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>👥 Staff Manager</h2>
        <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
          On Duty: <span style={{ color: '#a5d6a7', fontWeight: 700 }}>{onDuty}/{staff.length}</span>
        </div>
      </div>

      {/* Staff Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {staff.map(s => (
          <div key={s.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e3a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, color: '#a5d6a7' }}>
              {s.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(s.status), flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
              </div>
              <div style={{ fontSize: 11, color: MT }}>{s.role} · {s.shift}</div>
              <div style={{ fontSize: 11, color: MT }}>{s.phone}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ background: statusColor(s.status) + '22', color: statusColor(s.status), padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                {statusLabel(s.status)}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onClick={() => setRating(s.id, n)} style={{ cursor: 'pointer', fontSize: 13, color: n <= s.rating ? '#fbc02d' : '#1e3a20' }}>★</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Shift */}
      <button
        onClick={() => setShowShift(v => !v)}
        style={{ width: '100%', padding: 12, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
      >
        {showShift ? '✕ Cancel' : '📅 Add Shift'}
      </button>

      {showShift && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {shiftSaved
            ? <div style={{ textAlign: 'center', padding: 14, color: '#a5d6a7' }}>✅ Shift added!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>STAFF MEMBER</div>
                  <select value={shiftStaff} onChange={e => setShiftStaff(e.target.value)}
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {[['DATE', shiftDate, setShiftDate, 'date', '2026-03-27'], ['START TIME', shiftStart, setShiftStart, 'time', '08:00'], ['END TIME', shiftEnd, setShiftEnd, 'time', '16:00']].map(([label, val, setter, type, ph]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>{label as string}</div>
                    <input
                      type={type as string}
                      value={val as string}
                      onChange={e => (setter as (x: string) => void)(e.target.value)}
                      placeholder={ph as string}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button onClick={saveShift} style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Save Shift
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Leave Requests */}
      {leaves.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            <span>LEAVE REQUESTS</span>
            <span style={{ background: AM, color: '#fff', padding: '1px 8px', borderRadius: 10 }}>{leaves.length} pending</span>
          </div>
          {leaves.map((l, i) => (
            <div key={l.id} style={{ padding: '12px 14px', borderBottom: i < leaves.length - 1 ? `1px solid ${BD}` : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
              <div style={{ fontSize: 12, color: MT, marginTop: 2 }}>{l.from} → {l.to} · {l.reason}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => handleLeave(l.id, true)}
                  style={{ flex: 1, padding: '7px', background: GR, border: 'none', borderRadius: 7, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  ✅ Approve
                </button>
                <button onClick={() => handleLeave(l.id, false)}
                  style={{ flex: 1, padding: '7px', background: '#1a0505', border: `1px solid #c62828`, borderRadius: 7, color: '#ef9a9a', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  ✕ Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payroll */}
      <button onClick={() => { const csv = 'Name,Role,Status,Pay\n' + staff.map(s => `${s.name},${s.role},${s.status},${s.pay}`).join('\n'); const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'payroll-report.csv'; a.click() }} style={{ width: '100%', padding: 11, background: CARD, border: `1px solid ${BD}`, borderRadius: 10, color: TX, fontSize: 13, cursor: 'pointer' }}>
        💰 Export Payroll Report
      </button>
    </div>
  )
}
