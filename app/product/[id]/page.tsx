/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Head from "next/head";
import {
  Check,
  MapPin,
  Truck,
  Factory,
  Ship,
  Calendar,
  BadgeCheck,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getTracking } from "@/actions/tracking";

export default function ProductTraceabilityPage() {
  const params = useParams();
  const rawId = params.id as string;
  const decodedId = decodeURIComponent(rawId);

  const unit = React.useMemo(() => {
    if (!decodedId || decodedId.length <= 56) return decodedId;

    const policyId = decodedId.slice(0, 56);
    const rest = decodedId.slice(56);

    const isHex = /^[0-9a-fA-F]+$/.test(rest) && rest.length % 2 === 0;
    if (isHex) {
      return decodedId;
    }

    const hexName = Array.from(new TextEncoder().encode(rest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const CIP68_REF_PREFIX = "000643b0";
    return policyId + CIP68_REF_PREFIX + hexName;
  }, [decodedId]);

  const { data: tracking, isLoading, isError, error } = useQuery({
    queryKey: ["product-tracking", unit],
    queryFn: () => getTracking({ unit }),
    enabled: !!unit,
  });

  const [selectedStep, setSelectedStep] = React.useState(0);

  const decodedAssetName = React.useMemo(() => {
    if (!decodedId || decodedId.length <= 56) return "";

    const rest = decodedId.slice(56);
    const CIP68_REF_PREFIX = "000643b0";

    // Nếu rest là hex, cố decode theo logic CIP-68
    const isHex = /^[0-9a-fA-F]+$/.test(rest) && rest.length % 2 === 0;
    if (isHex) {
      let hexName = rest;
      if (hexName.startsWith(CIP68_REF_PREFIX)) {
        hexName = hexName.slice(CIP68_REF_PREFIX.length);
      }
      if (!hexName || hexName.length % 2 !== 0) return "";
      try {
        const bytes = new Uint8Array(
          hexName.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [],
        );
        return new TextDecoder().decode(bytes);
      } catch {
        return "";
      }
    }

    // Nếu không phải hex: coi suffix chính là assetName gốc
    return rest;
  }, [decodedId]);

  const normalize = (s: string) => s?.toLowerCase().trim() || "";

  const waypoints = React.useMemo(() => {
    const roadmapStr = tracking?.metadata?.roadmap || "";
    const list = roadmapStr
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((w: string) => w.trim())
      .filter(Boolean);
    return list.length
      ? list
      : ["Origin", "Manufacturing", "Transportation", "Distribution", "Delivery"];
  }, [tracking]);

  const transactionLocations = React.useMemo(
    () => tracking?.transaction_history.map((t: any) => t.metadata?.location).filter(Boolean) || [],
    [tracking]
  );

  const [historyPage, setHistoryPage] = React.useState(0);
  const HISTORY_PAGE_SIZE = 3;

  const totalHistoryPages = React.useMemo(() => {
    const total = tracking?.transaction_history?.length || 0;
    return total > 0 ? Math.ceil(total / HISTORY_PAGE_SIZE) : 1;
  }, [tracking]);

  const paginatedHistory = React.useMemo(() => {
    const list = tracking?.transaction_history || [];
    const start = historyPage * HISTORY_PAGE_SIZE;
    return list.slice(start, start + HISTORY_PAGE_SIZE);
  }, [tracking, historyPage]);

  const currentLocation = tracking?.metadata?.location || waypoints[0];
  const currentIndex = waypoints.findIndex((loc: any) => normalize(loc) === normalize(currentLocation));

  React.useEffect(() => {
    if (currentIndex >= 0) setSelectedStep(currentIndex);
  }, [currentIndex]);

  const selectedTx = tracking?.transaction_history.find(
    (tx: any) => normalize(tx.metadata?.location) === normalize(waypoints[selectedStep])
  );

  const iconForLocation = (loc: string) => {
    const lower = loc.toLowerCase();
    if (lower.includes("ha noi") || lower.includes("hanoi")) return <Factory className="w-6 h-6" />;
    if (lower.includes("hung yen")) return <Truck className="w-6 h-6" />;
    if (lower.includes("hai phong")) return <Ship className="w-6 h-6" />;
    return <Package className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#c41e3a] mx-auto" />
          <p className="text-gray-600 text-sm md:text-base">Loading traceability journey…</p>
        </div>
      </div>
    );
  }

  if (isError || !tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] px-4">
        <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 md:p-10 text-center max-w-md w-full">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-5" />
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">Traceability data unavailable</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
            We could not retrieve the traceability information for this product. Please check the QR code or try
            again later.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium bg-[#c41e3a] text-white hover:bg-red-700 transition-colors"
          >
            Return to scan
          </Link>
        </div>
      </div>
    );
  }

  const productMeta = tracking?.metadata;

  const assetName =
    decodedAssetName ||
    (productMeta as any)?.assetName ||
    (productMeta as any)?.name;

  const rawImage = (productMeta as any)?.image as string | undefined;
  const imageUrl = rawImage?.startsWith("ipfs://")
    ? rawImage.replace("ipfs://", "https://ipfs.io/ipfs/")
    : rawImage;

  return (
    <main className="min-h-screen bg-[#f2f2f2] text-gray-900">
      <Head>
        <title>Traceability | {productMeta?.model || "Product Journey"}</title>
      </Head>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-5 py-2.5 md:py-3 space-y-1.5 md:space-y-2">
        <Link
          href="/scan"
          className="inline-block text-xs md:text-sm font-medium text-[#c41e3a] hover:text-red-700 hover:underline mb-2"
        >
          ← Back to scan
        </Link>

        {/* Header */}
        <header className="text-center space-y-0.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.18em]">
            Verified on Cardano
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {assetName || "Transparent product journey"}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            {productMeta?.model || assetName || "Product"} — tracked end‑to‑end from origin to final destination.
          </p>
        </header>

        {/* Timeline */}
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 md:p-2.5">
          <h2 className="text-sm md:text-base font-semibold mb-1 text-gray-800">
            Supply chain milestones
          </h2>

          <div className="relative z-0 flex items-center justify-between pt-0.5 pb-1.5">
            {/* Track line */}
            <div className="absolute top-9 left-[6%] right-[6%] h-[2px] bg-gray-200 rounded-full overflow-hidden -z-10">
              <div
                className="h-full bg-[#c41e3a] transition-all duration-500 ease-out"
                style={{
                  width: currentIndex >= 0 ? `${(currentIndex / (waypoints.length - 1)) * 100}%` : "0%",
                }}
              />
            </div>

            {waypoints.map((loc: string, index: number) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isClickable = transactionLocations.some((l) => normalize(l) === normalize(loc));

              return (
                <div key={loc} className="relative z-10 flex flex-col items-center flex-1 group">
                  <button
                    onClick={() => isClickable && setSelectedStep(index)}
                    disabled={!isClickable}
                    className={cn(
                      "relative flex items-center justify-center focus:outline-none cursor-pointer hover:scale-[1.03] transition-transform duration-200"
                    )}
                  >
                    <span className="flex items-center justify-center rounded-full bg-white shadow-sm w-9 h-9 md:w-10 md:h-10">
                      <span
                        className={cn(
                          "flex items-center justify-center rounded-full w-7 h-7 md:w-8 md:h-8 border-2 text-xs md:text-sm",
                          isPast
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isCurrent
                            ? "bg-[#c41e3a] text-white border-[#c41e3a]"
                            : "bg-emerald-400 text-white border-emerald-400"
                        )}
                      >
                        {isPast ? <Check className="w-4 h-4" /> : iconForLocation(loc)}
                      </span>
                    </span>
                  </button>

                  <span className="mt-3 text-xs md:text-sm font-medium text-gray-700 text-center leading-tight max-w-[110px]">
                    {loc}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-1.5 md:gap-2">
          {/* Product Visual */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 flex flex-col items-center justify-center">
            {imageUrl ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full aspect-square max-w-[260px] mx-auto overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={assetName || productMeta?.model || "Product image"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center break-words px-1">
                  {assetName || productMeta?.model || "Product"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center italic px-2">
                No product image available.
              </p>
            )}
          </div>

          {/* Current Milestone */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 space-y-1.5">
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2 text-gray-800">
              <MapPin className="w-5 h-5 text-[#c41e3a]" />
              Current milestone
            </h3>

            {selectedTx ? (
              <div className="space-y-3 text-sm md:text-base">
                <div className="flex items-center gap-3 text-gray-700 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(
                    new Date(selectedTx.datetime * 1000)
                  )}
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em] font-semibold">Action</p>
                  <p className="text-sm md:text-base font-semibold mt-1 text-gray-900">{selectedTx.action}</p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em] font-semibold">Status</p>
                  <span className="inline-flex px-3 py-1 mt-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                    {selectedTx.status}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em] font-semibold">Transaction</p>
                  <Link
                    href={`https://preprod.cexplorer.io/tx/${selectedTx.txHash}`}
                    target="_blank"
                    className="text-xs md:text-sm font-mono text-[#c41e3a] hover:text-red-700 break-all hover:underline mt-1 block"
                  >
                    {selectedTx.txHash}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">No transaction recorded for this stage yet.</p>
            )}
          </div>

          {/* History */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2">
            <h3 className="text-base md:text-lg font-semibold mb-1 text-gray-800">Transfer history</h3>

            <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-visible">
              {paginatedHistory.map((tx: any) => (
                <div
                  key={tx.txHash}
                  onClick={() => {
                    const idx = waypoints.findIndex((loc: any) => normalize(loc) === normalize(tx.metadata?.location || ""));
                    if (idx >= 0) setSelectedStep(idx);
                  }}
                  className={cn(
                    "p-4 border border-gray-200 rounded-md cursor-pointer bg-white hover:border-[#c41e3a]/70 hover:bg-red-50/40 transition-colors",
                    normalize(tx.metadata?.location) === normalize(waypoints[selectedStep]) &&
                      "border-[#c41e3a] bg-red-50/60"
                  )}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-semibold text-gray-900">{tx.metadata?.location || "Unknown"}</span>
                    <span className="text-sm text-gray-500">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(tx.datetime * 1000))}
                    </span>
                  </div>
                  <p className="text-gray-700">{tx.action}</p>
                </div>
              ))}
            </div>

            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                  disabled={historyPage === 0}
                  className="text-xs px-2 py-1 rounded border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page {historyPage + 1} / {totalHistoryPages}
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages - 1, p + 1))}
                  disabled={historyPage >= totalHistoryPages - 1}
                  className="text-xs px-2 py-1 rounded border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        {productMeta && (
          <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-3.5 md:p-4 space-y-3.5 md:space-y-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">Product details</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
              {[
                { label: "Brand", value: productMeta.brand },
                { label: "Model", value: productMeta.model },
                { label: "Material", value: productMeta.material },
                { label: "Battery", value: productMeta.battery },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em] font-semibold">
                    {item.label}
                  </p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{item.value || "—"}</p>
                </div>
              ))}
            </div>

            {productMeta.description && (
              <div className="pt-5 border-t border-gray-200">
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em] font-semibold mb-2">
                  Description
                </p>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {productMeta.description}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}