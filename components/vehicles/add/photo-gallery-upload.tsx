"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PhotoGalleryUploadProps = {
  photos: File[];
  photoUrls: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
};

export function PhotoGalleryUpload({
  photos,
  photoUrls,
  onAdd,
  onRemove,
  maxPhotos = 20,
}: PhotoGalleryUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    onAdd(Array.from(fileList));
  };

  const remaining = maxPhotos - photos.length;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 transition-colors",
          dragOver
            ? "border-blue-400 bg-blue-950/30"
            : "border-slate-600 bg-[#151d2b]/50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
      >
        <Camera className="mb-2 h-7 w-7 text-slate-500" />
        <p className="text-[12px] text-slate-400">
          Drag and drop photos here or use the button below
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={remaining <= 0}
          onClick={() => inputRef.current?.click()}
          className="mt-3 h-8 border-slate-600 bg-[#1a2332] text-[11px] text-slate-200 hover:bg-slate-800"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload Photos
        </Button>
        <p className="mt-2 text-[10px] text-slate-500">JPG or PNG, max 10MB each</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => {
          processFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div
              key={`${photo.name}-${index}`}
              className="relative h-16 w-16 overflow-hidden rounded-md border border-slate-600 bg-[#1a2332]"
            >
              {photoUrls[index] && (
                <Image
                  src={photoUrls[index]}
                  alt={photo.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-600 bg-[#151d2b] text-slate-400 transition hover:border-slate-500 hover:text-slate-300"
            >
              <Plus className="h-4 w-4" />
              <span className="mt-0.5 text-[9px] font-medium">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
