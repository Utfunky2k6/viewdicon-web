'use client';

import { useState, useEffect, useRef } from 'react';

type DeviceStatus = 'online' | 'offline';
type Protocol = 'SSH' | 'HTTP' | 'RDP';

interface SavedConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: Protocol;
  status: DeviceStatus;
  lastConnected: string;
}

interface ConnectionLogEntry {
  id: string;
  deviceName: string;
  timestamp: string;
  duration: string;
  status: 'success' | 'failed' | 'timeout';
}

const font = 'DM Sans, Inter, sans-serif';
const monoFont = "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace";
const bgColor = '#0a0f08';
const cardBg = 'rgba(255,255,255,0.03)';
const textColor = '#f0f7f0';
const dimColor = 'rgba(255,255,255,0.4)';
const green = '#4ade80';
const amber = '#f59e0b';
const red = '#ef4444';
const blue = '#60a5fa';
const terminalBg = '#020804';
const terminalGreen = '#00ff41';

const INITIAL_CONNECTIONS: SavedConnection[] = [
  { id: 'd1', name: 'Kwame Market Server', host: '192.168.10.50', port: 22, protocol: 'SSH', status: 'online', lastConnected: '2026-03-26 09:45' },
  { id: 'd2', name: 'Chioma POS Gateway', host: '10.0.5.12', port: 443, protocol: 'HTTP', status: 'online', lastConnected: '2026-03-26 08:30' },
  { id: 'd3', name: 'Village Registry Node', host: '192.168.10.100', port: 22, protocol: 'SSH', status: 'offline', lastConnected: '2026-03-25 17:20' },
  { id: 'd4', name: 'Fatima Admin Desktop', host: '10.0.5.88', port: 3389, protocol: 'RDP', status: 'online', lastConnected: '2026-03-26 10:15' },
];

const CONNECTION_LOG: ConnectionLogEntry[] = [
  { id: 'cl1', deviceName: 'Kwame Market Server', timestamp: '2026-03-26 09:45', duration: '12m 34s', status: 'success' },
  { id: 'cl2', deviceName: 'Chioma POS Gateway', timestamp: '2026-03-26 08:30', duration: '5m 02s', status: 'success' },
  { id: 'cl3', deviceName: 'Village Registry Node', timestamp: '2026-03-25 17:20', duration: '0m 08s', status: 'timeout' },
  { id: 'cl4', deviceName: 'Fatima Admin Desktop', timestamp: '2026-03-25 14:55', duration: '45m 12s', status: 'success' },
  { id: 'cl5', deviceName: 'Kwame Market Server', timestamp: '2026-03-25 11:00', duration: '0m 03s', status: 'failed' },
];

const TERMINAL_OUTPUTS: Record<string, string[]> = {
  'Server Status': [
    '$ systemctl status afro-services',
    '',
    'afro-auth-core.service - AFRO Auth Core',
    '   Loaded: loaded (/etc/systemd/system/afro-auth-core.service)',
    '   Active: active (running) since Wed 2026-03-26 06:00:12 WAT; 4h ago',
    '   Memory: 128.4M',
    '   CGroup: /system.slice/afro-auth-core.service',
    '           └─2847 node /opt/afro/services/auth-core/dist/index.js',
    '',
    'afro-village-registry.service - AFRO Village Registry',
    '   Loaded: loaded (/etc/systemd/system/afro-village-registry.service)',
    '   Active: active (running) since Wed 2026-03-26 06:00:15 WAT; 4h ago',
    '   Memory: 96.2M',
    '',
    'All 8 services: 7 active, 1 inactive (village-registry-node)',
  ],
  'Disk Usage': [
    '$ df -h',
    '',
    'Filesystem      Size  Used Avail Use% Mounted on',
    '/dev/sda1       120G   67G   48G  59% /',
    '/dev/sdb1       500G  234G  241G  49% /data',
    'tmpfs           3.9G  412K  3.9G   1% /run',
    '',
    '$ du -sh /data/afro/*',
    '12G     /data/afro/postgres',
    '4.2G    /data/afro/redis',
    '890M    /data/afro/logs',
    '2.1G    /data/afro/uploads',
  ],
  'Restart Service': [
    '$ sudo systemctl restart afro-village-registry',
    '',
    'Stopping afro-village-registry.service...',
    'Stopped AFRO Village Registry.',
    'Starting afro-village-registry.service...',
    'Started AFRO Village Registry.',
    '',
    '$ systemctl is-active afro-village-registry',
    'active',
    '',
    'Service restarted successfully. PID: 14523',
  ],
  'View Logs': [
    '$ journalctl -u afro-auth-core --since "1 hour ago" --no-pager -n 15',
    '',
    'Mar 26 09:12:04 kwame-srv afro-auth[2847]: [INFO] OTP verified for +234-80-XXX-2244',
    'Mar 26 09:13:22 kwame-srv afro-auth[2847]: [INFO] Token refreshed: user afid_chioma_9k2',
    'Mar 26 09:15:01 kwame-srv afro-auth[2847]: [INFO] New ceremony started: heritage=yoruba',
    'Mar 26 09:18:45 kwame-srv afro-auth[2847]: [WARN] Rate limit hit: IP 10.0.5.33 (5 attempts)',
    'Mar 26 09:20:12 kwame-srv afro-auth[2847]: [INFO] Ceremony complete: afid_kofi_3m7 joined village finance',
    'Mar 26 09:25:30 kwame-srv afro-auth[2847]: [INFO] Session created: user afid_fatima_1p4',
    'Mar 26 09:30:00 kwame-srv afro-auth[2847]: [INFO] Health check: OK (latency 2ms)',
    'Mar 26 09:45:18 kwame-srv afro-auth[2847]: [INFO] OTP sent to +233-27-XXX-1122',
  ],
};

