"use client";

import * as React from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelperText } from "@/components/vehicles/detail/modals/modal-primitives";

type VinInputWithScanProps = {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  isScanning?: boolean;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
};

export function VinInputWithScan({
  value,
  onChange,
  onScan,
  isScanning,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
}: VinInputWithScanProps) {
  return (
    <div>
      <div className="flex gap-2 overflow-hidden ">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 17))}
          placeholder="Enter VIN"
          maxLength={17}
          aria-invalid={ariaInvalid}
          theme="dark"
        />
        <Button
          type="button"
          onClick={onScan}
          disabled={disabled || isScanning}
          className="h-8 shrink-0 rounded-none bg-[#2563eb] px-4 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ScanLine className="mr-1.5 h-3.5 w-3.5" />
          )}
          {isScanning ? "Decoding..." : "Scan VIN"}
        </Button>
      </div>
      <HelperText>Enter 17-character VIN to decode vehicle information.</HelperText>
    </div>
  );
}

