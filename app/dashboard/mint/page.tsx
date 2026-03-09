"use client";

import * as React from "react";
import { AssetForm, type AssetFormMode } from "../asset-tools/AssetForm";
import { AssetTable, type AssetRecord } from "../asset-tools/AssetTable";

export default function MintPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [formMode, setFormMode] = React.useState<AssetFormMode>("mint");
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRecord | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex border-b border-gray-200 text-sm">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
            tab === "form"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Asset
        </button>
        <button
          type="button"
          onClick={() => setTab("table")}
          className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
            tab === "table"
              ? "border-[#c41e3a] text-[#c41e3a] font-semibold"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Asset table
        </button>
      </div>

      {tab === "form" ? (
        <AssetForm
          mode={formMode}
          initialAssetName={selectedAsset?.assetName}
        />
      ) : (
        <AssetTable
          onUpdate={(asset) => {
            setFormMode("update");
            setSelectedAsset(asset);
            setTab("form");
          }}
          onBurn={(asset) => {
            setFormMode("burn");
            setSelectedAsset(asset);
            setTab("form");
          }}
        />
      )}
    </div>
  );
}