const CONNECT_OUTPUTS: Record<string, string[]> = {
  'd1': [
    `$ ssh root@192.168.10.50`,
    'Connecting to Kwame Market Server...',
    '',
    'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-45-generic x86_64)',
    '',
    '  System information as of Wed Mar 26 10:22:00 WAT 2026',
    '',
    '  System load:  0.42              Processes:           187',
    '  Usage of /:   59.1% of 120GB    Users logged in:     2',
    '  Memory usage: 62%               IPv4 address:        192.168.10.50',
    '  Swap usage:   3%',
    '',
    'Last login: Wed Mar 26 09:45:12 2026 from 10.0.5.1',
    'root@kwame-market:~# _',
  ],
  'd2': [
    '$ curl -I https://10.0.5.12/api/health',
    '',
    'HTTP/2 200',
    'content-type: application/json',
    'x-powered-by: AFRO POS Gateway v2.4.1',
    'x-village: commerce',
    'x-request-id: afr_req_8k2m9p',
    '',
    '{"status":"healthy","uptime":"4d 6h 22m","activeTerminals":12,"txToday":847}',
  ],
  'd3': [
    '$ ssh root@192.168.10.100',
    'Connecting to Village Registry Node...',
    '',
    'ssh: connect to host 192.168.10.100 port 22: Connection timed out',
    '',
    '[ERROR] Device is offline. Last seen: 2026-03-25 17:20 WAT',
  ],
  'd4': [
    '$ xfreerdp /v:10.0.5.88 /u:fatima',
    'Connecting to Fatima Admin Desktop via RDP...',
    '',
    '[INFO] Negotiating TLS connection...',
    '[INFO] TLS handshake complete',
    '[INFO] RDP session established',
    '[INFO] Resolution: 1920x1080, Color depth: 32-bit',
    '',
    'Remote desktop session active. Window ID: 0x2400001',
    'Connected as: fatima@AFRO-ADMIN',
  ],
};

