'use client';
import { useState } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

interface MatchResult {
  id: string;
  name: string;
  avatar: string;
  have: string[];
  want: string[];
  matchScore: number;
  distance: string;
  proposed: boolean;
}

interface ActiveSwap {
  id: string;
  person: string;
  avatar: string;
  youGive: string;
  youGet: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  date: string;
}

interface BoardPost {
  id: string;
  name: string;
  avatar: string;
  offering: string;
  seeking: string;
  timeAgo: string;
}




const SWAP_STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  Pending: { color: '#ffb300', bg: 'rgba(255,179,0,0.12)' },
  Accepted: { color: '#2ecc40', bg: 'rgba(46,204,64,0.12)' },
  Completed: { color: '#4fc3f7', bg: 'rgba(79,195,247,0.12)' },
};

export default function BarterMatch({ villageId, roleKey }: Props) {
  const [haveItems, setHaveItems] = useState<string[]>([]);
  const [wantItems, setWantItems] = useState<string[]>([]);
  const [haveInput, setHaveInput] = useState('');
  const [wantInput, setWantInput] = useState('');
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [swaps] = useState<ActiveSwap[]>([]);
  const [board] = useState<BoardPost[]>([]);
  const [searching, setSearching] = useState(false);

  const addHave = () => {
    if (haveInput.trim() && !haveItems.includes(haveInput.trim())) {
      setHaveItems([...haveItems, haveInput.trim()]);
      setHaveInput('');
    }
  };

  const addWant = () => {
    if (wantInput.trim() && !wantItems.includes(wantInput.trim())) {
      setWantItems([...wantItems, wantInput.trim()]);
      setWantInput('');
    }
  };

  const removeHave = (item: string) => setHaveItems(haveItems.filter((i) => i !== item));
  const removeWant = (item: string) => setWantItems(wantItems.filter((i) => i !== item));

  const findMatches = () => {
    if (haveItems.length === 0 && wantItems.length === 0) return;
    setSearching(true);
    setTimeout(() => {
      setMatches([]);
      setSearching(false);
    }, 1200);
  };

  const proposeSwap = (id: string) => {
    if (!matches) return;
    setMatches(matches.map((m) => m.id === id ? { ...m, proposed: true } : m));
  };

  const font = 'DM Sans, Inter, sans-serif';
  const bg = '#0a0f08';
  const cardBg = 'rgba(255,255,255,0.03)';
  const text = '#f0f7f0';
  const dim = 'rgba(255,255,255,0.4)';
  const accent = '#2ecc40';
  const border = 'rgba(255,255,255,0.08)';

  const inputStyle: React.CSSProperties = {
    flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`,
    borderRadius: 8, padding: '10px 12px', color: text, fontSize: 13,
    fontFamily: font, outline: 'none', boxSizing: 'border-box',
  };

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,204,64,0.10)',
    color: accent, fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 20, margin: '0 6px 6px 0',
  };

  const sectionTitle = (label: string) => (
    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>{label}</h2>
  );

  return (
    <div style={{ fontFamily: font, background: bg, color: text, minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Barter Match</h1>
      <p style={{ fontSize: 13, color: dim, marginBottom: 20 }}>
        {villageId ? `Village: ${villageId}` : 'Commerce Village'}{roleKey ? ` / ${roleKey}` : ''} &middot; Trade without Cowries
      </p>

      {/* What I Have */}
      <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>What I Have</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            placeholder="e.g. Fresh Yam, Ankara Fabric..."
            value={haveInput}
            onChange={(e) => setHaveInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHave()}
            style={inputStyle}
          />
          <button
            onClick={addHave}
            style={{
              background: accent, color: '#000', border: 'none', borderRadius: 8,
              padding: '0 16px', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: font, flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {haveItems.length === 0 && <span style={{ fontSize: 12, color: dim }}>Add items you want to trade away</span>}
          {haveItems.map((item) => (
            <span key={item} style={chipStyle}>
              {item}
              <span onClick={() => removeHave(item)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14 }}>&times;</span>
            </span>
          ))}
        </div>
      </div>

      {/* What I Need */}
      <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>What I Need</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            placeholder="e.g. Phone Repair, Fresh Fish..."
            value={wantInput}
            onChange={(e) => setWantInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWant()}
            style={inputStyle}
          />
          <button
            onClick={addWant}
            style={{
              background: '#ffb300', color: '#000', border: 'none', borderRadius: 8,
              padding: '0 16px', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: font, flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {wantItems.length === 0 && <span style={{ fontSize: 12, color: dim }}>Add items you are looking for</span>}
          {wantItems.map((item) => (
            <span key={item} style={{ ...chipStyle, background: 'rgba(255,179,0,0.10)', color: '#ffb300' }}>
              {item}
              <span onClick={() => removeWant(item)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14 }}>&times;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Find Matches Button */}
      <button
        onClick={findMatches}
        disabled={searching || (haveItems.length === 0 && wantItems.length === 0)}
        style={{
          width: '100%', background: (haveItems.length === 0 && wantItems.length === 0) ? 'rgba(255,255,255,0.06)' : accent,
          color: (haveItems.length === 0 && wantItems.length === 0) ? dim : '#000',
          border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 15, fontWeight: 700,
          cursor: (haveItems.length === 0 && wantItems.length === 0) ? 'not-allowed' : 'pointer',
          fontFamily: font, marginBottom: 8,
        }}
      >
        {searching ? 'Searching the village...' : 'Find Matches'}
      </button>

      {/* Match Results */}
      {matches && (
        <>
          {sectionTitle(`Matches Found (${matches.length})`)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            {matches.map((m) => (
              <div key={m.id} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 28 }}>{m.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: dim }}>{m.distance} away</div>
                  </div>
                  <div style={{
                    background: m.matchScore >= 80 ? 'rgba(46,204,64,0.15)' : m.matchScore >= 60 ? 'rgba(255,179,0,0.15)' : 'rgba(255,255,255,0.06)',
                    color: m.matchScore >= 80 ? accent : m.matchScore >= 60 ? '#ffb300' : dim,
                    fontSize: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 8,
                  }}>
                    {m.matchScore}%
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: dim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>They Have</div>
                    {m.have.map((h) => (
                      <div key={h} style={{ fontSize: 12, color: accent, marginBottom: 2 }}>+ {h}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: dim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>They Want</div>
                    {m.want.map((w) => (
                      <div key={w} style={{ fontSize: 12, color: '#ffb300', marginBottom: 2 }}>- {w}</div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => proposeSwap(m.id)}
                  disabled={m.proposed}
                  style={{
                    width: '100%', background: m.proposed ? 'rgba(46,204,64,0.12)' : accent,
                    color: m.proposed ? accent : '#000', border: 'none', borderRadius: 8,
                    padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: m.proposed ? 'default' : 'pointer',
                    fontFamily: font,
                  }}
                >
                  {m.proposed ? 'Swap Proposed \u2713' : 'Propose Swap'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Active Swaps */}
      {sectionTitle('Active Swaps')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
        {swaps.map((sw) => {
          const st = SWAP_STATUS_CONFIG[sw.status];
          return (
            <div key={sw.id} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 24 }}>{sw.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{sw.person}</div>
                  <div style={{ fontSize: 11, color: dim }}>{sw.date}</div>
                </div>
                <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                  {sw.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, background: 'rgba(255,65,54,0.06)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                  <span style={{ color: dim, fontSize: 10 }}>You give</span><br />
                  <span style={{ color: '#ff6b6b' }}>{sw.youGive}</span>
                </div>
                <div style={{ fontSize: 18, color: dim }}>&#8644;</div>
                <div style={{ flex: 1, background: 'rgba(46,204,64,0.06)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                  <span style={{ color: dim, fontSize: 10 }}>You get</span><br />
                  <span style={{ color: accent }}>{sw.youGet}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Board */}
      {sectionTitle('Community Board')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {board.map((bp) => (
          <div key={bp.id} style={{ background: cardBg, borderRadius: 12, padding: 14, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24 }}>{bp.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{bp.name}</div>
              <div style={{ fontSize: 12, color: accent }}>Offering: {bp.offering}</div>
              <div style={{ fontSize: 12, color: '#ffb300' }}>Seeking: {bp.seeking}</div>
            </div>
            <div style={{ fontSize: 10, color: dim, whiteSpace: 'nowrap' }}>{bp.timeAgo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
