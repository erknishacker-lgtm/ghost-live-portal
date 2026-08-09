'use client';

import { useEffect, useState } from 'react';

type Sale = {
  id: string;
  productName: string | null;
  amountCents: number;
  quantity: number;
  occurredAt: string;
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' }
];

export default function SalesPage() {
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState({ count: 0, totalCents: 0, averageCents: 0 });
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portal/sales?period=${period}`)
      .then((response) => response.json())
      .then((data) => {
        setStats(data.stats || { count: 0, totalCents: 0, averageCents: 0 });
        setSales(data.sales || []);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Histórico</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Vendas</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 24px' }}>Eventos registrados durante suas lives no TikTok.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PERIODS.map((item) => (
          <button
            key={item.key}
            onClick={() => setPeriod(item.key)}
            className={period === item.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 6 }}>Vendas</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{stats.count}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 6 }}>Total</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{formatCents(stats.totalCents)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 6 }}>Ticket médio</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{formatCents(stats.averageCents)}</div>
        </div>
      </div>

      {!loading && sales.length === 0 && (
        <div className="card">
          <p style={{ margin: 0, color: '#9a9a9a' }}>Nenhuma venda registrada nesse período.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '14px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(139,226,139,.15)', color: '#8be28b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                ✓
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{sale.productName || 'Venda na LIVE do TikTok'}</div>
                <div style={{ color: '#9a9a9a', fontSize: 12 }}>
                  {formatDateTime(sale.occurredAt)} · Qtd. {sale.quantity}
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{formatCents(sale.amountCents)}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
