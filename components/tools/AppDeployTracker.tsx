'use client';
import { useState, useEffect, useCallback } from 'react';

interface Props {
  villageId?: string;
  roleKey?: string;
}

type DeployStatus = 'success' | 'deploying' | 'failed' | 'rolled_back';
type Environment = 'Production' | 'Staging' | 'Dev';

interface Deployment {
  id: string;
  version: string;
  environment: Environment;
  status: DeployStatus;
  commitMessage: string;
  author: string;
  timestamp: string;
}

type DeployStep = 'Build' | 'Test' | 'Deploy';


const STATUS_CONFIG: Record<DeployStatus, { color: string; label: string; bg: string }> = {
  success: { color: '#2ecc40', label: 'Success', bg: 'rgba(46,204,64,0.12)' },
  deploying: { color: '#ffb300', label: 'Deploying...', bg: 'rgba(255,179,0,0.12)' },
  failed: { color: '#ff4136', label: 'Failed', bg: 'rgba(255,65,54,0.12)' },
  rolled_back: { color: '#9e9e9e', label: 'Rolled Back', bg: 'rgba(158,158,158,0.12)' },
};

const ENV_COLORS: Record<Environment, string> = {
  Production: '#2ecc40',
  Staging: '#ffb300',
  Dev: '#4fc3f7',
};

const DEPLOY_STEPS: DeployStep[] = ['Build', 'Test', 'Deploy'];

