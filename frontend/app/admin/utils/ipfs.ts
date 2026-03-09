export function normalizeIpfsUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (s.startsWith('ipfs://')) return s;
  return `ipfs://${s.replace(/^ipfs:\/\//, '')}`;
}

