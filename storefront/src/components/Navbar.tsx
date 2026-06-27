"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  {
    slug: "casual",
    name: "Casual",
    ages: ["0-3 años", "3-7 años", "7-10 años", "10-14 años"],
  },
  {
    slug: "arreglada",
    name: "Arreglada",
    ages: ["0-3 años", "3-7 años", "7-10 años", "10-14 años"],
  },
  {
    slug: "deporte",
    name: "Deporte",
    ages: ["0-3 años", "3-7 años", "7-10 años", "10-14 años"],
  },
];

const ageGroups = [
  { slug: "0-3", name: "Bebés", range: "0-3 años" },
  { slug: "3-7", name: "Niños", range: "3-7 años" },
  { slug: "7-10", name: "Kids", range: "7-10 años" },
  { slug: "10-14", name: "Teens", range: "10-14 años" },
];

const ageSlugs: Record<string, string> = {
  "0-3 años": "0-3",
  "3-7 años": "3-7",
  "7-10 años": "7-10",
  "10-14 años": "10-14",
};

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-white">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-brand-900">
          Pasito a Paso
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("edades")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="px-1 py-1 text-xs font-medium uppercase tracking-wider text-brand-600 transition hover:text-brand-900">
              Edades
            </button>
            {openDropdown === "edades" && (
              <div className="absolute -left-3 top-full mt-1 w-40 animate-fade-in border border-brand-200 bg-white p-1 shadow-sm">
                {ageGroups.map((age) => (
                  <Link
                    key={age.slug}
                    href={`/productos?edad=${age.slug}`}
                    className="block px-3 py-2 text-xs text-brand-600 transition hover:bg-surface hover:text-brand-900"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {age.name}
                    <span className="ml-2 text-[10px] text-brand-400">
                      {age.range}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => setOpenDropdown(cat.slug)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={`/productos?categoria=${cat.slug}`}
                className="px-1 py-1 text-xs font-medium uppercase tracking-wider text-brand-600 transition hover:text-brand-900"
              >
                {cat.name}
              </Link>
              {openDropdown === cat.slug && (
                <div className="absolute -left-3 top-full mt-1 w-40 animate-fade-in border border-brand-200 bg-white p-1 shadow-sm">
                  {cat.ages.map((age) => (
                    <Link
                      key={age}
                      href={`/productos?categoria=${cat.slug}&edad=${ageSlugs[age]}`}
                      className="block px-3 py-2 text-xs text-brand-600 transition hover:bg-surface hover:text-brand-900"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {age}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/cuenta"
            className="px-1 py-1 text-xs font-medium uppercase tracking-wider text-brand-600 transition hover:text-brand-900"
          >
            Mi cuenta
          </Link>
        </div>
      </nav>
    </header>
  );
}
