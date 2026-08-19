'use client';

import { useState } from 'react';
import { PLANS, type PlanId } from '@/lib/billing/plans';

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function intervalSuffix(interval: 'month' | 'year'): string {
  return interval === 'year' ? '/ano' : '/mês';
}

const ACTIVE_PLANS = (Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).filter(([, plan]) => plan.active);

export function SubscribeSection() {
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
    <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #2a2a2a' }}>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#9a9a9a', margin: '0 0 12px' }}>Ainda não é assinante?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ACTIVE_PLANS.map(([planId, plan]) => (
          <button
            key={planId}
            type="button"
            className="btn-secondary"
            disabled={loadingPlan !== null}
            onClick={() => subscribe(planId)}
            style={{ width: '100%' }}
          >
            {loadingPlan === planId
              ? 'Abrindo pagamento…'
              : `Assinar - ${plan.label} - ${formatPrice(plan.priceCents)}${intervalSuffix(plan.interval)}`}
          </button>
        ))}
      </div>
      {error && (
        <p className="error-text" style={{ textAlign: 'center', marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}
