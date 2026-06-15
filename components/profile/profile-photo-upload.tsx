"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  imageUrl?: string | null;
  initials: string;
  onFileSelect: (file: File | null) => void;
  className?: string;
  variant?: "card" | "avatar";
};

export default function ProfilePhotoUpload({
  imageUrl,
  initials,
  onFileSelect,
  className,
  variant = "card",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (previewUrl?.startsWith("blob:")) {
      const url = previewUrl;
      return () => URL.revokeObjectURL(url);
    }
  }, [previewUrl]);

  const displayUrl = previewUrl ?? imageUrl ?? null;

  const handleChange = (file: File | null) => {
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    onFileSelect(file);
  };

  if (variant === "avatar") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative">
          <Avatar className="h-28 w-28 border-2 border-slate-600">
            {displayUrl ? (
              <AvatarImage src={displayUrl} alt="Profile photo" />
            ) : null}
            <AvatarFallback className="bg-slate-800 text-2xl text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-blue-600 text-white shadow-lg hover:bg-blue-500"
            onClick={() => inputRef.current?.click()}
            aria-label="Change profile photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleChange(file);
            e.target.value = "";
          }}
        />
        <p className="text-center text-[10px] text-slate-500">JPG or PNG, max 5MB</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative flex h-[160px] w-[200px] items-center justify-center overflow-hidden rounded-lg border border-slate-600 bg-slate-900/50">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile photo"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <UserRound className="h-16 w-16 text-slate-600" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          handleChange(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="flex h-8 w-full max-w-[200px] items-center justify-center gap-1.5 rounded-md border border-slate-600 bg-slate-800/80 text-[11px] text-slate-200 hover:bg-slate-700"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-3.5 w-3.5" />
        Change Photo
      </button>
      <p className="text-[10px] text-slate-500">JPG or PNG, max 5MB</p>
    </div>
  );
}
