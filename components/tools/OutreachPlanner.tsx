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
const PURPLE = '#9b59b6';
const BLUE = '#3498db';

type CampaignType = 'Door-to-Door' | 'Community Event' | 'Digital' | 'Radio';
type Outcome = 'Engaged' | 'Not Home' | 'Declined' | 'Follow Up';

interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  targetArea: string;
  startDate: string;
  reached: number;
  target: number;
}

interface VisitEntry {
  id: string;
  campaignId: string;
  household: string;
  outcome: Outcome;
  notes: string;
  time: string;
}

const CAMPAIGN_TYPES: CampaignType[] = ['Door-to-Door', 'Community Event', 'Digital', 'Radio'];
const OUTCOMES: Outcome[] = ['Engaged', 'Not Home', 'Declined', 'Follow Up'];

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'c1', title: 'Health Awareness Drive', type: 'Door-to-Door', targetArea: 'Aba North', startDate: '2026-03-20', reached: 78, target: 150 },
  { id: 'c2', title: 'Digital Literacy Program', type: 'Community Event', targetArea: 'Ikeja Central', startDate: '2026-03-18', reached: 42, target: 80 },
  { id: 'c3', title: 'Water Safety Campaign', type: 'Radio', targetArea: 'Kumasi East', startDate: '2026-03-15', reached: 230, target: 500 },
];

