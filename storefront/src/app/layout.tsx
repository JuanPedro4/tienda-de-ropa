import type { Metadata } from "next";
import "./globals.css";
import { storeJsonLd, JsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: {
    template: "%s | Pasito a Paso",
    default: "Pasito a Paso — Ropa infantil para niños de 0 a 14 años",
  },
  description:
    "Descubre Pasito a Paso, tu tienda de ropa infantil: casual, arreglada y deporte. Talles 50-164 cm (EN 13402). Calidad y diseño para niños de 0 a 14 años.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pasito a Paso — Ropa infantil para niños de 0 a 14 años",
    description:
      "Descubre Pasito a Paso, tu tienda de ropa infantil: casual, arreglada y deporte. Talles 50-164 cm (EN 13402). Calidad y diseño para niños de 0 a 14 años.",
    locale: "es_ES",
    type: "website",
    siteName: "Pasito a Paso",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pasito a Paso — Ropa infantil para niños de 0 a 14 años",
    description:
      "Descubre Pasito a Paso, tu tienda de ropa infantil: casual, arreglada y deporte. Talles 50-164 cm (EN 13402). Calidad y diseño para niños de 0 a 14 años.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white">
        {children}
        <JsonLd jsonLd={storeJsonLd()} />
      </body>
    </html>
  );
}
