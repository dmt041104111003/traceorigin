"use client";

import * as React from "react";
import QRCode from "qrcode";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export interface AssetRecord {
  id: string;
  policyId: string;
  assetName: string;
  unit: string;
  txHash: string;
  owners: string[];
  name: string;
  description: string;
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  battery?: string | null;
  image?: string | null;
  mediaType?: string | null;
  roadmap?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AssetTable(props: {
  onUpdate?: (asset: AssetRecord) => void;
  onBurn?: (asset: AssetRecord) => void;
}) {
  const [rows, setRows] = React.useState<AssetRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/assets`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || data?.error || "Failed to load assets",
          );
        }
        const data = (await res.json()) as AssetRecord[];
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadQr = React.useCallback(async (asset: AssetRecord) => {
    if (typeof window === "undefined") return;
    try {
      setDownloadingId(asset.id);
      const id = asset.policyId + asset.assetName;
      const productUrl = `${window.location.origin}/product/${id}`;

      const dataUrl = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: "H",
        width: 512,
        margin: 4,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const safeId = (asset.policyId + asset.assetName).replace(
        /[^a-zA-Z0-9]/g,
        "_",
      );
      link.download = `QR_${safeId || "asset"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to generate QR for asset.",
      );
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return (
    <div className="w-full space-y-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-[11px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left border-r border-gray-200">
                #
              </th>
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left border-r border-gray-200">
                Asset name
              </th>
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left border-r border-gray-200">
                Tx hash
              </th>
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left border-r border-gray-200">
                Owners
              </th>
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left border-r border-gray-200">
                Location
              </th>
              <th className="px-3 py-1.5 font-semibold text-gray-700 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-center text-gray-500 bg-white">
                  Loading assets...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-center text-gray-500 bg-white">
                  No assets found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-200">
                  <td className="px-3 py-1.5 border-r border-gray-200 text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-3 py-1.5 border-r border-gray-200 text-gray-900 max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis" title={row.assetName}>
                    {row.assetName}
                  </td>
                  <td className="px-3 py-1.5 border-r border-gray-200 font-mono text-[11px] text-emerald-700 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis" title={row.txHash}>
                    {row.txHash}
                  </td>
                  <td className="px-3 py-1.5 border-r border-gray-200 text-[11px] text-gray-700 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis" title={row.owners.join(", ")}>
                    {row.owners.join(", ")}
                  </td>
                  <td className="px-3 py-1.5 border-r border-gray-200 text-gray-700">
                    {row.location || "-"}
                  </td>
                  <td className="px-3 py-1.5 text-gray-700">
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleDownloadQr(row)}
                        className="underline-offset-2 hover:underline"
                      >
                        {downloadingId === row.id ? "Downloading..." : "Download"}
                      </button>
                      <button
                        type="button"
                        onClick={() => props.onUpdate?.(row)}
                        className="underline-offset-2 hover:underline"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => props.onBurn?.(row)}
                        className="underline-offset-2 hover:underline"
                      >
                        Burn
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}