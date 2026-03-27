'use client';
import { useState, useMemo } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

type DataFormat = 'CSV' | 'JSON' | 'XLS';

interface Dataset {
  id: string;
  name: string;
  description: string;
  format: DataFormat;
  sizeMb: number;
  rows: number;
  columns: string[];
  sampleRows: string[][];
  lastModified: string;
  owner: string;
  shared: boolean;
}


const FORMAT_COLORS: Record<DataFormat, string> = {
  CSV: '#2ecc40',
  JSON: '#ffb300',
  XLS: '#4fc3f7',
};

const FORMAT_ICONS: Record<DataFormat, string> = {
  CSV: '📊',
  JSON: '{ }',
  XLS: '📑',
};

export default function DatasetVault({ villageId, roleKey }: Props) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState<DataFormat | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'name'>('date');
  const [newDs, setNewDs] = useState({ name: '', description: '', format: 'CSV' as DataFormat });

  const filtered = useMemo(() => {
    let list = datasets;
    if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (filterFormat !== 'ALL') list = list.filter((d) => d.format === filterFormat);
    if (sortBy === 'size') list = [...list].sort((a, b) => b.sizeMb - a.sizeMb);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    return list;
  }, [datasets, search, filterFormat, sortBy]);

  const selected = datasets.find((d) => d.id === selectedId) || null;

  const totalSize = datasets.reduce((a, d) => a + d.sizeMb, 0).toFixed(1);
  const sharedCount = datasets.filter((d) => d.shared).length;
  const privateCount = datasets.filter((d) => !d.shared).length;

  const toggleShare = (id: string) => {
    setDatasets(datasets.map((d) => d.id === id ? { ...d, shared: !d.shared } : d));
  };

  const handleUpload = () => {
    if (!newDs.name.trim()) return;
    const ds: Dataset = {
      id: `ds${Date.now()}`, name: newDs.name, description: newDs.description, format: newDs.format,
      sizeMb: 0.1, rows: 0, columns: ['Column A', 'Column B', 'Column C'],
      sampleRows: [['...', '...', '...']], lastModified: '2026-03-26', owner: 'You', shared: false,
    };
    setDatasets([ds, ...datasets]);
    setNewDs({ name: '', description: '', format: 'CSV' });
    setShowUpload(false);
  };

  const font = 'DM Sans, Inter, sans-serif';
  const bg = '#0a0f08';
  const cardBg = 'rgba(255,255,255,0.03)';
  const text = '#f0f7f0';
  const dim = 'rgba(255,255,255,0.4)';
  const accent = '#2ecc40';
  const border = 'rgba(255,255,255,0.08)';

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`,
    borderRadius: 8, padding: '10px 12px', color: text, fontSize: 13, marginBottom: 8,
    fontFamily: font, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: font, background: bg, color: text, minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dataset Vault</h1>
      <p style={{ fontSize: 13, color: dim, marginBottom: 20 }}>
        {villageId ? `Village: ${villageId}` : 'Technology Village'}{roleKey ? ` / ${roleKey}` : ''}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Datasets', value: datasets.length, icon: '📁' },
          { label: 'Total Size', value: `${totalSize} MB`, icon: '💾' },
          { label: 'Shared', value: sharedCount, icon: '🌍' },
          { label: 'Private', value: privateCount, icon: '🔒' },
        ].map((s) => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 12, padding: 14, border: `1px solid ${border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: dim }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 140, marginBottom: 0 }}
        />
        <select
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value as any)}
          style={{ ...inputStyle, width: 'auto', flex: 'none', marginBottom: 0, cursor: 'pointer' }}
        >
          <option value="ALL">All Formats</option>
          <option value="CSV">CSV</option>
          <option value="JSON">JSON</option>
          <option value="XLS">XLS</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{ ...inputStyle, width: 'auto', flex: 'none', marginBottom: 0, cursor: 'pointer' }}
        >
          <option value="date">By Date</option>
          <option value="size">By Size</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => { setShowUpload(!showUpload); setSelectedId(null); }}
        style={{
          background: accent, color: '#000', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: font, marginBottom: 16, width: '100%',
        }}
      >
        {showUpload ? 'Cancel' : '+ Upload Dataset'}
      </button>

      {showUpload && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${border}` }}>
          <input placeholder="Dataset Name" value={newDs.name} onChange={(e) => setNewDs({ ...newDs, name: e.target.value })} style={inputStyle} />
          <input placeholder="Description" value={newDs.description} onChange={(e) => setNewDs({ ...newDs, description: e.target.value })} style={inputStyle} />
          <select value={newDs.format} onChange={(e) => setNewDs({ ...newDs, format: e.target.value as DataFormat })} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
            <option value="XLS">XLS</option>
          </select>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `2px dashed ${border}`, borderRadius: 10, padding: 24, textAlign: 'center', marginBottom: 12, color: dim, fontSize: 13 }}>
            Drop file here or tap to browse (mock)
          </div>
          <button onClick={handleUpload} style={{ background: accent, color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font, width: '100%' }}>
            Upload
          </button>
        </div>
      )}

      {/* Dataset List */}
      {!selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((ds) => (
            <div
              key={ds.id}
              style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}`, cursor: 'pointer' }}
              onClick={() => { setSelectedId(ds.id); setShowUpload(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${FORMAT_COLORS[ds.format]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {FORMAT_ICONS[ds.format]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{ds.name}</div>
                  <div style={{ fontSize: 11, color: dim }}>{ds.owner} &middot; {ds.lastModified}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ background: `${FORMAT_COLORS[ds.format]}22`, color: FORMAT_COLORS[ds.format], fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                    {ds.format}
                  </span>
                  <span style={{ fontSize: 10, color: dim }}>{ds.sizeMb} MB &middot; {ds.rows.toLocaleString()} rows</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleShare(ds.id); }}
                  style={{
                    background: ds.shared ? 'rgba(46,204,64,0.12)' : 'rgba(255,255,255,0.05)',
                    color: ds.shared ? accent : dim, border: 'none', borderRadius: 6,
                    padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                  }}
                >
                  {ds.shared ? 'Shared' : 'Private'} &middot; Tap to toggle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dataset Preview */}
      {selected && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 20, border: `1px solid ${border}` }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ background: 'none', border: 'none', color: accent, fontSize: 13, cursor: 'pointer', fontFamily: font, padding: 0, marginBottom: 12 }}
          >
            &larr; Back to list
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{selected.name}</h3>
          <p style={{ fontSize: 12, color: dim, marginBottom: 16 }}>{selected.description}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: dim }}>Format: <b style={{ color: FORMAT_COLORS[selected.format] }}>{selected.format}</b></span>
            <span style={{ fontSize: 11, color: dim }}>Size: <b style={{ color: text }}>{selected.sizeMb} MB</b></span>
            <span style={{ fontSize: 11, color: dim }}>Rows: <b style={{ color: text }}>{selected.rows.toLocaleString()}</b></span>
            <span style={{ fontSize: 11, color: dim }}>Owner: <b style={{ color: text }}>{selected.owner}</b></span>
          </div>

          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Preview (first 5 rows)</h4>
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {selected.columns.map((col) => (
                    <th key={col} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${border}`, color: accent, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.sampleRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '7px 10px', borderBottom: `1px solid ${border}`, color: text, whiteSpace: 'nowrap' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => toggleShare(selected.id)}
              style={{
                flex: 1, background: selected.shared ? 'rgba(46,204,64,0.12)' : 'rgba(255,255,255,0.06)',
                color: selected.shared ? accent : text, border: 'none', borderRadius: 8,
                padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font,
              }}
            >
              {selected.shared ? 'Make Private' : 'Share Publicly'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
