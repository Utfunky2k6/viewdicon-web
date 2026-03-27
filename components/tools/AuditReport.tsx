'use client';
import { useState } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type FindingStatus = 'Open' | 'Resolved' | 'In Review';
type Period = 'March 2026' | 'Q1 2026' | 'FY 2025-2026';

interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  evidence: string;
  recommendation: string;
  resolutionNotes: string;
  reportedBy: string;
  date: string;
}


const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string }> = {
  Critical: { color: '#ff4136', bg: 'rgba(255,65,54,0.12)' },
  High: { color: '#ff851b', bg: 'rgba(255,133,27,0.12)' },
  Medium: { color: '#ffb300', bg: 'rgba(255,179,0,0.12)' },
  Low: { color: '#4fc3f7', bg: 'rgba(79,195,247,0.12)' },
};

const STATUS_STYLE: Record<FindingStatus, { color: string; bg: string }> = {
  Open: { color: '#ff4136', bg: 'rgba(255,65,54,0.10)' },
  Resolved: { color: '#2ecc40', bg: 'rgba(46,204,64,0.10)' },
  'In Review': { color: '#ffb300', bg: 'rgba(255,179,0,0.10)' },
};

export default function AuditReport({ villageId, roleKey }: Props) {
  const [findings] = useState<AuditFinding[]>([]);
  const [period, setPeriod] = useState<Period>('Q1 2026');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const selected = findings.find((f) => f.id === selectedId) || null;

  const totalTransactions = period === 'March 2026' ? 12_480 : period === 'Q1 2026' ? 38_200 : 142_600;
  const flaggedItems = findings.filter((f) => f.status === 'Open' || f.status === 'In Review').length;
  const complianceScore = Math.round(100 - (findings.filter((f) => f.status === 'Open').length * 8 + findings.filter((f) => f.status === 'In Review').length * 3));
  const resolved = findings.filter((f) => f.status === 'Resolved').length;

  const font = 'DM Sans, Inter, sans-serif';
  const bg = '#0a0f08';
  const cardBg = 'rgba(255,255,255,0.03)';
  const text = '#f0f7f0';
  const dim = 'rgba(255,255,255,0.4)';
  const accent = '#2ecc40';
  const border = 'rgba(255,255,255,0.08)';

  return (
    <div style={{ fontFamily: font, background: bg, color: text, minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Audit Report</h1>
      <p style={{ fontSize: 13, color: dim, marginBottom: 16 }}>
        {villageId ? `Village: ${villageId}` : 'Finance Village'}{roleKey ? ` / ${roleKey}` : ''}
      </p>

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['March 2026', 'Q1 2026', 'FY 2025-2026'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: font, border: 'none',
              background: period === p ? 'rgba(46,204,64,0.15)' : 'rgba(255,255,255,0.04)',
              color: period === p ? accent : dim,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: totalTransactions.toLocaleString(), icon: '📋' },
          { label: 'Flagged Items', value: flaggedItems, icon: '🚩', color: flaggedItems > 0 ? '#ff851b' : accent },
          { label: 'Compliance Score', value: `${complianceScore}%`, icon: '🛡', color: complianceScore >= 90 ? accent : complianceScore >= 70 ? '#ffb300' : '#ff4136' },
          { label: 'Issues Resolved', value: resolved, icon: '✓' },
        ].map((s) => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: (s as any).color || text }}>{s.value}</div>
            <div style={{ fontSize: 11, color: dim }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Findings List */}
      {!selected && !showReport && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Findings ({findings.length})</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {findings.map((f) => {
              const sev = SEVERITY_CONFIG[f.severity];
              const st = STATUS_STYLE[f.status];
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}`, cursor: 'pointer', borderLeft: `3px solid ${sev.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: sev.bg, color: sev.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>
                      {f.severity}
                    </span>
                    <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5 }}>
                      {f.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: dim, lineHeight: 1.4, marginBottom: 6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' as const,
                  }}>{f.description}</div>
                  <div style={{ fontSize: 11, color: dim }}>{f.reportedBy} &middot; {f.date}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Finding Detail */}
      {selected && !showReport && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 20, border: `1px solid ${border}`, marginBottom: 20 }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ background: 'none', border: 'none', color: accent, fontSize: 13, cursor: 'pointer', fontFamily: font, padding: 0, marginBottom: 12 }}
          >
            &larr; Back to findings
          </button>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ background: SEVERITY_CONFIG[selected.severity].bg, color: SEVERITY_CONFIG[selected.severity].color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
              {selected.severity}
            </span>
            <span style={{ background: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].color, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6 }}>
              {selected.status}
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{selected.title}</h3>
          <p style={{ fontSize: 13, color: dim, lineHeight: 1.5, marginBottom: 16 }}>{selected.description}</p>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#ffb300' }}>Evidence</h4>
            <div style={{ background: 'rgba(255,179,0,0.06)', borderRadius: 8, padding: 12, fontSize: 12, color: text, lineHeight: 1.5 }}>
              {selected.evidence}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4fc3f7' }}>Recommendation</h4>
            <div style={{ background: 'rgba(79,195,247,0.06)', borderRadius: 8, padding: 12, fontSize: 12, color: text, lineHeight: 1.5 }}>
              {selected.recommendation}
            </div>
          </div>

          {selected.resolutionNotes && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: accent }}>Resolution Notes</h4>
              <div style={{ background: 'rgba(46,204,64,0.06)', borderRadius: 8, padding: 12, fontSize: 12, color: text, lineHeight: 1.5 }}>
                {selected.resolutionNotes}
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, color: dim, marginTop: 14 }}>Reported by {selected.reportedBy} on {selected.date}</div>
        </div>
      )}

      {/* Generate Report */}
      {!selected && !showReport && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowReport(true)}
            style={{
              flex: 1, background: accent, color: '#000', border: 'none', borderRadius: 10,
              padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font,
            }}
          >
            Generate Report
          </button>
        </div>
      )}

      {/* Report Preview */}
      {showReport && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 24, border: `1px solid ${border}` }}>
          <button
            onClick={() => setShowReport(false)}
            style={{ background: 'none', border: 'none', color: accent, fontSize: 13, cursor: 'pointer', fontFamily: font, padding: 0, marginBottom: 16 }}
          >
            &larr; Back
          </button>

          {/* Mock PDF preview */}
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 24, border: `1px solid ${border}`,
            marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: dim, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>AFRO VILLAGE AUDIT</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Compliance Audit Report</div>
              <div style={{ fontSize: 13, color: accent }}>{period}</div>
            </div>
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16, fontSize: 12, lineHeight: 1.8, color: dim }}>
              <p><b style={{ color: text }}>Total Transactions Audited:</b> {totalTransactions.toLocaleString()}</p>
              <p><b style={{ color: text }}>Findings:</b> {findings.length} ({findings.filter(f => f.severity === 'Critical').length} Critical, {findings.filter(f => f.severity === 'High').length} High, {findings.filter(f => f.severity === 'Medium').length} Medium, {findings.filter(f => f.severity === 'Low').length} Low)</p>
              <p><b style={{ color: text }}>Compliance Score:</b> {complianceScore}%</p>
              <p><b style={{ color: text }}>Resolved:</b> {resolved} / {findings.length}</p>
              <p><b style={{ color: text }}>Prepared by:</b> AFRO Audit Engine</p>
              <p><b style={{ color: text }}>Generated:</b> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Export Options */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Export PDF', icon: '📄' },
              { label: 'Export CSV', icon: '📊' },
              { label: 'Print', icon: '🖨' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => alert(`${opt.label} — mock action`)}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', color: text, border: `1px solid ${border}`,
                  borderRadius: 8, padding: '12px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
