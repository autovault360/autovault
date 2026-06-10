export default function AppFooter() {
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
      <span>AutoVault360</span>
      <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
    </footer>
  );
}
