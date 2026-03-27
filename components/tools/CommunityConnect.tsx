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
const ACCENT = '#2ecc71';
const AMBER = '#f39c12';

interface Member {
  id: string;
  name: string;
  role: string;
  village: string;
  online: boolean;
  skills: string[];
}

interface CommunityRequest {
  id: string;
  author: string;
  category: string;
  text: string;
  time: string;
}


const INITIAL_REQUESTS: CommunityRequest[] = [
  { id: 'r1', author: 'Amaka Eze', category: 'Help Needed', text: 'Looking for someone to help repair the community well before rainy season.', time: '2h ago' },
  { id: 'r2', author: 'Kofi Mensah', category: 'Skill Share', text: 'Offering free carpentry workshop this Saturday at the builders compound.', time: '5h ago' },
  { id: 'r3', author: 'Fatima Bello', category: 'Event', text: 'Literacy circle meets tomorrow at dawn under the baobab tree. All welcome.', time: '8h ago' },
];

const FILTERS = ['All', 'Online', 'My Village', 'Skill Match'] as const;
const CATEGORIES = ['Help Needed', 'Skill Share', 'Trade', 'Event'] as const;

export default function CommunityConnect({ villageId, roleKey }: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [requestText, setRequestText] = useState('');
  const [requestCategory, setRequestCategory] = useState<string>('Help Needed');
  const [requests, setRequests] = useState<CommunityRequest[]>(INITIAL_REQUESTS);
  const [members] = useState<Member[]>([]);

  const myVillage = villageId || 'Health';

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (activeFilter === 'Online') return m.online;
    if (activeFilter === 'My Village') return m.village.toLowerCase() === myVillage.toLowerCase();
    if (activeFilter === 'Skill Match') return m.skills.length > 1;
    return true;
  });

  const toggleConnect = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const postRequest = () => {
    if (!requestText.trim()) return;
    const newReq: CommunityRequest = {
      id: `r${Date.now()}`,
      author: 'You',
      category: requestCategory,
      text: requestText.trim(),
      time: 'Just now',
    };
    setRequests([newReq, ...requests]);
    setRequestText('');
  };

  const getInitial = (name: string) => name.charAt(0);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'Help Needed': return '#e74c3c';
      case 'Skill Share': return ACCENT;
      case 'Trade': return AMBER;
      case 'Event': return '#9b59b6';
      default: return DIM;
    }
  };

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TEXT, minHeight: '100vh', padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Community Connect</h2>
      <p style={{ color: DIM, fontSize: 13, marginBottom: 16 }}>Find, connect, and collaborate with community members</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, role, or skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: CARD_BG,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          color: TEXT,
          fontSize: 14,
          fontFamily: FONT,
          marginBottom: 12,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              background: activeFilter === f ? ACCENT : CARD_BG,
              color: activeFilter === f ? '#0a0f08' : TEXT,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {filteredMembers.map((m) => (
          <div
            key={m.id}
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
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'rgba(46,204,113,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACCENT,
                }}
              >
                {getInitial(m.name)}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: m.online ? ACCENT : '#666',
                  border: `2px solid ${BG}`,
                }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: DIM }}>
                {m.role} &middot; {m.village} Village
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={() => toggleConnect(m.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: connected.has(m.id) ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.15)',
                background: connected.has(m.id) ? 'rgba(46,204,113,0.12)' : 'transparent',
                color: connected.has(m.id) ? ACCENT : TEXT,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {connected.has(m.id) ? 'Connected \u2713' : 'Connect'}
            </button>
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div style={{ textAlign: 'center', color: DIM, padding: 24, fontSize: 13 }}>No members match your search.</div>
        )}
      </div>

      {/* Post a Request */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Post a Request</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select
            value={requestCategory}
            onChange={(e) => setRequestCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              background: CARD_BG,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: TEXT,
              fontSize: 13,
              fontFamily: FONT,
              outline: 'none',
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ background: '#1a1f18' }}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="What do you need from the community?"
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && postRequest()}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: CARD_BG,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              color: TEXT,
              fontSize: 13,
              fontFamily: FONT,
              outline: 'none',
            }}
          />
          <button
            onClick={postRequest}
            style={{
              padding: '10px 18px',
              background: ACCENT,
              border: 'none',
              borderRadius: 10,
              color: '#0a0f08',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: 'pointer',
            }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Recent Requests */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Recent Requests</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {requests.map((r) => (
          <div
            key={r.id}
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: `${categoryColor(r.category)}22`,
                  color: categoryColor(r.category),
                }}
              >
                {r.category}
              </span>
              <span style={{ fontSize: 11, color: DIM, marginLeft: 'auto' }}>{r.time}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
