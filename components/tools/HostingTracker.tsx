'use client';
import { useState } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

type ServiceStatus = 'running' | 'warning' | 'down';

interface HostingService {
  id: string;
  name: string;
  type: string;
  url: string;
  provider: string;
  status: ServiceStatus;
  uptimePercent: number;
  lastChecked: string;
  cpu: number;
  memory: number;
  storage: number;
}

interface Domain {
  id: string;
  name: string;
  ssl: boolean;
  sslExpiry: string;
  renewalDue: boolean;
  registrar: string;
}



const STATUS_COLOR: Record<ServiceStatus, string> = {
  running: '#2ecc40',
  warning: '#ffb300',
  down: '#ff4136',
};

export default function HostingTracker({ villageId, roleKey }: Props) {
  const [services, setServices] = useState<HostingService[]>([]);
  const [domains] = useState<Domain[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', type: '', url: '', provider: '' });
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const totalServices = services.length;
  const avgUptime = (services.reduce((a, s) => a + s.uptimePercent, 0) / totalServices).toFixed(2);
  const totalDomains = domains.length;
  const monthlyCost = 4_250;

  const handleAddService = () => {
    if (!newService.name.trim()) return;
    const svc: HostingService = {
      id: `s${Date.now()}`,
      name: newService.name,
      type: newService.type || 'Custom',
      url: newService.url || 'https://...',
      provider: newService.provider || 'Self-hosted',
      status: 'running',
      uptimePercent: 100,
      lastChecked: 'just now',
      cpu: 0,
      memory: 0,
      storage: 0,
    };
    setServices([...services, svc]);
    setNewService({ name: '', type: '', url: '', provider: '' });
    setShowAddForm(false);
  };

  const font = 'DM Sans, Inter, sans-serif';
  const bg = '#0a0f08';
  const cardBg = 'rgba(255,255,255,0.03)';
  const text = '#f0f7f0';
  const dim = 'rgba(255,255,255,0.4)';
  const accent = '#2ecc40';
  const border = 'rgba(255,255,255,0.08)';

  const ResourceBar = ({ label, value }: { label: string; value: number }) => {
    const color = value > 80 ? '#ff4136' : value > 60 ? '#ffb300' : accent;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: dim, width: 56 }}>{label}</span>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 11, color: text, width: 32, textAlign: 'right' }}>{value}%</span>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: font, background: bg, color: text, minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Hosting Tracker</h1>
      <p style={{ fontSize: 13, color: dim, marginBottom: 20 }}>
        {villageId ? `Village: ${villageId}` : 'Technology Village'}{roleKey ? ` / ${roleKey}` : ''}
      </p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Services', value: totalServices, icon: '🖥' },
          { label: 'Uptime Average', value: `${avgUptime}%`, icon: '📈' },
          { label: 'Domains', value: totalDomains, icon: '🌐' },
          { label: 'Monthly Cost', value: `₡${monthlyCost.toLocaleString()}`, icon: '💰' },
        ].map((s) => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: dim }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Services</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: accent, color: '#000', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font,
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${border}` }}>
          {['name', 'type', 'url', 'provider'].map((field) => (
            <input
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(newService as any)[field]}
              onChange={(e) => setNewService({ ...newService, [field]: e.target.value })}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`,
                borderRadius: 8, padding: '10px 12px', color: text, fontSize: 13, marginBottom: 8,
                fontFamily: font, outline: 'none', boxSizing: 'border-box',
              }}
            />
          ))}
          <button
            onClick={handleAddService}
            style={{
              background: accent, color: '#000', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font, width: '100%',
            }}
          >
            Add Service
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {services.map((svc) => (
          <div
            key={svc.id}
            style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}`, cursor: 'pointer' }}
            onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: expandedService === svc.id ? 12 : 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[svc.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{svc.name}</div>
                <div style={{ fontSize: 11, color: dim }}>{svc.type} &middot; {svc.provider}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{svc.uptimePercent}%</div>
                <div style={{ fontSize: 10, color: dim }}>{svc.lastChecked}</div>
              </div>
            </div>
            {expandedService === svc.id && (
              <div style={{ paddingTop: 8, borderTop: `1px solid ${border}` }}>
                <div style={{ fontSize: 11, color: dim, marginBottom: 8 }}>{svc.url}</div>
                <ResourceBar label="CPU" value={svc.cpu} />
                <ResourceBar label="Memory" value={svc.memory} />
                <ResourceBar label="Storage" value={svc.storage} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Domains */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Domains</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {domains.map((d) => (
          <div key={d.id} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(46,204,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {d.ssl ? '🔒' : '🔓'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: dim }}>SSL expires {d.sslExpiry} &middot; {d.registrar}</div>
            </div>
            {d.renewalDue && (
              <div style={{ background: 'rgba(255,179,0,0.15)', color: '#ffb300', fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
                RENEW SOON
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
