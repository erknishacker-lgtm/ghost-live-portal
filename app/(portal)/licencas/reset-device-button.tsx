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
      await fetch(`/api/portal/licenses/${licenseId}/devices/${deviceId}/reset`, { method: 'POST' });
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