export default function OutreachPlanner({ villageId, roleKey }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [visits, setVisits] = useState<VisitEntry[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [logCampaignId, setLogCampaignId] = useState<string | null>(null);

  // New campaign form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CampaignType>('Door-to-Door');
  const [newArea, setNewArea] = useState('');
  const [newDate, setNewDate] = useState('');

  // Visit log form
  const [visitHousehold, setVisitHousehold] = useState('');
  const [visitOutcome, setVisitOutcome] = useState<Outcome>('Engaged');
  const [visitNotes, setVisitNotes] = useState('');

  const typeColor = (type: CampaignType) => {
    switch (type) {
      case 'Door-to-Door': return GREEN;
      case 'Community Event': return PURPLE;
      case 'Digital': return BLUE;
      case 'Radio': return AMBER;
    }
  };

  const outcomeColor = (outcome: Outcome) => {
    switch (outcome) {
      case 'Engaged': return GREEN;
      case 'Not Home': return DIM;
      case 'Declined': return '#e74c3c';
      case 'Follow Up': return AMBER;
    }
  };

  const handleCreateCampaign = () => {
    if (!newTitle.trim() || !newArea.trim()) return;
    const campaign: Campaign = {
      id: `c${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      targetArea: newArea.trim(),
      startDate: newDate || new Date().toISOString().slice(0, 10),
      reached: 0,
      target: 100,
    };
    setCampaigns([campaign, ...campaigns]);
    setNewTitle('');
    setNewArea('');
    setNewDate('');
    setShowNewForm(false);
  };

  const handleLogVisit = () => {
    if (!visitHousehold.trim() || !logCampaignId) return;
    const entry: VisitEntry = {
      id: `v${Date.now()}`,
      campaignId: logCampaignId,
      household: visitHousehold.trim(),
      outcome: visitOutcome,
      notes: visitNotes.trim(),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    setVisits([entry, ...visits]);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === logCampaignId ? { ...c, reached: c.reached + 1 } : c,
      ),
    );
    setVisitHousehold('');
    setVisitNotes('');
    setLogCampaignId(null);
  };

  // Impact stats
  const totalReached = campaigns.reduce((s, c) => s + c.reached, 0);
  const totalTarget = campaigns.reduce((s, c) => s + c.target, 0);
  const engagedCount = visits.filter((v) => v.outcome === 'Engaged').length;
  const followUpCount = visits.filter((v) => v.outcome === 'Follow Up').length;
  const engagementRate = visits.length > 0 ? Math.round((engagedCount / visits.length) * 100) : 68;
  const campaignScore = Math.min(100, Math.round((totalReached / Math.max(totalTarget, 1)) * 100) + (engagedCount * 2));

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: CARD_BG,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: TEXT,
    fontSize: 13,
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  };

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TEXT, minHeight: '100vh', padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Outreach Planner</h2>
      <p style={{ color: DIM, fontSize: 13, marginBottom: 16 }}>Plan and track community outreach campaigns</p>

      {/* Impact Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Households Reached', value: totalReached.toString(), color: GREEN },
          { label: 'Engagement Rate', value: `${engagementRate}%`, color: BLUE },
          { label: 'Follow-Ups Needed', value: (followUpCount || 7).toString(), color: AMBER },
          { label: 'Campaign Score', value: campaignScore.toString(), color: PURPLE },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: DIM, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* New Campaign Button / Form */}
      {!showNewForm ? (
        <button
          onClick={() => setShowNewForm(true)}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 12,
            border: '1px dashed rgba(255,255,255,0.15)',
            background: 'transparent',
            color: GREEN,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          + New Campaign
        </button>
      ) : (
        <div
          style={{
            background: CARD_BG,
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            border: '1px solid rgba(46,204,113,0.2)',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>New Campaign</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              placeholder="Campaign title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={inputStyle}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CampaignType)}
              style={selectStyle}
            >
              {CAMPAIGN_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: '#1a1f18' }}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Target area"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              style={inputStyle}
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreateCampaign}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: GREEN,
                  color: '#0a0f08',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: DIM,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Active Campaigns</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {campaigns.map((c) => {
          const pct = Math.round((c.reached / c.target) * 100);
          return (
            <div
              key={c.id}
              style={{
                background: CARD_BG,
                borderRadius: 14,
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{c.title}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 10px',
                    borderRadius: 10,
                    background: `${typeColor(c.type)}22`,
                    color: typeColor(c.type),
                  }}
                >
                  {c.type}
                </span>
              </div>
              <div style={{ fontSize: 12, color: DIM, marginBottom: 8 }}>
                {c.targetArea} &middot; Started {c.startDate}
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: pct >= 75 ? GREEN : pct >= 40 ? AMBER : BLUE,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 75 ? GREEN : TEXT, minWidth: 38, textAlign: 'right' }}>
                  {pct}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: DIM }}>
                  {c.reached} / {c.target} households
                </span>
                <button
                  onClick={() => setLogCampaignId(logCampaignId === c.id ? null : c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: logCampaignId === c.id ? `1px solid ${GREEN}` : '1px solid rgba(255,255,255,0.12)',
                    background: logCampaignId === c.id ? 'rgba(46,204,113,0.1)' : 'transparent',
                    color: logCampaignId === c.id ? GREEN : TEXT,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: FONT,
                    cursor: 'pointer',
                  }}
                >
                  Log Visit
                </button>
              </div>

              {/* Visit Log Form */}
              {logCampaignId === c.id && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Log Visit</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Household name"
                      value={visitHousehold}
                      onChange={(e) => setVisitHousehold(e.target.value)}
                      style={inputStyle}
                    />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {OUTCOMES.map((o) => (
                        <button
                          key={o}
                          onClick={() => setVisitOutcome(o)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 8,
                            border: `1px solid ${visitOutcome === o ? outcomeColor(o) : 'rgba(255,255,255,0.1)'}`,
                            background: visitOutcome === o ? `${outcomeColor(o)}22` : 'transparent',
                            color: visitOutcome === o ? outcomeColor(o) : DIM,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: FONT,
                            cursor: 'pointer',
                          }}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      style={inputStyle}
                    />
                    <button
                      onClick={handleLogVisit}
                      style={{
                        padding: '10px 0',
                        borderRadius: 10,
                        border: 'none',
                        background: GREEN,
                        color: '#0a0f08',
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: FONT,
                        cursor: 'pointer',
                      }}
                    >
                      Save Visit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
