import Link from "next/link";

export default function StoreCTA() {
  return (
    <section className="border-t border-brand-200 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
          Contacto
        </h2>
        <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-brand-500">
          Visitanos en nuestra tienda f&iacute;sica, escribinos por correo o redes sociales.
          Te ayudamos a encontrar el talle y la prenda perfecta.
        </p>

        <div className="mx-auto mb-10 grid max-w-2xl gap-px bg-brand-200 sm:grid-cols-3">
          <div className="bg-white p-6">
            <p className="mb-1 text-xl">📍</p>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-900">
              Direcci&oacute;n
            </p>
            <p className="mt-1 text-xs text-brand-400">
              Calle Ejemplo 123, Local 4<br />
              Madrid
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="mb-1 text-xl">✉️</p>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-900">
              Email
            </p>
            <p className="mt-1 text-xs text-brand-400">
              <a href="mailto:info@pasitoapaso.com" className="hover:text-brand-900 transition">
                info@pasitoapaso.com
              </a>
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="mb-1 text-xl">🕐</p>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-900">
              Horarios
            </p>
            <p className="mt-1 text-xs text-brand-400">
              Lun&ndash;Vie: 10:00&ndash;20:00<br />
              S&aacute;b: 10:00&ndash;14:00
            </p>
          </div>
        </div>

        <Link
          href="/productos"
          className="inline-block border border-brand-900 px-8 py-3 text-xs font-medium uppercase tracking-widest text-brand-900 transition hover:bg-brand-900 hover:text-white"
        >
          Ver cat&aacute;logo completo
        </Link>
      </div>
    </section>
  );
}
