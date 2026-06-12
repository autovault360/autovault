"use client";

import * as React from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelperText } from "@/components/shared/modal-primitives";

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
          size="sm"
          onClick={onScan}
          disabled={disabled || isScanning}
          className="shrink-0 rounded-none disabled:cursor-not-allowed"
        >
          <ButtonIcon tone="success">
            {isScanning ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ScanLine />
            )}
          </ButtonIcon>
          {isScanning ? "Decoding..." : "Scan VIN"}
        </Button>
      </div>
      <HelperText>Enter 17-character VIN to decode vehicle information.</HelperText>
    </div>
  );
}

