'use client';

import { useState } from 'react';
import { Check } from '@phosphor-icons/react';
import { PLANS, type PlanId } from '@/lib/billing/plans';

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function intervalSuffix(interval: 'month' | 'year'): string {
  return interval === 'year' ? '/ano' : '/mês';
}

const ACTIVE_PLANS = (Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).filter(([, plan]) => plan.active);

const INCLUDES = ['Ativação imediata após o pagamento', 'Suporte direto com a equipe', 'Cancele quando quiser'];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360 }}>
      {ACTIVE_PLANS.map(([planId, plan]) => (
        <div
          key={planId}
          className="card"
          style={{
            padding: 28,
            borderColor: '#333',
            background: 'linear-gradient(180deg, #171717 0%, #121212 100%)'
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 8 }}>
            {plan.label}
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 18, lineHeight: 1 }}>
            {formatPrice(plan.priceCents)}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#9a9a9a' }}>{intervalSuffix(plan.interval)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {INCLUDES.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#d4d4d4' }}>
                <Check size={15} weight="bold" color="#8be28b" style={{ flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>

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
        <p className="error-text" style={{ textAlign: 'center', margin: 0 }}>
          {error}
        </p>
      )}

      <p style={{ textAlign: 'center', fontSize: 12, color: '#666', margin: 0 }}>
        Já é assinante?{' '}
        <a href="/login" style={{ color: '#9a9a9a' }}>
          Entrar
        </a>
      </p>
    </div>
  );
}
