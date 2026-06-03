"use client"

import { useState, useCallback, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PanelPreviewProps {
  title: string
  children: ReactNode
  expanded?: ReactNode
  className?: string
}

export function PanelPreview({ title, children, expanded, className }: PanelPreviewProps) {
  const [open, setOpen] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("select") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[role='combobox']") ||
      target.closest("[role='option']")
    ) {
      return
    }
    setOpen(true)
  }, [])

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-blue-500/20 rounded-sm",
          className
        )}
      >
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] overflow-y-auto bg-[#010d19] border-slate-700 text-slate-200"
          overlayClassName="bg-black/70 backdrop-blur-sm"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="p-1">
            {expanded ?? children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
