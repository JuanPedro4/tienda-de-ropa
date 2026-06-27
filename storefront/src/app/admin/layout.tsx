import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";

// ──────────────────────────────────────────────
// Navigation items (shared with sidebar-nav)
// ──────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Productos", href: "/admin/productos", icon: "👕" },
  { label: "Pedidos", href: "/admin/pedidos", icon: "📦" },
  { label: "Clientes", href: "/admin/clientes", icon: "👥" },
  { label: "Categorías", href: "/admin/categorias", icon: "🏷️" },
  { label: "Sucursales", href: "/admin/sucursales", icon: "📍" },
  { label: "Reseñas", href: "/admin/resenas", icon: "⭐" },
];

// ──────────────────────────────────────────────
// Layout
// ──────────────────────────────────────────────

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const role = session.user.role as string | undefined;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/admin/dashboard" className="text-lg font-bold text-gray-900">
            Panel Admin
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <SidebarNav items={NAV_ITEMS} />
        </div>

        {/* User info + Logout */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
              {(session.user?.name ?? "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {session.user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-gray-500">{session.user?.email ?? ""}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a tienda
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <MobileHeader
          userName={session.user.name}
          userEmail={session.user?.email}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MobileHeader
// ──────────────────────────────────────────────

function MobileHeader({
  userName,
  userEmail,
}: {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin/dashboard" className="text-base font-bold text-gray-900">
          Panel Admin
        </Link>
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <nav className="absolute right-0 top-full z-50 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-200" />
            <div className="px-4 py-2">
              <p className="truncate text-sm font-medium text-gray-900">{userName ?? "Admin"}</p>
              <p className="truncate text-xs text-gray-500">{userEmail ?? ""}</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a tienda
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
