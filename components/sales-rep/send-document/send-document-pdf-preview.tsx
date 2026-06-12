"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  className?: string;
  onError?: () => void;
};

export default function SendDocumentPdfPreview({ url, className, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onErrorRef = useRef(onError);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return undefined;

    const renderPdf = async () => {
      setRendering(true);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loadPdf = async () => {
          try {
            return await pdfjs.getDocument({ url }).promise;
          } catch {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              throw new Error("Unable to load PDF");
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error("Unable to fetch PDF");
            const data = await response.arrayBuffer();
            return pdfjs.getDocument({ data }).promise;
          }
        };

        const pdf = await loadPdf();
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth || 1;
        const containerHeight = container.clientHeight || 1;
        const scale = Math.min(
          containerWidth / baseViewport.width,
          containerHeight / baseViewport.height,
        );
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, viewport.width, viewport.height);

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        if (!cancelled) setRendering(false);
      } catch {
        if (!cancelled) onErrorRef.current?.();
      }
    };

    void renderPdf();

    const observer = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        void renderPdf();
      }, 150);
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden bg-white",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn("max-h-full max-w-full", rendering && "opacity-0")}
      />
    </div>
  );
}
