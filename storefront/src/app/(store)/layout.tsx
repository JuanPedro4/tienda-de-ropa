import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import StoreCTA from "@/components/StoreCTA";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Providers from "@/components/Providers";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">{children}</main>

        <StoreCTA />

        <WhatsAppFloat />

        <footer className="border-t border-brand-200 bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-8 text-center">
            <p className="text-[11px] uppercase tracking-wider text-brand-400">
              &copy; {new Date().getFullYear()} Pasito a Paso. Todos los derechos reservados.
            </p>
            <p className="mt-1 text-[10px] text-brand-300">
              Ropa para ni&ntilde;os de 0 a 14 a&ntilde;os &mdash; Talles 50-164 cm EN 13402
            </p>
          </div>
        </footer>
      </div>
    </Providers>
  );
}
