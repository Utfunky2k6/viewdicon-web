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
const BLUE = '#3498db';
const AMBER = '#f39c12';
const PURPLE = '#9b59b6';

type DocCategory = 'Guide' | 'Standard' | 'Spec' | 'SOP';
type FilterKey = 'All' | 'Guides' | 'Standards' | 'Specs' | 'SOPs';

interface TechDoc {
  id: string;
  title: string;
  category: DocCategory;
  author: string;
  updatedAt: string;
  content: string;
}

const FILTER_MAP: Record<FilterKey, DocCategory | null> = {
  All: null,
  Guides: 'Guide',
  Standards: 'Standard',
  Specs: 'Spec',
  SOPs: 'SOP',
};


const FILTERS: FilterKey[] = ['All', 'Guides', 'Standards', 'Specs', 'SOPs'];

const categoryColor = (cat: DocCategory) => {
  switch (cat) {
    case 'Guide': return GREEN;
    case 'Standard': return BLUE;
    case 'Spec': return PURPLE;
    case 'SOP': return AMBER;
  }
};

const categoryIcon = (cat: DocCategory) => {
  switch (cat) {
    case 'Guide': return '\uD83D\uDCD7';
    case 'Standard': return '\uD83D\uDCD0';
    case 'Spec': return '\uD83D\uDCCB';
    case 'SOP': return '\uD83D\uDD27';
  }
};

export default function TechnicalDocs({ villageId, roleKey }: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [selectedDoc, setSelectedDoc] = useState<TechDoc | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // New doc form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocCategory>('Guide');
  const [newBody, setNewBody] = useState('');

  const [docs, setDocs] = useState<TechDoc[]>([]);

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase());
    const filterCat = FILTER_MAP[activeFilter];
    const matchesFilter = !filterCat || d.category === filterCat;
    return matchesSearch && matchesFilter;
  });

  const handleSaveDraft = () => {
    if (!newTitle.trim()) return;
    const doc: TechDoc = {
      id: `d${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: 'You',
      updatedAt: new Date().toISOString().slice(0, 10),
      content: newBody.trim() || `# ${newTitle.trim()}\n\nDraft document. Content pending.`,
    };
    setDocs([doc, ...docs]);
    resetNewForm();
  };

  const handlePublish = () => {
    if (!newTitle.trim()) return;
    const doc: TechDoc = {
      id: `d${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: 'You',
      updatedAt: new Date().toISOString().slice(0, 10),
      content: newBody.trim() || `# ${newTitle.trim()}\n\nPublished document.`,
    };
    setDocs([doc, ...docs]);
    resetNewForm();
    setSelectedDoc(doc);
  };

  const resetNewForm = () => {
    setNewTitle('');
    setNewBody('');
    setNewCategory('Guide');
    setShowNewForm(false);
  };

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

  // Render doc content as simple formatted text
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return (
          <div key={i} style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop: i > 0 ? 20 : 0 }}>
            {line.slice(2)}
          </div>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <div key={i} style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, marginTop: 16, color: GREEN }}>
            {line.slice(3)}
          </div>
        );
      }
      if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
        if (match) {
          return (
            <div key={i} style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 16, marginBottom: 2 }}>
              <span style={{ fontWeight: 700 }}>{match[1]}</span>
              {match[2] && <span style={{ color: 'rgba(255,255,255,0.7)' }}> {match[2]}</span>}
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
            {'\u2022'} {line.slice(2)}
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={i} style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
            {line}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={i} style={{ height: 8 }} />;
      }
      return (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
          {line}
        </div>
      );
    });
  };

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TEXT, minHeight: '100vh', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Technical Docs</h2>
        {selectedDoc && (
          <button
            onClick={() => setSelectedDoc(null)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: DIM,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
            }}
          >
            Back to List
          </button>
        )}
      </div>
      <p style={{ color: DIM, fontSize: 13, marginBottom: 16 }}>Documentation hub for village infrastructure and operations</p>

      {/* Document Preview */}
      {selectedDoc ? (
        <div
          style={{
            background: CARD_BG,
            borderRadius: 14,
            padding: '20px 18px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 10,
                background: `${categoryColor(selectedDoc.category)}22`,
                color: categoryColor(selectedDoc.category),
              }}
            >
              {selectedDoc.category}
            </span>
            <span style={{ fontSize: 11, color: DIM }}>
              by {selectedDoc.author} &middot; Updated {selectedDoc.updatedAt}
            </span>
          </div>
          {renderContent(selectedDoc.content)}
        </div>
      ) : (
        <>
          {/* Search */}
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom: 12,
              fontSize: 14,
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
                  background: activeFilter === f ? GREEN : CARD_BG,
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

          {/* New Document Button / Form */}
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
                marginBottom: 16,
              }}
            >
              + New Document
            </button>
          ) : (
            <div
              style={{
                background: CARD_BG,
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                border: '1px solid rgba(46,204,113,0.2)',
              }}
            >
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>New Document</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Document title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={inputStyle}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocCategory)}
                  style={{
                    ...inputStyle,
                    appearance: 'none' as const,
                    WebkitAppearance: 'none' as const,
                  }}
                >
                  {(['Guide', 'Standard', 'Spec', 'SOP'] as DocCategory[]).map((c) => (
                    <option key={c} value={c} style={{ background: '#1a1f18' }}>
                      {c}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Document content (markdown-style formatting supported)"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={8}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveDraft}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent',
                      color: TEXT,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: FONT,
                      cursor: 'pointer',
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
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
                    Publish
                  </button>
                  <button
                    onClick={resetNewForm}
                    style={{
                      padding: '10px 14px',
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

          {/* Document List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDocs.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDoc(d)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: CARD_BG,
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: FONT,
                  color: TEXT,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: `${categoryColor(d.category)}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {categoryIcon(d.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: DIM }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: 8,
                        background: `${categoryColor(d.category)}22`,
                        color: categoryColor(d.category),
                      }}
                    >
                      {d.category}
                    </span>
                    <span>{d.author}</span>
                    <span>&middot;</span>
                    <span>{d.updatedAt}</span>
                  </div>
                </div>
              </button>
            ))}
            {filteredDocs.length === 0 && (
              <div style={{ textAlign: 'center', color: DIM, padding: 24, fontSize: 13 }}>
                No documents match your search.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
