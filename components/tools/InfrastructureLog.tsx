'use client';

import { useState } from 'react';

type Condition = 1 | 2 | 3 | 4 | 5;
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Issue {
  id: string;
  description: string;
  severity: Severity;
  reportedAt: string;
  reportedBy: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  condition: Condition;
  lastInspected: string;
  location: string;
  issues: Issue[];
  icon: string;
}

interface MaintenanceItem {
  id: string;
  assetId: string;
  assetName: string;
  task: string;
  dueDate: string;
  assignedTo: string;
}

const font = 'DM Sans, Inter, sans-serif';
const bgColor = '#0a0f08';
const cardBg = 'rgba(255,255,255,0.03)';
const textColor = '#f0f7f0';
const dimColor = 'rgba(255,255,255,0.4)';
const green = '#4ade80';
const amber = '#f59e0b';
const red = '#ef4444';
const blue = '#60a5fa';

const CONDITION_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Critical', color: red },
  2: { label: 'Poor', color: '#f97316' },
  3: { label: 'Needs Attention', color: amber },
  4: { label: 'Good', color: blue },
  5: { label: 'Excellent', color: green },
};

const SEVERITY_COLORS: Record<Severity, string> = {
  low: dimColor, medium: amber, high: '#f97316', critical: red,
};

const INITIAL_ASSETS: Asset[] = [
  { id: 'a1', name: 'Honda Generator 10kVA', type: 'Power', condition: 3, lastInspected: '2026-03-18', location: 'Market Square', issues: [{ id: 'i1', description: 'Fuel line showing cracks', severity: 'medium', reportedAt: '2026-03-20', reportedBy: 'Kwame Asante' }], icon: '⚡' },
  { id: 'a2', name: 'Solar Panel Array (12x)', type: 'Power', condition: 5, lastInspected: '2026-03-24', location: 'Community Centre Roof', issues: [], icon: '☀️' },
  { id: 'a3', name: 'Water Storage Tank 5000L', type: 'Water', condition: 4, lastInspected: '2026-03-15', location: 'Village North', issues: [], icon: '💧' },
  { id: 'a4', name: 'Main Road Segment A', type: 'Transport', condition: 2, lastInspected: '2026-03-10', location: 'Entrance to Market', issues: [{ id: 'i2', description: 'Potholes deepening, 3 reported accidents', severity: 'high', reportedAt: '2026-03-12', reportedBy: 'Chioma Obi' }, { id: 'i3', description: 'Drainage channel blocked', severity: 'medium', reportedAt: '2026-03-14', reportedBy: 'Kofi Mensah' }], icon: '🛣️' },
  { id: 'a5', name: 'Footbridge over Imo Creek', type: 'Transport', condition: 1, lastInspected: '2026-03-08', location: 'Creek Crossing East', issues: [{ id: 'i4', description: 'Wooden planks rotting, unsafe for heavy loads', severity: 'critical', reportedAt: '2026-03-09', reportedBy: 'Fatima Bello' }], icon: '🌉' },
  { id: 'a6', name: 'Power Line Section 3', type: 'Power', condition: 3, lastInspected: '2026-03-20', location: 'School to Clinic Route', issues: [{ id: 'i5', description: 'Sagging lines near school fence', severity: 'high', reportedAt: '2026-03-22', reportedBy: 'Amaka Eze' }], icon: '🔌' },
];

const MAINTENANCE_SCHEDULE: MaintenanceItem[] = [
  { id: 'm1', assetId: 'a1', assetName: 'Honda Generator', task: 'Oil change and filter replacement', dueDate: '2026-03-28', assignedTo: 'Kwame Asante' },
  { id: 'm2', assetId: 'a3', assetName: 'Water Storage Tank', task: 'Clean and inspect for leaks', dueDate: '2026-03-30', assignedTo: 'Kofi Mensah' },
  { id: 'm3', assetId: 'a2', assetName: 'Solar Panel Array', task: 'Panel cleaning and wiring check', dueDate: '2026-04-02', assignedTo: 'Chioma Obi' },
];

