import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-900/40 bg-[#050708]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between py-4 px-6 md:px-16">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.webp"
            alt="AutoVault Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[13px] font-normal text-zinc-400 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="#"
            className="h-9 px-4 rounded-lg bg-gradient-to-b from-secondary to-primary/90 text-[13px] font-semibold text-white shadow-md shadow-green-950/10 transition-all hover:brightness-105 active:scale-[0.995]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
