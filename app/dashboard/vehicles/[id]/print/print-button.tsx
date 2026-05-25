"use client";

import { useEffect } from "react";

export default function PrintButton() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        padding: "10px 24px",
        fontSize: "14px",
        fontWeight: 600,
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      🖨️ Print / Save PDF
    </button>
  );
}
