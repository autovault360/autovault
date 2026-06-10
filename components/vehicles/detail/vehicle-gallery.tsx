"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const REGULAR_THUMBS = 5;

export default function VehicleGallery({
  images,
  alt,
  onUploadClick,
}: {
  images: string[];
  alt: string;
  onUploadClick?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const validImages = images.filter(Boolean);
  const extraCount = Math.max(0, validImages.length - REGULAR_THUMBS);

  function prev() {
    setActiveIndex((i) => (i > 0 ? i - 1 : validImages.length - 1));
  }

  function next() {
    setActiveIndex((i) => (i < validImages.length - 1 ? i + 1 : 0));
  }
  const currentImage = validImages[activeIndex] ?? validImages[0];

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-slate-800">
        {!currentImage ? (
          <button
            type="button"
            onClick={onUploadClick}
            className="flex h-[350px] w-full flex-col items-center justify-center gap-2 text-slate-500 transition hover:text-slate-300 cursor-pointer"
          >
            <Camera className="h-10 w-10" />
            <span className="text-sm font-medium">No Image Upload</span>
            <span className="text-xs">Click to upload</span>
          </button>
        ) : (
          <img
            src={currentImage}
            alt={alt}
            className="h-[350px] w-full object-cover"
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={prev}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {Array.from({ length: REGULAR_THUMBS }).map((_, i) => {
            const image = validImages[i];
            if (!image) return null;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-11 w-[3.75rem] shrink-0 overflow-hidden rounded-md border-2 transition",
                  activeIndex === i
                    ? "border-blue-500"
                    : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <img
                  src={image}
                  alt={`${alt} view ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}

          {validImages[REGULAR_THUMBS] && (
            <button
              type="button"
              onClick={() => setActiveIndex(REGULAR_THUMBS)}
              className={cn(
                "relative h-11 w-[3.75rem] shrink-0 overflow-hidden rounded-md border-2 transition",
                activeIndex >= REGULAR_THUMBS
                  ? "border-blue-500"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <img
                src={validImages[REGULAR_THUMBS]}
                alt={`${alt} view ${REGULAR_THUMBS + 1}`}
                className="h-full w-full object-cover"
              />
              {extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-[12px] font-semibold text-white">
                  +{extraCount}
                </div>
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={next}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
