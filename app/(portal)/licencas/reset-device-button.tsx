'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResetDeviceButton({ licenseId, deviceId }: { licenseId: string; deviceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm('Desvincular este dispositivo? Ele vai precisar ativar a licença novamente.')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/licenses/${licenseId}/devices/${deviceId}/reset`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'RESET_COOLDOWN' && data.retryAfterSeconds) {
          const hours = Math.ceil(data.retryAfterSeconds / 3600);
          alert(`Você já redefiniu um dispositivo recentemente. Tente de novo em cerca de ${hours}h.`);
        } else {
          alert(data.error || 'Não foi possível redefinir o dispositivo.');
        }
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn-danger" onClick={onClick} disabled={loading}>
      {loading ? 'Redefinindo…' : 'Redefinir dispositivo'}
    </button>
  );
}
