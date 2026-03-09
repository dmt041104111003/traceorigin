"use client";

import * as React from "react";
import { BrowserWallet, BlockfrostProvider } from "@meshsdk/core";
import { Contract } from "../../../contract/scripts/offchain";

const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY ?? "";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export type AssetFormMode = "mint" | "update" | "burn";

export function AssetForm({
  mode,
  initialAssetName,
  readOnly,
}: {
  mode: AssetFormMode;
  initialAssetName?: string;
  readOnly?: boolean;
}) {
  const [owners, setOwners] = React.useState<string[]>([
    "addr_test1qrplj973a94sz46jqhfdmr87r9jngdw3ec2e3vygedquu0mhmfn5pu6rc4ynwh4p4ssxdjy7tdp6m27ggkq8ym0jlvgqqset5j",
    "addr_test1qr9ql9xgnntlwrtqklw8uand62usxq6y4gknrta58m8r0dcswr2qa03gpcus5s630ncctdjfjg7x4f802zqfy0xd9mlqndztal",
    "addr_test1qrw7yktcc7wsscq46pfamt8t9yd2mlp7dtgjw3mq2hqplgvax05kaj8z5tgvtqd5q4xug4qqdgnzn2l8krm09c85f4psmzum9f",
    "addr_test1qztthppkvnl2k2gk96r6v22qxvwyymh4dr4njclae8wwau8d3tp4cyr8p83gs3vjnhmldj8vzhkx3cvnr80gjdfvdfdqcr2qz4",
  ]);
  const [ownerInput, setOwnerInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [assetName, setAssetName] = React.useState(
    initialAssetName ?? "Huawei Watch GT4 V9",
  );
  const [metaName, setMetaName] = React.useState(
    "Huawei Watch GT4 V9 - Premium Titanium Smartwatch",
  );
  const [description, setDescription] = React.useState(
    "The Huawei Watch GT4 V9 is a high-end smartwatch featuring an aerospace-grade titanium case, spherical sapphire crystal glass, and a 1.5-inch LTPO AMOLED display (466×466 pixels, ~310 ppi). It offers up to 14 days of battery life (typical usage), HUAWEI TruSense health system (heart rate, SpO2, ECG, stress, sleep, skin temperature), 100+ sports modes, dual-band multi-system GPS, 5 ATM water resistance (50 meters), HarmonyOS, Bluetooth 5.2, NFC, and premium design for active, modern lifestyles.",
  );
  const [brand, setBrand] = React.useState("Huawei");
  const [model, setModel] = React.useState("Watch GT 4 V9");
  const [material, setMaterial] = React.useState(
    "Aerospace Titanium + Sapphire Glass",
  );
  const [battery, setBattery] = React.useState("Up to 14 days");
  const [image, setImage] = React.useState(
    "ipfs://QmYourIPFSHashhuaweiwatchgt4frontpng",
  );
  const [mediaType, setMediaType] = React.useState("image/png");
  const [roadmap, setRoadmap] = React.useState(
    "[Viet Nam, China, American, Russia]",
  );
  const [location, setLocation] = React.useState("Viet Nam");

  const trimmedOwners = React.useMemo(
    () => owners.map((s) => s.trim()).filter(Boolean),
    [owners],
  );

  const formatOwner = React.useCallback((addr: string) => {
    if (addr.length <= 24) return addr;
    return `${addr.slice(0, 12)}...${addr.slice(-6)}`;
  }, []);

  const handleAddOwner = React.useCallback(() => {
    const value = ownerInput.trim();
    if (!value) return;
    setOwners((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setOwnerInput("");
  }, [ownerInput]);

  const handleRemoveOwner = React.useCallback((addr: string) => {
    setOwners((prev) => prev.filter((v) => v !== addr));
  }, []);

  const handleMoveOwner = React.useCallback((index: number, offset: number) => {
    setOwners((prev) => {
      const next = [...prev];
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }, []);

  const handleClearOwners = React.useCallback(() => {
    setOwners([]);
  }, []);

  React.useEffect(() => {
    if (initialAssetName) {
      setAssetName(initialAssetName);
    }
  }, [initialAssetName]);

  const disabled = loading || !!readOnly;
  const lockImmutable = readOnly || mode !== "mint";
  const ownersLocked = lockImmutable;

  const runAction = async () => {
    if (readOnly) {
      return;
    }
    const action = mode;
    setError("");
    setTxHash("");
    setLoading(true);
    try {
      if (!assetName.trim()) {
        throw new Error("Asset name is required.");
      }
      if (action !== "burn" && (!metaName.trim() || !description.trim())) {
        throw new Error("Name and description are required for mint/update.");
      }

      if (!BLOCKFROST_KEY) {
        throw new Error("Missing NEXT_PUBLIC_BLOCKFROST_API_KEY");
      }
      if (typeof window === "undefined") {
        throw new Error("Browser environment required");
      }

      const installed = await BrowserWallet.getInstalledWallets();
      if (installed.length === 0) {
        throw new Error("No browser wallet found");
      }

      const eternl = installed.find((w) => w.name.toLowerCase() === "eternl");
      const walletInfo = eternl ?? installed[0];

      const wallet = await BrowserWallet.enable(walletInfo.name);
      const provider = new BlockfrostProvider(BLOCKFROST_KEY);

      const owners = Array.from(new Set(trimmedOwners));
      if (owners.length === 0) {
        throw new Error("At least one owner address is required.");
      }

      const contract = new Contract({
        wallet: wallet as any,
        provider,
        owners,
      });

      const unit =
        contract.policyId + Buffer.from(assetName, "utf8").toString("hex");

      let unsigned: string;

      if (action === "mint") {
        const metadata = {
          name: metaName.trim(),
          description: description.trim(),
          brand: brand.trim(),
          model: model.trim(),
          material: material.trim(),
          battery: battery.trim(),
          image: image.trim(),
          mediaType: mediaType.trim(),
          roadmap: roadmap.trim(),
          location: location.trim(),
        };
        unsigned = await contract.mint({ assetName, metadata });
      } else if (action === "update") {
        const newMetadata = {
          name: metaName.trim(),
          description: description.trim(),
          brand: brand.trim(),
          model: model.trim(),
          material: material.trim(),
          battery: battery.trim(),
          image: image.trim(),
          mediaType: mediaType.trim(),
          roadmap: roadmap.trim(),
          location: location.trim(),
        };
        unsigned = await contract.update({ assetName, metadata: newMetadata });
      } else {
        unsigned = await contract.burn({ assetName });
      }

      const signed = await wallet.signTx(unsigned, true);
      const hash = await wallet.submitTx(signed);
      setTxHash(hash);

      if (action === "mint") {
        try {
          await fetch(`${BACKEND_URL}/assets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              policyId: contract.policyId,
              assetName,
              unit,
              txHash: hash,
              owners,
              metadata: {
                name: metaName.trim(),
                description: description.trim(),
                brand: brand.trim(),
                model: model.trim(),
                material: material.trim(),
                battery: battery.trim(),
                image: image.trim(),
                mediaType: mediaType.trim(),
                roadmap: roadmap.trim(),
                location: location.trim(),
              },
            }),
          });
        } catch (e) {
          console.error("Failed to persist asset:", e);
        }
      } else if (action === "update") {
        try {
          await fetch(`${BACKEND_URL}/assets/${unit}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              txHash: hash,
              owners,
              metadata: {
                name: metaName.trim(),
                description: description.trim(),
                brand: brand.trim(),
                model: model.trim(),
                material: material.trim(),
                battery: battery.trim(),
                image: image.trim(),
                mediaType: mediaType.trim(),
                roadmap: roadmap.trim(),
                location: location.trim(),
              },
            }),
          });
        } catch (e) {
          console.error("Failed to update asset:", e);
        }
      } else if (action === "burn") {
        try {
          await fetch(`${BACKEND_URL}/assets/${unit}`, {
            method: "DELETE",
          });
        } catch (e) {
          console.error("Failed to delete asset:", e);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const title = readOnly
    ? "Asset detail"
    : mode === "mint"
    ? "Mint asset"
    : mode === "update"
    ? "Update asset"
    : "Burn asset";

  const buttonLabel = loading
    ? mode === "mint"
      ? "Minting..."
      : mode === "update"
      ? "Updating..."
      : "Burning..."
    : mode === "mint"
    ? "Mint"
    : mode === "update"
    ? "Update"
    : "Burn";

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          {title}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Use your browser wallet to {mode} the product NFT.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          Owners
        </label>
        {!ownersLocked && (
          <div className="flex gap-2">
            <input
              disabled={disabled}
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="addr_test1..."
            />
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddOwner}
              className="px-3 py-2 text-xs font-semibold rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        )}
        <p className="text-[11px] text-gray-500">
          Add each owner address separately. Include your own wallet address as one of the owners.
        </p>
        {trimmedOwners.length > 0 && (
          <div className="mt-2 space-y-2">
            {trimmedOwners.map((addr, index) => (
              <div
                key={addr}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-[11px] text-gray-700 w-full justify-between"
              >
                <span className="truncate mr-2">{formatOwner(addr)}</span>
                {!ownersLocked && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleMoveOwner(index, -1)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleMoveOwner(index, 1)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveOwner(addr)}
                      className="text-gray-500 hover:text-gray-800"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!ownersLocked && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleClearOwners}
                className="text-[11px] text-[#c41e3a] hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Asset & metadata
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Asset name (UTF-8)
            </label>
            <input
              disabled={disabled || lockImmutable}
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] ${
                lockImmutable ? "bg-gray-50 text-gray-400" : ""
              }`}
            />
          </div>
          {mode !== "burn" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Model
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Material
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Battery
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
            </>
          )}
        </div>
        {mode !== "burn" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Name (metadata)
              </label>
              <input
                disabled={disabled || lockImmutable}
                type="text"
                value={metaName}
                onChange={(e) => setMetaName(e.target.value)}
              className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] ${
                lockImmutable ? "bg-gray-50 text-gray-400" : ""
              }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                disabled={disabled}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image (IPFS URL)
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Media type
                </label>
                <input
                  disabled={disabled}
                  type="text"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Roadmap
              </label>
              <input
                disabled={disabled || lockImmutable}
                type="text"
                value={roadmap}
                onChange={(e) => setRoadmap(e.target.value)}
              className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] ${
                lockImmutable ? "bg-gray-50 text-gray-400" : ""
              }`}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {txHash && (
        <p className="text-xs text-red-600 break-all">
          Tx hash: {txHash}
        </p>
      )}

      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runAction}
            disabled={disabled}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}