'use client';

import { useEffect, useState } from 'react';

type Prefs = {
  receiveNotifications: boolean;
  showValue: boolean;
  showProduct: boolean;
  showQuantity: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notifyRefund: boolean;
  notifyChargeback: boolean;
  updateBadge: boolean;
  volume: number;
  timezone: string;
};

const DEFAULTS: Prefs = {
  receiveNotifications: true,
  showValue: true,
  showProduct: true,
  showQuantity: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notifyRefund: true,
  notifyChargeback: true,
  updateBadge: true,
  volume: 100,
  timezone: 'America/Sao_Paulo'
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #2a2a2a' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ width: 18, height: 18, accentColor: '#fff' }} />
    </div>
  );
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [activeDevices, setActiveDevices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/portal/notifications')
      .then((response) => response.json())
      .then((data) => {
        if (data.preferences) setPrefs(data.preferences);
        setActiveDevices(data.activeDevices || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/portal/notifications', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      setMessage(response.ok ? 'Configurações salvas.' : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  function restoreDefaults() {
    setPrefs(DEFAULTS);
  }

  function set<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((current) => ({ ...current, [key]: value }));
  }

  if (loading) return null;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Configurações</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Notificações de vendas</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>Controle alertas, som e celulares autorizados.</p>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Status: {prefs.receiveNotifications ? 'Ativado' : 'Desativado'}</div>
            <div style={{ color: '#9a9a9a', fontSize: 12, marginTop: 4 }}>{activeDevices} dispositivo(s) ativo(s)</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={() => set('receiveNotifications', true)}>
              Ativar
            </button>
            <button className="btn-secondary" onClick={() => set('receiveNotifications', false)}>
              Desativar
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <Toggle label="Receber notificações de venda" checked={prefs.receiveNotifications} onChange={(value) => set('receiveNotifications', value)} />
          <Toggle label="Mostrar valor" checked={prefs.showValue} onChange={(value) => set('showValue', value)} />
          <Toggle label="Mostrar produto" checked={prefs.showProduct} onChange={(value) => set('showProduct', value)} />
          <Toggle label="Mostrar quantidade" checked={prefs.showQuantity} onChange={(value) => set('showQuantity', value)} />
          <Toggle label="Som com aplicativo aberto" checked={prefs.soundEnabled} onChange={(value) => set('soundEnabled', value)} />
          <Toggle label="Vibração" checked={prefs.vibrationEnabled} onChange={(value) => set('vibrationEnabled', value)} />
          <Toggle label="Notificar reembolso" checked={prefs.notifyRefund} onChange={(value) => set('notifyRefund', value)} />
          <Toggle label="Notificar chargeback" checked={prefs.notifyChargeback} onChange={(value) => set('notifyChargeback', value)} />
          <Toggle label="Atualizar badge" checked={prefs.updateBadge} onChange={(value) => set('updateBadge', value)} />
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #2a2a2a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 8 }}>Volume do som</div>
            <input
              type="range"
              min={0}
              max={100}
              value={prefs.volume}
              onChange={(event) => set('volume', Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 4 }}>{prefs.volume}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 8 }}>Fuso horário</div>
            <select
              value={prefs.timezone}
              onChange={(event) => set('timezone', event.target.value)}
              style={{ width: '100%', background: '#0a0a0a', color: '#f5f5f5', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px' }}
            >
              <option value="America/Sao_Paulo">America/Sao_Paulo</option>
              <option value="America/Manaus">America/Manaus</option>
              <option value="America/Rio_Branco">America/Rio_Branco</option>
              <option value="America/Noronha">America/Noronha</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
          <button className="btn-secondary" onClick={restoreDefaults}>
            Restaurar padrões
          </button>
        </div>
        {message && <p style={{ color: '#9a9a9a', fontSize: 13, marginTop: 12 }}>{message}</p>}
      </div>
    </main>
  );
}