export default function InfrastructureLog({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [inspectingAsset, setInspectingAsset] = useState<string | null>(null);
  const [loggingIssue, setLoggingIssue] = useState<string | null>(null);
  const [inspectForm, setInspectForm] = useState({ condition: 4 as Condition, notes: '' });
  const [issueForm, setIssueForm] = useState({ description: '', severity: 'medium' as Severity });

  const totalAssets = assets.length;
  const goodCount = assets.filter(a => a.condition >= 4).length;
  const attentionCount = assets.filter(a => a.condition === 2 || a.condition === 3).length;
  const criticalCount = assets.filter(a => a.condition === 1).length;

  const handleInspect = (assetId: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return { ...a, condition: inspectForm.condition, lastInspected: new Date().toISOString().slice(0, 10) };
    }));
    setInspectForm({ condition: 4, notes: '' });
    setInspectingAsset(null);
  };

  const handleLogIssue = (assetId: string) => {
    if (!issueForm.description) return;
    const newIssue: Issue = {
      id: `i${Date.now()}`, description: issueForm.description,
      severity: issueForm.severity, reportedAt: new Date().toISOString().slice(0, 10), reportedBy: 'You',
    };
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return { ...a, issues: [...a.issues, newIssue] };
    }));
    setIssueForm({ description: '', severity: 'medium' });
    setLoggingIssue(null);
  };

  const conditionBar = (condition: Condition) => {
    const cfg = CONDITION_CONFIG[condition];
    const pct = (condition / 5) * 100;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: cfg.color, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
      </div>
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: textColor, fontFamily: font, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: font, color: textColor, background: bgColor, minHeight: '100vh', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Infrastructure Log</h2>
        <p style={{ color: dimColor, fontSize: 13, margin: '4px 0 0' }}>
          Track assets and conditions{villageId ? ` for village ${villageId}` : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Assets', value: totalAssets, color: textColor },
          { label: 'Good', value: goodCount, color: green },
          { label: 'Attention', value: attentionCount, color: amber },
          { label: 'Critical', value: criticalCount, color: red },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 10, padding: 12, textAlign: 'center', border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: dimColor, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Asset List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {assets.map(asset => {
          const isExpanded = expandedAsset === asset.id;
          const isInspecting = inspectingAsset === asset.id;
          const isLogging = loggingIssue === asset.id;
          return (
            <div key={asset.id} style={{ background: cardBg, borderRadius: 14, padding: 14, border: `1px solid ${CONDITION_CONFIG[asset.condition].color}22` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8, cursor: 'pointer' }} onClick={() => setExpandedAsset(isExpanded ? null : asset.id)}>
                <span style={{ fontSize: 28 }}>{asset.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{asset.name}</span>
                    <span style={{ fontSize: 11, color: dimColor, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>{asset.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: dimColor, marginTop: 2 }}>{asset.location}</div>
                  <div style={{ marginTop: 6 }}>{conditionBar(asset.condition)}</div>
                  <div style={{ fontSize: 11, color: dimColor, marginTop: 4 }}>Last inspected: {asset.lastInspected}</div>
                  {asset.issues.length > 0 && (
                    <div style={{ fontSize: 11, color: amber, marginTop: 2 }}>{asset.issues.length} open issue{asset.issues.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  {/* Issues */}
                  {asset.issues.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: dimColor, marginBottom: 6 }}>Open Issues</div>
                      {asset.issues.map(issue => (
                        <div key={issue.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 10, marginBottom: 6, borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity]}` }}>
                          <div style={{ fontSize: 13 }}>{issue.description}</div>
                          <div style={{ fontSize: 11, color: dimColor, marginTop: 4 }}>
                            <span style={{ color: SEVERITY_COLORS[issue.severity], fontWeight: 600, textTransform: 'capitalize' }}>{issue.severity}</span>
                            {' | '}{issue.reportedBy} | {issue.reportedAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: isInspecting || isLogging ? 10 : 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); setInspectingAsset(isInspecting ? null : asset.id); setLoggingIssue(null); }} style={{
                      flex: 1, padding: '8px 0', background: `${blue}22`, color: blue, border: `1px solid ${blue}44`,
                      borderRadius: 8, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Inspect
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setLoggingIssue(isLogging ? null : asset.id); setInspectingAsset(null); }} style={{
                      flex: 1, padding: '8px 0', background: `${amber}22`, color: amber, border: `1px solid ${amber}44`,
                      borderRadius: 8, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Log Issue
                    </button>
                  </div>

                  {/* Inspect Form */}
                  {isInspecting && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Condition Assessment</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        {([1, 2, 3, 4, 5] as Condition[]).map(c => (
                          <button key={c} onClick={() => setInspectForm(f => ({ ...f, condition: c }))} style={{
                            flex: 1, padding: '8px 0', borderRadius: 8,
                            border: `1px solid ${CONDITION_CONFIG[c].color}44`,
                            background: inspectForm.condition === c ? `${CONDITION_CONFIG[c].color}33` : 'transparent',
                            color: CONDITION_CONFIG[c].color, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          }}>
                            {c}
                          </button>
                        ))}
                      </div>
                      <textarea placeholder="Inspection notes..." value={inspectForm.notes} onChange={e => setInspectForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
                      <div style={{ fontSize: 12, color: dimColor, marginBottom: 8, fontStyle: 'italic' }}>Photo upload: [camera placeholder]</div>
                      <button onClick={() => handleInspect(asset.id)} style={{
                        width: '100%', padding: 10, background: blue, color: '#0a0f08', border: 'none',
                        borderRadius: 8, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      }}>
                        Submit Inspection
                      </button>
                    </div>
                  )}

                  {/* Log Issue Form */}
                  {isLogging && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Log New Issue</div>
                      <textarea placeholder="Describe the issue..." value={issueForm.description} onChange={e => setIssueForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        {(['low', 'medium', 'high', 'critical'] as Severity[]).map(s => (
                          <button key={s} onClick={() => setIssueForm(f => ({ ...f, severity: s }))} style={{
                            flex: 1, padding: '6px 0', borderRadius: 8,
                            border: `1px solid ${SEVERITY_COLORS[s]}44`,
                            background: issueForm.severity === s ? `${SEVERITY_COLORS[s]}33` : 'transparent',
                            color: SEVERITY_COLORS[s], fontFamily: font, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                          }}>
                            {s}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => handleLogIssue(asset.id)} style={{
                        width: '100%', padding: 10, background: amber, color: '#0a0f08', border: 'none',
                        borderRadius: 8, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      }}>
                        Submit Issue
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Maintenance Schedule */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px' }}>Upcoming Maintenance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MAINTENANCE_SCHEDULE.map(m => (
            <div key={m.id} style={{ background: cardBg, borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.task}</div>
                <div style={{ fontSize: 12, color: dimColor, marginTop: 2 }}>{m.assetName} | Assigned: {m.assignedTo}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: blue }}>{m.dueDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
