"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, GripVertical, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PhotoGalleryItem = {
  id: string;
  url: string;
};

type PhotoGalleryUploadProps = {
  items: PhotoGalleryItem[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxPhotos?: number;
  autoTrigger?: number | undefined;
};

export function PhotoGalleryUpload({
  items,
  onAdd,
  onRemove,
  onReorder,
  maxPhotos = 20,
  autoTrigger,
}: PhotoGalleryUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoTrigger && autoTrigger > 0) {
      const id = setTimeout(() => inputRef.current?.click(), 0);
      return () => clearTimeout(id);
    }
  }, [autoTrigger]);

  const [dragOver, setDragOver] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dropTarget, setDropTarget] = React.useState<number | null>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    onAdd(Array.from(fileList));
  };

  const remaining = maxPhotos - items.length;

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
        theme="dark"
          type="button"
          variant="outline"
          size="sm"
          disabled={remaining <= 0}
          onClick={() => inputRef.current?.click()}
          className="mt-3"
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

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={!!onReorder}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(index);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index && onReorder) {
                  onReorder(dragIndex, index);
                }
                setDragIndex(null);
                setDropTarget(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDropTarget(null);
              }}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border bg-[#1a2332] transition-shadow",
                dragIndex === index ? "opacity-40 border-blue-400" : "border-slate-600",
                dropTarget === index && dragIndex !== index
                  ? "ring-2 ring-blue-400 border-blue-400"
                  : "",
                index === 0 ? "ring-1 ring-amber-500/50" : "",
              )}
            >
              {item.url && (
                <Image
                  src={item.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              {index === 0 && (
                <span className="absolute left-0.5 top-0.5 rounded bg-amber-600 px-1 py-0.5 text-[7px] font-semibold leading-none text-white">
                  Primary
                </span>
              )}
              {onReorder && (
                <div className="absolute bottom-0.5 left-0.5 rounded bg-black/60 p-0.5 text-slate-300">
                  <GripVertical className="h-3 w-3" />
                </div>
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
