'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type Env = 'DEV' | 'STAGING' | 'PROD'

const BASE_URLS: Record<Env, string> = { DEV: 'http://localhost:3000', STAGING: 'https://staging.viewdicon.com', PROD: 'https://api.viewdicon.com' }

interface Header { key: string; value: string }
interface SavedRequest { name: string; method: Method; path: string; body?: string }

const SAVED: SavedRequest[] = [
  { name: 'Get Villages', method: 'GET', path: '/api/v1/villages' },
  { name: 'Create Post', method: 'POST', path: '/api/v1/posts', body: '{\n  "content": "Hello world",\n  "type": "TEXT_DRUM"\n}' },
  { name: 'Get Profile', method: 'GET', path: '/api/v1/profile/me' },
  { name: 'Submit Session', method: 'POST', path: '/api/v1/sessions', body: '{\n  "toolKey": "price_checker",\n  "villageId": "commerce"\n}' },
]

const methodColor: Record<Method, string> = { GET: green, POST: blue, PUT: amber, DELETE: red, PATCH: gold }


export default function ApiTester({ villageId, roleKey }: ToolProps) {
  const [method, setMethod] = useState<Method>('GET')
  const [url, setUrl] = useState('/api/v1/villages')
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Authorization', value: 'Bearer <your-token>' }])
  const [body, setBody] = useState('')
  const [env, setEnv] = useState<Env>('DEV')
  const [response, setResponse] = useState<{ status: number; time: number; body: object } | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const send = async () => {
    setLoading(true); setResponse(null)
    const baseUrl = BASE_URLS[env]
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
    const headerMap = Object.fromEntries(headers.filter(h => h.key).map(h => [h.key, h.value]))
    const start = Date.now()
    try {
      const res = await fetch(fullUrl, {
        method,
        headers: headerMap,
        body: ['POST', 'PUT', 'PATCH'].includes(method) && body ? body : undefined,
      })
      const elapsed = Date.now() - start
      let resBody: object = {}
      try { resBody = await res.json() } catch { resBody = { _raw: 'non-JSON response' } }
      setResponse({ status: res.status, time: elapsed, body: resBody })
    } catch (err) {
      setResponse({ status: 0, time: Date.now() - start, body: { error: String(err) } })
    } finally {
      setLoading(false)
    }
  }

  const loadSaved = (r: SavedRequest) => { setMethod(r.method); setUrl(r.path); setBody(r.body || '') }
  const addHeader = () => setHeaders(h => [...h, { key: '', value: '' }])
  const removeHeader = (i: number) => setHeaders(h => h.filter((_, idx) => idx !== i))
  const updateHeader = (i: number, field: 'key' | 'value', val: string) => setHeaders(h => h.map((x, idx) => idx === i ? { ...x, [field]: val } : x))

  const statusColor = (s: number) => s >= 200 && s < 300 ? green : s >= 400 && s < 500 ? amber : red

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>API Tester</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>HTTP request builder — Viewdicon Developer Tools</div>

      {/* Env selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['DEV', 'STAGING', 'PROD'] as Env[]).map(e => (
          <button key={e} onClick={() => setEnv(e)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `2px solid ${env === e ? (e === 'PROD' ? red : e === 'STAGING' ? amber : green) : border}`, background: env === e ? (e === 'PROD' ? red : e === 'STAGING' ? amber : green) + '22' : 'none', color: env === e ? (e === 'PROD' ? red : e === 'STAGING' ? amber : green) : muted, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
            {e}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: muted, marginBottom: 12, fontFamily: 'monospace' }}>Base: {BASE_URLS[env]}</div>

      {/* Request builder */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select value={method} onChange={e => setMethod(e.target.value as Method)} style={{ ...inp, width: 100, fontWeight: 700, color: methodColor[method] }}>
            {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as Method[]).map(m => <option key={m} value={m} style={{ color: methodColor[m] }}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="/api/v1/..." style={{ ...inp, flex: 1, fontFamily: 'monospace' }} />
        </div>

        {/* Headers */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>HEADERS</span>
            <button onClick={addHeader} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: 11 }}>+ Add</button>
          </div>
          {headers.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <input placeholder="Key" value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} style={{ ...inp, width: '40%' }} />
              <input placeholder="Value" value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} style={{ ...inp, flex: 1 }} />
              <button onClick={() => removeHeader(i)} style={{ background: red + '22', border: `1px solid ${red}`, borderRadius: 4, color: red, cursor: 'pointer', padding: '0 6px' }}>✕</button>
            </div>
          ))}
        </div>

        {/* Body */}
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: muted, fontWeight: 700, marginBottom: 4 }}>BODY (JSON)</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={'{\n  "key": "value"\n}'} style={{ ...inp, fontFamily: 'monospace', fontSize: 12, minHeight: 90, resize: 'vertical' }} />
          </div>
        )}

        <button onClick={send} disabled={loading} style={{ ...btn(gold), width: '100%', fontSize: 14 }}>
          {loading ? '⟳ Sending...' : `⚡ Send ${method} Request`}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div style={{ background: card, border: `2px solid ${statusColor(response.status)}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: statusColor(response.status) }}>{response.status}</span>
            <span style={{ fontSize: 12, color: muted }}>{response.time}ms</span>
            <span style={{ fontSize: 10, color: statusColor(response.status), background: statusColor(response.status) + '22', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
              {response.status < 300 ? 'SUCCESS' : response.status < 500 ? 'CLIENT ERROR' : 'SERVER ERROR'}
            </span>
          </div>
          <div style={{ background: '#050c06', borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 11, color: green, overflowX: 'auto', maxHeight: 200, overflowY: 'auto' }}>
            {JSON.stringify(response.body, null, 2).split('\n').map((line, i) => (
              <div key={i} style={{ color: line.includes(':') ? (line.includes('"') ? gold : green) : line.includes('{') || line.includes('}') ? muted : text }}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Saved requests */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Saved Requests</div>
        {SAVED.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${border}`, cursor: 'pointer' }} onClick={() => loadSaved(r)}>
            <span style={{ fontSize: 10, fontWeight: 700, color: methodColor[r.method], minWidth: 45 }}>{r.method}</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: muted, flex: 1 }}>{r.path}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