export default function AppDeployTracker({ villageId, roleKey }: Props) {
  const [deploys, setDeploys] = useState<Deployment[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployEnv, setDeployEnv] = useState<Environment>('Staging');
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployDone, setDeployDone] = useState(false);

  const latest = deploys[0];

  const envHealth: Record<Environment, { status: string; version: string; uptime: string }> = {
    Production: { status: 'Healthy', version: 'v2.14.0', uptime: '14d 6h' },
    Staging: { status: 'Warning', version: 'v2.14.0-rc.2', uptime: '2d 11h' },
    Dev: { status: 'Healthy', version: 'v2.13.8', uptime: '5d 3h' },
  };

  const runDeploy = useCallback(() => {
    setDeploying(true);
    setDeployStep(0);
    setDeployDone(false);
  }, []);

  useEffect(() => {
    if (!deploying) return;
    if (deployStep >= DEPLOY_STEPS.length) {
      setDeploying(false);
      setDeployDone(true);
      const newDep: Deployment = {
        id: `dep${Date.now()}`,
        version: `v2.15.0-${deployEnv.toLowerCase().slice(0, 4)}`,
        environment: deployEnv,
        status: 'success',
        commitMessage: 'Manual deploy from Hosting Tracker',
        author: 'You',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setDeploys([newDep, ...deploys]);
      return;
    }
    const timer = setTimeout(() => setDeployStep((s) => s + 1), 1800);
    return () => clearTimeout(timer);
  }, [deploying, deployStep, deployEnv, deploys]);

  const handleRollback = (id: string) => {
    setDeploys(deploys.map((d) => d.id === id ? { ...d, status: 'rolled_back' as DeployStatus } : d));
  };

  const font = 'DM Sans, Inter, sans-serif';
  const bg = '#0a0f08';
  const cardBg = 'rgba(255,255,255,0.03)';
  const text = '#f0f7f0';
  const dim = 'rgba(255,255,255,0.4)';
  const accent = '#2ecc40';
  const border = 'rgba(255,255,255,0.08)';

  return (
    <div style={{ fontFamily: font, background: bg, color: text, minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>App Deploy Tracker</h1>
      <p style={{ fontSize: 13, color: dim, marginBottom: 20 }}>
        {villageId ? `Village: ${villageId}` : 'Technology Village'}{roleKey ? ` / ${roleKey}` : ''}
      </p>

      {/* Latest Deploy Hero */}
      <div style={{
        background: STATUS_CONFIG[latest.status].bg, borderRadius: 14, padding: 20,
        border: `1px solid ${STATUS_CONFIG[latest.status].color}33`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Latest Deploy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUS_CONFIG[latest.status].color }} />
          <span style={{ fontSize: 20, fontWeight: 700 }}>{latest.version}</span>
          <span style={{
            background: `${ENV_COLORS[latest.environment]}22`, color: ENV_COLORS[latest.environment],
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
          }}>
            {latest.environment}
          </span>
        </div>
        <div style={{ fontSize: 13, color: dim }}>{latest.commitMessage}</div>
        <div style={{ fontSize: 11, color: dim, marginTop: 4 }}>{latest.author} &middot; {latest.timestamp}</div>
      </div>

      {/* Environment Health */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Environment Health</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {(['Production', 'Staging', 'Dev'] as Environment[]).map((env) => {
          const h = envHealth[env];
          const clr = ENV_COLORS[env];
          return (
            <div key={env} style={{ background: cardBg, borderRadius: 12, padding: 14, border: `1px solid ${border}`, borderTop: `3px solid ${clr}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{env}</div>
              <div style={{ fontSize: 11, color: clr, fontWeight: 600, marginBottom: 2 }}>{h.status}</div>
              <div style={{ fontSize: 10, color: dim }}>{h.version}</div>
              <div style={{ fontSize: 10, color: dim }}>Uptime: {h.uptime}</div>
            </div>
          );
        })}
      </div>

      {/* Deploy Now */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Deploy History</h2>
        <button
          onClick={() => { setShowDeployModal(!showDeployModal); setDeployDone(false); }}
          style={{
            background: accent, color: '#000', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font,
          }}
        >
          Deploy Now
        </button>
      </div>

      {showDeployModal && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 20, marginBottom: 16, border: `1px solid ${border}` }}>
          {!deploying && !deployDone && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Select Environment</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['Production', 'Staging', 'Dev'] as Environment[]).map((env) => (
                  <button
                    key={env}
                    onClick={() => setDeployEnv(env)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: font, border: 'none',
                      background: deployEnv === env ? `${ENV_COLORS[env]}22` : 'rgba(255,255,255,0.04)',
                      color: deployEnv === env ? ENV_COLORS[env] : dim,
                    }}
                  >
                    {env}
                  </button>
                ))}
              </div>
              <button
                onClick={runDeploy}
                style={{
                  width: '100%', background: accent, color: '#000', border: 'none', borderRadius: 8,
                  padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font,
                }}
              >
                Start Deploy to {deployEnv}
              </button>
            </>
          )}

          {deploying && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Deploying to {deployEnv}...</div>
              {DEPLOY_STEPS.map((step, i) => {
                const done = deployStep > i;
                const active = deployStep === i;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      background: done ? accent : active ? '#ffb300' : 'rgba(255,255,255,0.06)',
                      color: done ? '#000' : active ? '#000' : dim,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: done ? accent : active ? '#ffb300' : dim }}>{step}</div>
                      {active && (
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', background: '#ffb300', borderRadius: 2,
                            animation: 'deployProgress 1.8s linear forwards',
                            width: '0%',
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <style>{`@keyframes deployProgress { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
          )}

          {deployDone && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: accent, marginBottom: 4 }}>Deploy Complete</div>
              <div style={{ fontSize: 12, color: dim }}>Successfully deployed to {deployEnv}</div>
            </div>
          )}
        </div>
      )}

      {/* Deploy History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {deploys.map((dep) => {
          const cfg = STATUS_CONFIG[dep.status];
          return (
            <div key={dep.id} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{dep.version}</span>
                <span style={{
                  background: `${ENV_COLORS[dep.environment]}22`, color: ENV_COLORS[dep.environment],
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                }}>
                  {dep.environment}
                </span>
                <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{ fontSize: 13, color: text, marginBottom: 4 }}>{dep.commitMessage}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: dim }}>{dep.author} &middot; {dep.timestamp}</span>
                {dep.status === 'failed' && (
                  <button
                    onClick={() => handleRollback(dep.id)}
                    style={{
                      background: 'rgba(255,65,54,0.12)', color: '#ff4136', border: 'none', borderRadius: 6,
                      padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                    }}
                  >
                    Rollback
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
