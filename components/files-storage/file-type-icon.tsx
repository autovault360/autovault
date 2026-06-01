import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RecentUploadFileType } from "@/lib/files-storage/types";

type FileIconConfig = {
  bg: string;
  src?: string;
  iconClass?: string;
};

const config: Record<RecentUploadFileType, FileIconConfig> = {
  pdf: {
    bg: "bg-red-500/15",
    src: "/pdf1.png",
  },
  jpg: {
    bg: "bg-blue-500/15",
    src: "/image.png",
  },
  xlsx: {
    bg: "bg-emerald-500/15",
    src: "/xls.png",
  },
  mp4: {
    bg: "bg-purple-500/15",
    src: "/mp4.png",
    iconClass: "text-purple-400",
  },
  other: {
    bg: "bg-slate-500/15",
    src: "/doc.png",
  },
};

type Props = {
  fileType: RecentUploadFileType;
  className?: string;
};

export default function FileTypeIcon({ fileType, className }: Props) {
  const { src } = config[fileType];

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-md",
        className,
      )}
    >
        <Image src={src || ""} alt="" width={18} height={18} className="w-7" />
    </div>
  );
}