export default function RemoteAccessTool({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [connections, setConnections] = useState<SavedConnection[]>(INITIAL_CONNECTIONS);
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalTitle, setTerminalTitle] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [form, setForm] = useState({ name: '', host: '', port: '22', protocol: 'SSH' as Protocol });
  const terminalRef = useRef<HTMLDivElement>(null);
  const fullOutputRef = useRef<string[]>([]);

  // Typing animation
  useEffect(() => {
    if (!activeTerminal || typingIndex >= fullOutputRef.current.length) return;
    const timer = setTimeout(() => {
      setTerminalLines(prev => [...prev, fullOutputRef.current[typingIndex]]);
      setTypingIndex(i => i + 1);
    }, typingIndex === 0 ? 300 : 80 + Math.random() * 60);
    return () => clearTimeout(timer);
  }, [activeTerminal, typingIndex]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const connectToDevice = (deviceId: string) => {
    const output = CONNECT_OUTPUTS[deviceId] || ['Connecting...', '', 'Connection established.'];
    const device = connections.find(c => c.id === deviceId);
    fullOutputRef.current = output;
    setTerminalLines([]);
    setTypingIndex(0);
    setActiveTerminal(deviceId);
    setTerminalTitle(device ? `${device.name} (${device.host})` : 'Terminal');
  };

  const runQuickCommand = (label: string) => {
    const output = TERMINAL_OUTPUTS[label] || ['$ ' + label.toLowerCase(), '', 'Command executed.'];
    fullOutputRef.current = output;
    setTerminalLines([]);
    setTypingIndex(0);
    setActiveTerminal('quick');
    setTerminalTitle(`Quick Command: ${label}`);
  };

  const closeTerminal = () => {
    setActiveTerminal(null);
    setTerminalLines([]);
    setTypingIndex(0);
    fullOutputRef.current = [];
  };

  const handleAddConnection = () => {
    if (!form.name || !form.host) return;
    const newConn: SavedConnection = {
      id: `d${Date.now()}`, name: form.name, host: form.host,
      port: Number(form.port) || 22, protocol: form.protocol,
      status: 'offline', lastConnected: 'Never',
    };
    setConnections(prev => [...prev, newConn]);
    setForm({ name: '', host: '', port: '22', protocol: 'SSH' });
    setShowNewForm(false);
  };

  const statusDot = (status: DeviceStatus) => (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
      background: status === 'online' ? green : red,
      boxShadow: status === 'online' ? `0 0 6px ${green}` : 'none',
    }} />
  );

  const logStatusBadge = (status: string) => {
    const colors: Record<string, string> = { success: green, failed: red, timeout: amber };
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: colors[status], background: `${colors[status]}22`, padding: '2px 6px', borderRadius: 6, textTransform: 'capitalize' }}>
        {status}
      </span>
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: textColor, fontFamily: font, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: font, color: textColor, background: bgColor, minHeight: '100vh', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Remote Access</h2>
        <p style={{ color: dimColor, fontSize: 13, margin: '4px 0 0' }}>
          Manage device connections{villageId ? ` for village ${villageId}` : ''}
        </p>
      </div>

      {/* Terminal */}
      {activeTerminal && (
        <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden', border: `1px solid ${terminalGreen}33` }}>
          <div style={{ background: 'rgba(0,255,65,0.08)', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: terminalGreen }}>{terminalTitle}</span>
            <button onClick={closeTerminal} style={{
              padding: '4px 10px', background: `${red}33`, color: red, border: `1px solid ${red}44`,
              borderRadius: 6, fontFamily: font, fontSize: 12, cursor: 'pointer',
            }}>
              Disconnect
            </button>
          </div>
          <div ref={terminalRef} style={{
            background: terminalBg, padding: 14, minHeight: 180, maxHeight: 300, overflowY: 'auto',
            fontFamily: monoFont, fontSize: 13, lineHeight: 1.6, color: terminalGreen,
          }}>
            {terminalLines.map((line, i) => (
              <div key={i} style={{ whiteSpace: 'pre-wrap', minHeight: 20 }}>
                {line}
                {i === terminalLines.length - 1 && typingIndex < fullOutputRef.current.length && (
                  <span style={{ animation: 'blink 1s infinite', opacity: 0.7 }}>|</span>
                )}
              </div>
            ))}
            {terminalLines.length > 0 && typingIndex >= fullOutputRef.current.length && (
              <div style={{ opacity: 0.5, marginTop: 4 }}>
                <span style={{ animation: 'blink 1s infinite' }}>_</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Commands */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: dimColor }}>Quick Commands</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Server Status', 'Disk Usage', 'Restart Service', 'View Logs'].map(cmd => (
            <button key={cmd} onClick={() => runQuickCommand(cmd)} style={{
              padding: '10px 12px', background: cardBg, color: textColor, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{ color: terminalGreen, marginRight: 6 }}>$</span> {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Connections */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: dimColor }}>Saved Connections</span>
          <button onClick={() => setShowNewForm(!showNewForm)} style={{
            padding: '5px 12px', background: `${green}22`, color: green, border: `1px solid ${green}44`,
            borderRadius: 8, fontFamily: font, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {showNewForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {/* New Connection Form */}
        {showNewForm && (
          <div style={{ background: cardBg, borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input placeholder="Connection name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              <input placeholder="Host / IP address" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Port" type="number" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                <select value={form.protocol} onChange={e => setForm(f => ({ ...f, protocol: e.target.value as Protocol }))} style={{ ...inputStyle, flex: 1, appearance: 'none' as const }}>
                  {(['SSH', 'HTTP', 'RDP'] as Protocol[]).map(p => <option key={p} value={p} style={{ background: '#1a1f18' }}>{p}</option>)}
                </select>
              </div>
              <button onClick={handleAddConnection} style={{
                padding: 10, background: green, color: '#0a0f08', border: 'none',
                borderRadius: 8, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                Save Connection
              </button>
            </div>
          </div>
        )}

        {/* Connection Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {connections.map(conn => (
            <div key={conn.id} style={{ background: cardBg, borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {statusDot(conn.status)}
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{conn.name}</span>
                  <span style={{ fontSize: 11, color: dimColor, background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>{conn.protocol}</span>
                </div>
                <div style={{ fontSize: 12, color: dimColor, fontFamily: monoFont }}>{conn.host}:{conn.port}</div>
                <div style={{ fontSize: 11, color: dimColor, marginTop: 2 }}>Last: {conn.lastConnected}</div>
              </div>
              <button onClick={() => connectToDevice(conn.id)} style={{
                padding: '8px 16px',
                background: conn.status === 'online' ? `${green}22` : `${red}11`,
                color: conn.status === 'online' ? green : red,
                border: `1px solid ${conn.status === 'online' ? green : red}44`,
                borderRadius: 8, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Log Toggle */}
      <button onClick={() => setShowLog(!showLog)} style={{
        width: '100%', padding: 10, background: 'rgba(255,255,255,0.04)', color: dimColor,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: font,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: showLog ? 10 : 0,
      }}>
        {showLog ? 'Hide' : 'Show'} Connection Log ({CONNECTION_LOG.length})
      </button>

      {/* Connection Log */}
      {showLog && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CONNECTION_LOG.map(entry => (
            <div key={entry.id} style={{ background: cardBg, borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.deviceName}</div>
                <div style={{ fontSize: 11, color: dimColor, marginTop: 2 }}>{entry.timestamp} | {entry.duration}</div>
              </div>
              {logStatusBadge(entry.status)}
            </div>
          ))}
        </div>
      )}

      {/* CSS for cursor blink */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
