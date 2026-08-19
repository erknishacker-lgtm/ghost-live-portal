'use client';

import { useState } from 'react';
import { PLANS, type PlanId } from '@/lib/billing/plans';

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const ACTIVE_PLANS = (Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).filter(([, plan]) => plan.active);

export function PricingCta() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState('');

  async function subscribe(planId: PlanId) {
    setError('');
    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan_id: planId })
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error || 'Não foi possível iniciar o pagamento.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  }

  if (ACTIVE_PLANS.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 380 }}>
      {ACTIVE_PLANS.map(([planId, plan]) => (
        <div key={planId} className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 10 }}>
            {plan.label}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>
            {formatPrice(plan.priceCents)}
            <span style={{ fontSize: 15, fontWeight: 600, color: '#9a9a9a' }}>/mês</span>
          </div>
          <div style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 22 }}>Cancele quando quiser</div>
          <button
            type="button"
            className="btn-primary"
            disabled={loadingPlan !== null}
            onClick={() => subscribe(planId)}
            style={{ width: '100%', padding: '14px' }}
          >
            {loadingPlan === planId ? 'Abrindo pagamento…' : 'Assinar agora'}
          </button>
        </div>
      ))}
      {error && (
        <p className="error-text" style={{ textAlign: 'center' }}>
          {error}
        </p>
      )}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#666' }}>
        Já é assinante?{' '}
        <a href="/login" style={{ color: '#9a9a9a' }}>
          Entrar
        </a>
      </p>
    </div>
  );
}
