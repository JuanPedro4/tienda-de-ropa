interface Certification {
  name: string;
  badge?: string;
}

interface ProductInfoData {
  title: string;
  subtitle?: string;
  description: string;
  material?: string;
  originCountry?: string;
  certifications?: Certification[];
}

interface ProductInfoProps {
  product: ProductInfoData;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-brand-900 sm:text-3xl">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="mt-1 text-sm text-brand-400">{product.subtitle}</p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
          Descripción
        </h2>
        <p className="text-sm leading-relaxed text-brand-600 whitespace-pre-line">
          {product.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-brand-200 p-px">
        {product.material && (
          <div className="bg-surface p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
              Composición
            </p>
            <p className="mt-0.5 text-sm font-medium text-brand-900">
              {product.material}
            </p>
          </div>
        )}
        {product.originCountry && (
          <div className="bg-surface p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
              Origen
            </p>
            <p className="mt-0.5 text-sm font-medium text-brand-900">
              {product.originCountry}
            </p>
          </div>
        )}
        <div className="bg-surface p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Lavado
          </p>
          <p className="mt-0.5 text-sm font-medium text-brand-900">
            Seguir instrucciones de la etiqueta
          </p>
        </div>
      </div>

      {product.certifications && product.certifications.length > 0 && (
        <div>
          <h2 className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Certificaciones
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert) => (
              <span
                key={cert.name}
                className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-500"
              >
                {cert.badge && (
                  <img src={cert.badge} alt="" className="h-4 w-4" />
                )}
                {cert.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-brand-200 pt-6">
        <h2 className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
          Reseñas
        </h2>
        <p className="mt-2 text-xs text-brand-400">
          Las reseñas estarán disponibles próximamente.
        </p>
      </div>
    </div>
  );
}
