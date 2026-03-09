const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type WarehouseItem = {
  batchId: string;
  batchName: string;
  image: string | null;
  receivedAt: string;
  outAt?: string | null;
  policyId?: string | null;
  status?: string;
};

function mapItem(i: Record<string, unknown>): WarehouseItem {
  return {
    batchId: String(i?.batchId ?? ''),
    batchName: String(i?.batchName ?? ''),
    image: i?.image != null ? String(i.image) : null,
    receivedAt: String(i?.receivedAt ?? ''),
    outAt: i?.outAt != null ? String(i.outAt) : null,
    policyId: i?.policyId != null ? String(i.policyId) : null,
    status: i?.status != null ? String(i.status) : 'IN_WAREHOUSE',
  };
}

export async function getWarehouseItems(token: string): Promise<WarehouseItem[]> {
  const res = await fetch(`${BACKEND_URL}/warehouse`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.message ?? data?.error ?? 'Failed to load your warehouse.',
    );
  }
  const raw = Array.isArray(data?.items) ? data.items : [];
  return raw.map((i: Record<string, unknown>) => mapItem(i));
}

export async function getLockRecipientByRoadmap(
  token: string,
  batchId: string,
): Promise<{ recipientAddress: string | null }> {
  const res = await fetch(
    `${BACKEND_URL}/warehouse/recipient-by-roadmap?batchId=${encodeURIComponent(batchId.trim())}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to get recipient.');
  }
  return {
    recipientAddress: data?.recipientAddress != null ? String(data.recipientAddress) : null,
  };
}

export async function requestBurnNft(
  token: string,
  params: {
    changeAddress: string;
    assetName: string;
    walletUtxos: unknown[];
    utxoAddresses?: string[];
    policyId?: string | null;
  },
): Promise<{ unsignedTx: string }> {
  const res = await fetch(
    `${BACKEND_URL}/product/burn`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        changeAddress: params.changeAddress,
        assetName: params.assetName,
        walletUtxos: params.walletUtxos,
        ...(params.utxoAddresses?.length ? { utxoAddresses: params.utxoAddresses } : {}),
        ...(params.policyId ? { policyId: params.policyId } : {}),
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.message ?? data?.error ?? 'Failed to create burn transaction.',
    );
  }
  if (!data?.unsignedTx) {
    throw new Error('Backend did not return unsignedTx.');
  }
  return { unsignedTx: data.unsignedTx };
}
