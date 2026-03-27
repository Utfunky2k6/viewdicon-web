'use client';

import { useState } from 'react';

type Priority = 'urgent' | 'normal' | 'low';
type JobStatus = 'queued' | 'in_progress' | 'completed';

interface PartItem {
  name: string;
  checked: boolean;
}

interface RepairJob {
  id: string;
  item: string;
  issue: string;
  priority: Priority;
  customer: string;
  phone: string;
  status: JobStatus;
  estimatedMinutes: number;
  partsNeeded: PartItem[];
  createdAt: string;
}

const font = 'DM Sans, Inter, sans-serif';
const bg = '#0a0f08';
const cardBg = 'rgba(255,255,255,0.03)';
const textColor = '#f0f7f0';
const dimColor = 'rgba(255,255,255,0.4)';
const accent = '#4ade80';
const amber = '#f59e0b';
const blue = '#60a5fa';
const red = '#ef4444';

const PRIORITY_COLORS: Record<Priority, string> = { urgent: red, normal: blue, low: dimColor };
const STATUS_COLORS: Record<JobStatus, string> = { queued: amber, in_progress: blue, completed: accent };
const STATUS_LABELS: Record<JobStatus, string> = { queued: 'Queued', in_progress: 'In Progress', completed: 'Completed' };

const INITIAL_JOBS: RepairJob[] = [
  { id: 'r1', item: 'Honda Generator', issue: 'Carburetor blocked, not starting', priority: 'urgent', customer: 'Kwame Asante', phone: '+233 24 555 0101', status: 'in_progress', estimatedMinutes: 90, partsNeeded: [{ name: 'Carburetor kit', checked: true }, { name: 'Spark plug', checked: false }, { name: 'Fuel filter', checked: false }], createdAt: '2026-03-26 08:15' },
  { id: 'r2', item: 'Samsung Galaxy A54', issue: 'Cracked screen, touch not responding', priority: 'normal', customer: 'Chioma Obi', phone: '+234 80 333 2244', status: 'queued', estimatedMinutes: 45, partsNeeded: [{ name: 'LCD screen assembly', checked: false }, { name: 'Adhesive strips', checked: false }], createdAt: '2026-03-26 09:30' },
  { id: 'r3', item: 'Water Pump Motor', issue: 'Bearings seized, loud grinding noise', priority: 'urgent', customer: 'Kofi Mensah', phone: '+233 27 888 1122', status: 'queued', estimatedMinutes: 120, partsNeeded: [{ name: 'Bearing set (6205)', checked: false }, { name: 'Mechanical seal', checked: false }, { name: 'Grease', checked: true }], createdAt: '2026-03-26 07:45' },
  { id: 'r4', item: 'Sewing Machine', issue: 'Thread tension mechanism loose', priority: 'low', customer: 'Fatima Bello', phone: '+234 70 111 5566', status: 'completed', estimatedMinutes: 30, partsNeeded: [{ name: 'Tension spring', checked: true }, { name: 'Bobbin case', checked: true }], createdAt: '2026-03-25 16:00' },
  { id: 'r5', item: 'Inverter Battery', issue: 'Not holding charge beyond 2 hours', priority: 'normal', customer: 'Amaka Eze', phone: '+234 81 444 7788', status: 'queued', estimatedMinutes: 60, partsNeeded: [{ name: 'Battery cells (4x)', checked: false }, { name: 'Terminal connectors', checked: false }], createdAt: '2026-03-26 10:00' },
  { id: 'r6', item: 'Bicycle Chain Assembly', issue: 'Chain skipping gears, derailleur bent', priority: 'low', customer: 'Yaw Boateng', phone: '+233 55 222 3344', status: 'in_progress', estimatedMinutes: 40, partsNeeded: [{ name: 'Bike chain (6-speed)', checked: true }, { name: 'Derailleur hanger', checked: false }], createdAt: '2026-03-26 11:20' },
];

