"use client";

import { useState } from "react";
import { X, Plus, Circle } from "lucide-react";
import { formatCurrencyDecimal } from "@/lib/vehicles/types";

export type AddOnItem = {
  desc: string;
  type: string;
  price: number;
};

const ADDON_CATEGORIES = [
  "Warranty",
  "GPS / Tracking",
  "Paint Protection",
  "Dent Coverage",
  "Tire & Wheel",
  "Window Tint",
  "Accessories",
  "Other",
];

export default function AddOnModal({
  open,
  onOpenChange,
  vehicleName,
  items: initialItems,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleName: string;
  items: AddOnItem[];
  onSave: (items: AddOnItem[], total: number) => Promise<void>;
}) {
  const [items, setItems] = useState<AddOnItem[]>(initialItems);
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Warranty");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const addItem = () => {
    const priceNum = Number(price);
    if (!desc.trim() || !Number.isFinite(priceNum) || priceNum <= 0) return;
    setItems([...items, { desc: desc.trim(), type, price: priceNum }]);
    setDesc("");
    setPrice("");
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(items, total);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[440px] rounded-xl border border-slate-700/80 bg-[#0f1729] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Circle className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              Add-On Upcharge — {vehicleName}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-6 w-6 place-items-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-xs leading-relaxed text-slate-400">
            Add upcharges sold to the customer — warranties, GPS, paint
            protection, dent coverage, etc. These increase your revenue and
            boost net profit automatically.
          </p>

          <div className="space-y-1.5">
            {items.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-500">
                No add-ons yet. Click &quot;+ Add Item&quot; below to add
                warranties, GPS, paint protection, and more.
              </div>
            ) : (
              items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2.5 rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 py-2.5"
                >
                  <div>
                    <div className="text-[13px] font-bold text-white">
                      {item.desc}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-slate-500">
                      {item.type}
                    </div>
                  </div>
                  <div className="font-mono text-[14px] font-extrabold text-emerald-400">
                    {formatCurrencyDecimal(item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteItem(i)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 text-red-400 hover:bg-red-400/10"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-[#0a101f] px-4 py-3.5">
            <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
              New Add-On Item
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-400">
                  Description
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Extended Warranty — 3 Year"
                  className="w-full rounded-lg border border-slate-700 bg-[#0c1322] px-3 py-2 text-[13px] text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#0c1322] px-3 py-2 text-[13px] text-white outline-none"
                  >
                    {ADDON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Upcharge Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 995"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-700 bg-[#0c1322] px-3 py-2 font-mono text-[13px] text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="text-xs text-slate-400">
                Total:{" "}
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrencyDecimal(total)}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Done
            </button>
            <button
              type="button"
              onClick={addItem}
              disabled={
                !desc.trim() ||
                !Number.isFinite(Number(price)) ||
                Number(price) <= 0
              }
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="mr-1 inline h-3 w-3" />
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
