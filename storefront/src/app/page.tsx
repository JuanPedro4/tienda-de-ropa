import Link from "next/link";

const ageGroups = [
  { slug: "0-3", name: "Bebés", range: "0–3 años" },
  { slug: "3-7", name: "Niños", range: "3–7 años" },
  { slug: "7-10", name: "Kids", range: "7–10 años" },
  { slug: "10-14", name: "Teens", range: "10–14 años" },
];

const categories = [
  {
    slug: "casual",
    name: "Casual",
    description: "Ropa cómoda para el día a día",
  },
  {
    slug: "arreglada",
    name: "Arreglada",
    description: "Para ocasiones especiales y eventos",
  },
  {
    slug: "deporte",
    name: "Deporte",
    description: "Activa y transpirable para jugar",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-brand-200 bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
            Tienda de ropa infantil
          </p>
          <h1 className="mb-4 text-4xl font-light tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
            Pasito a <span className="font-semibold">Paso</span>
          </h1>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-brand-500">
            Moda infantil para acompa&ntilde;ar cada etapa de su crecimiento, desde los 0 a 14 a&ntilde;os.
          </p>
          <Link
            href="/productos"
            className="inline-block border border-brand-900 px-8 py-3 text-xs font-medium uppercase tracking-widest text-brand-900 transition hover:bg-brand-900 hover:text-white"
          >
            Ver cat&aacute;logo
          </Link>
        </div>
      </section>

      <section className="border-b border-brand-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
              Destacados
            </h2>
          </div>

          <div className="grid gap-px bg-brand-200 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/productos?sort=newest"
              className="group bg-white p-8 text-center transition hover:bg-surface"
            >
              <span className="mb-3 block text-3xl">🆕</span>
              <h3 className="text-sm font-medium uppercase tracking-wider text-brand-900">
                Novedades
              </h3>
              <p className="mt-1 text-xs text-brand-400">
                Los &uacute;ltimos dise&ntilde;os
              </p>
            </Link>

            <Link
              href="/productos?sort=vistos"
              className="group bg-white p-8 text-center transition hover:bg-surface"
            >
              <span className="mb-3 block text-3xl">⭐</span>
              <h3 className="text-sm font-medium uppercase tracking-wider text-brand-900">
                M&aacute;s vistos
              </h3>
              <p className="mt-1 text-xs text-brand-400">
                Los favoritos de todos
              </p>
            </Link>

            <Link
              href="/productos?categoria=casual"
              className="group bg-white p-8 text-center transition hover:bg-surface"
            >
              <span className="mb-3 block text-3xl">☀️</span>
              <h3 className="text-sm font-medium uppercase tracking-wider text-brand-900">
                Colecci&oacute;n verano
              </h3>
              <p className="mt-1 text-xs text-brand-400">
                Prendas frescas para el sol
              </p>
            </Link>

            <Link
              href="/productos?sort=newest"
              className="group bg-white p-8 text-center transition hover:bg-surface"
            >
              <span className="mb-3 block text-3xl">✨</span>
              <h3 className="text-sm font-medium uppercase tracking-wider text-brand-900">
                Lo nuevo de la semana
              </h3>
              <p className="mt-1 text-xs text-brand-400">
                Prendas especiales cada semana
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
              Compr&aacute; por edad
            </h2>
          </div>

          <div className="grid gap-px bg-brand-200 sm:grid-cols-2 lg:grid-cols-4">
            {ageGroups.map((age) => (
              <Link
                key={age.slug}
                href={`/productos?edad=${age.slug}`}
                className="group bg-white p-8 text-center transition hover:bg-surface"
              >
                <span className="mb-2 block text-3xl">
                  {age.slug === "0-3" && "👶"}
                  {age.slug === "3-7" && "🧒"}
                  {age.slug === "7-10" && "👦"}
                  {age.slug === "10-14" && "🧑"}
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-brand-900">
                  {age.name}
                </span>
                <span className="mt-1 block text-xs text-brand-400">
                  {age.range}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
              Categor&iacute;as
            </h2>
          </div>

          <div className="grid gap-px bg-brand-200 sm:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="bg-white p-10 text-center transition hover:bg-surface"
              >
                <Link href={`/productos?categoria=${cat.slug}`}>
                  <span className="mb-3 block text-4xl">
                    {cat.slug === "casual" && "👕"}
                    {cat.slug === "arreglada" && "👗"}
                    {cat.slug === "deporte" && "👟"}
                  </span>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-brand-900">
                    {cat.name}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-brand-400">{cat.description}</p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {ageGroups.map((age) => (
                    <Link
                      key={age.slug}
                      href={`/productos?categoria=${cat.slug}&edad=${age.slug}`}
                      className="inline-block border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-400 transition hover:border-brand-900 hover:text-brand-900"
                    >
                      {age.range}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
