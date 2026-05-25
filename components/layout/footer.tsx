import Link from "next/link";
import { toast } from "sonner";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900/40 bg-[#050708] py-4 px-6 text-center text-[11px] text-zinc-600 md:flex md:justify-between md:px-16 relative z-30">
      <p>&copy; 2024 AutoVault. All rights reserved.</p>
      <div className="mt-2 flex justify-center gap-8 md:mt-0">
        <Link href="#" className="hover:text-zinc-400 transition-colors">
          Privacy Policy
        </Link>
        <Link href="#" className="hover:text-zinc-400 transition-colors">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