export default function RepairQueue({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [jobs, setJobs] = useState<RepairJob[]>(INITIAL_JOBS);
  const [showForm, setShowForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [form, setForm] = useState({ item: '', issue: '', priority: 'normal' as Priority, customer: '', phone: '' });

  const queued = jobs.filter(j => j.status === 'queued').length;
  const inProgress = jobs.filter(j => j.status === 'in_progress').length;
  const completedToday = jobs.filter(j => j.status === 'completed').length;

  const handleSubmit = () => {
    if (!form.item || !form.customer) return;
    const newJob: RepairJob = {
      id: `r${Date.now()}`, item: form.item, issue: form.issue, priority: form.priority,
      customer: form.customer, phone: form.phone, status: 'queued',
      estimatedMinutes: form.priority === 'urgent' ? 60 : form.priority === 'normal' ? 90 : 120,
      partsNeeded: [], createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setJobs(prev => [newJob, ...prev]);
    setForm({ item: '', issue: '', priority: 'normal', customer: '', phone: '' });
    setShowForm(false);
  };

  const advanceStatus = (id: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j;
      if (j.status === 'queued') return { ...j, status: 'in_progress' as JobStatus };
      if (j.status === 'in_progress') return { ...j, status: 'completed' as JobStatus };
      return j;
    }));
  };

  const togglePart = (jobId: string, partIndex: number) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updated = [...j.partsNeeded];
      updated[partIndex] = { ...updated[partIndex], checked: !updated[partIndex].checked };
      return { ...j, partsNeeded: updated };
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: textColor, fontFamily: font, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: font, color: textColor, background: bg, minHeight: '100vh', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Repair Queue</h2>
        <p style={{ color: dimColor, fontSize: 13, margin: '4px 0 0' }}>
          Track and manage repair jobs{villageId ? ` in village ${villageId}` : ''}
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Queued', value: queued, color: amber },
          { label: 'In Progress', value: inProgress, color: blue },
          { label: 'Completed Today', value: completedToday, color: accent },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 12, padding: 14, textAlign: 'center', border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: dimColor, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* New Job Button */}
      <button onClick={() => setShowForm(!showForm)} style={{
        width: '100%', padding: 12, background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
        borderRadius: 12, fontFamily: font, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16,
      }}>
        {showForm ? 'Cancel' : '+ New Repair Job'}
      </button>

      {/* Form */}
      {showForm && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>New Repair Job</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Item name (e.g. Honda Generator)" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Describe the issue" value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {(['urgent', 'normal', 'low'] as Priority[]).map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${PRIORITY_COLORS[p]}44`,
                  background: form.priority === p ? `${PRIORITY_COLORS[p]}33` : 'transparent',
                  color: PRIORITY_COLORS[p], fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}>
                  {p}
                </button>
              ))}
            </div>
            <input placeholder="Customer name" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} style={inputStyle} />
            <input placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
            <button onClick={handleSubmit} style={{
              padding: 12, background: accent, color: '#0a0f08', border: 'none',
              borderRadius: 10, fontFamily: font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              Add to Queue
            </button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {jobs.map(job => (
          <div key={job.id} style={{
            background: cardBg, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            display: 'flex', flexDirection: 'row',
          }}>
            {/* Priority Stripe */}
            <div style={{ width: 5, background: PRIORITY_COLORS[job.priority], flexShrink: 0 }} />

            <div style={{ flex: 1, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{job.item}</div>
                  <div style={{ fontSize: 12, color: dimColor, marginTop: 2 }}>{job.customer} | {job.phone}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: STATUS_COLORS[job.status],
                  background: `${STATUS_COLORS[job.status]}22`, padding: '2px 8px', borderRadius: 8,
                }}>
                  {STATUS_LABELS[job.status]}
                </span>
              </div>

              <div style={{ fontSize: 13, color: dimColor, marginBottom: 8 }}>{job.issue}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: amber }}>Est. {job.estimatedMinutes} min</span>
                <span style={{ fontSize: 11, color: dimColor }}>{job.createdAt}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: expandedJob === job.id ? 10 : 0 }}>
                {job.status === 'queued' && (
                  <button onClick={() => advanceStatus(job.id)} style={{
                    flex: 1, padding: '8px 0', background: `${blue}22`, color: blue, border: `1px solid ${blue}44`,
                    borderRadius: 8, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Start Job
                  </button>
                )}
                {job.status === 'in_progress' && (
                  <button onClick={() => advanceStatus(job.id)} style={{
                    flex: 1, padding: '8px 0', background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
                    borderRadius: 8, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Mark Complete
                  </button>
                )}
                {job.status === 'completed' && (
                  <span style={{ fontSize: 12, color: accent, fontWeight: 600 }}>Done</span>
                )}
                <button onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} style={{
                  padding: '8px 14px', background: 'rgba(255,255,255,0.06)', color: dimColor, border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, fontFamily: font, fontSize: 13, cursor: 'pointer',
                }}>
                  Parts {job.partsNeeded.filter(p => p.checked).length}/{job.partsNeeded.length}
                </button>
              </div>

              {/* Parts Checklist */}
              {expandedJob === job.id && job.partsNeeded.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: dimColor, marginBottom: 6 }}>Parts Needed:</div>
                  {job.partsNeeded.map((part, i) => (
                    <div key={i} onClick={() => togglePart(job.id, i)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer',
                      borderBottom: i < job.partsNeeded.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4, border: `1px solid ${part.checked ? accent : 'rgba(255,255,255,0.2)'}`,
                        background: part.checked ? `${accent}33` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: accent, flexShrink: 0,
                      }}>
                        {part.checked ? '✓' : ''}
                      </span>
                      <span style={{ fontSize: 13, color: part.checked ? accent : textColor, textDecoration: part.checked ? 'line-through' : 'none' }}>
                        {part.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {expandedJob === job.id && job.partsNeeded.length === 0 && (
                <div style={{ fontSize: 12, color: dimColor, fontStyle: 'italic' }}>No parts listed yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
