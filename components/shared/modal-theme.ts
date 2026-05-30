export type ModalTheme = "light" | "dark";

export function getModalShellClass(theme: ModalTheme) {
  return theme === "dark"
    ? "bg-[#0f1621] text-slate-100"
    : "bg-white text-gray-900";
}

export function getLabelClass(theme: ModalTheme) {
  return theme === "dark"
    ? "text-[11px] font-medium text-slate-400"
    : "text-[11px] font-medium text-gray-600";
}

export function getInputReadonlyClass(theme: ModalTheme) {
  return theme === "dark"
    ? "border-slate-600 bg-[#151d2b] text-slate-300 focus-visible:border-slate-600"
    : "border-[#E0E0E0] bg-[#F5F5F5] text-gray-700 focus-visible:border-[#E0E0E0]";
}

export function getHeaderBorderClass(theme: ModalTheme) {
  return theme === "dark" ? "border-slate-700" : "border-gray-100";
}

export function getFooterBorderClass(theme: ModalTheme) {
  return theme === "dark" ? "border-slate-700" : "border-gray-100";
}

export function getTextareaClass(theme: ModalTheme) {
  return theme === "dark"
    ? "min-h-[88px] w-full resize-none rounded-[6px] border border-slate-600 bg-[#1a2332] px-3 py-2.5 text-[13px] text-slate-100 shadow-none outline-none placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
    : "min-h-[88px] w-full resize-none rounded-[6px] border border-[#E0E0E0] bg-white px-3 py-2.5 text-[13px] text-gray-900 shadow-none outline-none placeholder:text-gray-400 focus-visible:border-[#2563eb] focus-visible:ring-0";
}
