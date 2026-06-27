// ──────────────────────────────────────────────
// Seed script for Tienda de Ropa Infantil
// Generates categories, subcategories, and products
// with variants for Medusa.js v2
// ──────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Categories ───────────────────────────────

interface SubCategory {
  name: string;
  handle: string;
  description: string;
}

interface Category {
  name: string;
  handle: string;
  description: string;
  subcategories: SubCategory[];
}

const categories: Category[] = [
  {
    name: "Casual",
    handle: "casual",
    description: "Ropa cómoda para el día a día",
    subcategories: [
      { name: "Camisetas", handle: "camisetas", description: "Camisetas de algodón y manga corta" },
      { name: "Pantalones", handle: "pantalones-casual", description: "Pantalones casuales y joggers" },
      { name: "Sudaderas", handle: "sudaderas", description: "Sudaderas y hoodies" },
      { name: "Vestidos casual", handle: "vestidos-casual", description: "Vestidos informales para niña" },
      { name: "Pijamas", handle: "pijamas", description: "Pijamas de algodón" },
    ],
  },
  {
    name: "Arreglada",
    handle: "formal",
    description: "Para ocasiones especiales y eventos",
    subcategories: [
      { name: "Camisas", handle: "camisas", description: "Camisas formales" },
      { name: "Pantalones formales", handle: "pantalones-formales", description: "Pantalones de vestir" },
      { name: "Vestidos de fiesta", handle: "vestidos-fiesta", description: "Vestidos para ocasiones especiales" },
      { name: "Chaquetas", handle: "chaquetas", description: "Chaquetas y americanas" },
      { name: "Accesorios", handle: "accesorios-formales", description: "Complementos para ocasiones especiales" },
    ],
  },
  {
    name: "Deporte",
    handle: "sport",
    description: "Activa y transpirable para jugar",
    subcategories: [
      { name: "Camisetas deporte", handle: "camisetas-deporte", description: "Camisetas transpirables" },
      { name: "Pantalones deporte", handle: "pantalones-deporte", description: "Pantalones y leggings deportivos" },
      { name: "Bañadores", handle: "banadores", description: "Bañadores y bikinis" },
      { name: "Chándales", handle: "chandales", description: "Conjuntos deportivos" },
      { name: "Calcetines", handle: "calcetines", description: "Calcetines deportivos" },
    ],
  },
];

// ── Product Templates ────────────────────────

const EN13402_SIZES = [
  "50", "56", "62", "68", "74", "80", "86",
  "92", "98", "104", "110", "116", "122",
  "128", "134", "140", "146", "152", "158", "164",
];

const COLORS = ["Blanco", "Negro", "Azul marino", "Gris", "Rosa", "Verde", "Rojo", "Amarillo"];

interface ProductTemplate {
  name: string;
  description: string;
  material: string;
  category: string;
  subcategory: string;
  colors: string[];
  basePrice: number;
  sizes: string[];
  gender: string;
}

const productTemplates: ProductTemplate[] = [
  // ── Casual ──
  { name: "Camiseta básica manga corta", description: "Camiseta de algodón orgánico de manga corta. Suave y transpirable, ideal para el día a día. Costuras reforzadas y etiqueta sin roce.", material: "100% Algodón orgánico", category: "casual", subcategory: "camisetas", colors: ["Blanco", "Negro", "Azul marino", "Gris", "Rosa", "Rojo"], basePrice: 1290, sizes: ["92", "98", "104", "110", "116", "122", "128", "134"], gender: "unisex" },
  { name: "Camiseta estampada animal", description: "Camiseta con divertido estampado de animales. Teñido con colorantes libres de químicos. Cómoda y resistente para jugar todo el día.", material: "95% Algodón, 5% Elastano", category: "casual", subcategory: "camisetas", colors: ["Blanco", "Gris", "Verde"], basePrice: 1590, sizes: ["92", "98", "104", "110", "116", "122"], gender: "unisex" },
  { name: "Camiseta de rayas", description: "Camiseta clásica de rayas marineras. Corte regular y tejido de punto suave. Perfecta para combinar con cualquier look.", material: "100% Algodón", category: "casual", subcategory: "camisetas", colors: ["Blanco", "Azul marino"], basePrice: 1490, sizes: ["92", "98", "104", "110", "116", "122", "128"], gender: "unisex" },
  { name: "Jogger algodón", description: "Pantalón jogger de algodón con cintura elástica y cordón. Bolsillos laterales y puños ajustados en los tobillos.", material: "100% Algodón", category: "casual", subcategory: "pantalones-casual", colors: ["Gris", "Negro", "Azul marino", "Verde"], basePrice: 1990, sizes: ["92", "98", "104", "110", "116", "122", "128", "134", "140"], gender: "unisex" },
  { name: "Pantalón vaquero", description: "Pantalón vaquero elástico con cintura ajustable. Cinco bolsillos y diseño clásico. Cómodo y resistente.", material: "98% Algodón, 2% Elastano", category: "casual", subcategory: "pantalones-casual", colors: ["Azul marino", "Negro"], basePrice: 2490, sizes: ["98", "104", "110", "116", "122", "128", "134", "140", "146"], gender: "unisex" },
  { name: "Short vaquero", description: "Short vaquero con dobladillo enrollado. Cintura ajustable con elástico interior. Fresco y cómodo para el verano.", material: "100% Algodón", category: "casual", subcategory: "pantalones-casual", colors: ["Azul marino"], basePrice: 1790, sizes: ["98", "104", "110", "116", "122", "128"], gender: "unisex" },
  { name: "Sudadera básica", description: "Sudadera de algodón con capucha. Bolsillo canguro delantero y costillas en puños y dobladillo. Forro interior cepillado.", material: "80% Algodón, 20% Poliéster", category: "casual", subcategory: "sudaderas", colors: ["Gris", "Azul marino", "Rosa", "Verde"], basePrice: 2490, sizes: ["98", "104", "110", "116", "122", "128", "134", "140", "146"], gender: "unisex" },
  { name: "Sudadera con cremallera", description: "Sudadera con cremallera completa y capucha. Dos bolsillos laterales y protección de barbilla. Tejido de punto francés.", material: "80% Algodón, 20% Poliéster", category: "casual", subcategory: "sudaderas", colors: ["Gris", "Negro", "Azul marino", "Rojo"], basePrice: 2990, sizes: ["104", "110", "116", "122", "128", "134", "140"], gender: "unisex" },
  { name: "Vestido casual algodón", description: "Vestido de algodón con vuelo. Estampado floral y lazo en la cintura. Fresco y cómodo para el día a día.", material: "100% Algodón", category: "casual", subcategory: "vestidos-casual", colors: ["Rosa", "Blanco", "Amarillo"], basePrice: 2290, sizes: ["92", "98", "104", "110", "116", "122", "128"], gender: "nina" },
  { name: "Pijama de algodón", description: "Pijama de algodón 100% orgánico. Camiseta de manga corta y pantalón corto. Cintura elástica cómoda. Certificado GOTS.", material: "100% Algodón orgánico", category: "casual", subcategory: "pijamas", colors: ["Blanco", "Rosa", "Azul marino"], basePrice: 1990, sizes: ["92", "98", "104", "110", "116", "122", "128"], gender: "unisex" },

  // ── Formal ──
  { name: "Camisa formal manga larga", description: "Camisa de vestir de manga larga con cuello italiano. Botones de nácar y puños ajustables. Planchado permanente.", material: "100% Algodón", category: "formal", subcategory: "camisas", colors: ["Blanco", "Azul marino"], basePrice: 2990, sizes: ["110", "116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "nino" },
  { name: "Pantalón de vestir", description: "Pantalón formal de pinzas con cintura ajustable. Tejido de sarga suave. Con bolsillos laterales y traseros.", material: "65% Poliéster, 35% Algodón", category: "formal", subcategory: "pantalones-formales", colors: ["Negro", "Azul marino", "Gris"], basePrice: 2990, sizes: ["110", "116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "nino" },
  { name: "Vestido de fiesta con tul", description: "Precioso vestido de fiesta con falda de tul. Cuerpo forrado en algodón y cierre trasero con cremallera. Ideal para bodas y comuniones.", material: "Forro: 100% Algodón, Falda: 100% Poliéster", category: "formal", subcategory: "vestidos-fiesta", colors: ["Blanco", "Rosa", "Rojo"], basePrice: 4990, sizes: ["98", "104", "110", "116", "122", "128", "134", "140"], gender: "nina" },
  { name: "Americana infantil", description: "Americana de vestir para niño. Corte slim fit con dos botones. Bolsillos con solapa y detalle de ojal en solapa.", material: "70% Poliéster, 30% Algodón", category: "formal", subcategory: "chaquetas", colors: ["Azul marino", "Negro", "Gris"], basePrice: 3990, sizes: ["116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "nino" },
  { name: "Chaleco formal", description: "Chaleco de vestir a juego con la americana. Cierre de botones y espalda de raso. Perfecto para eventos formales.", material: "70% Poliéster, 30% Algodón", category: "formal", subcategory: "accesorios-formales", colors: ["Azul marino", "Negro", "Gris"], basePrice: 2490, sizes: ["116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "nino" },
  { name: "Lazo/pajarita", description: "Pajarita ajustable con clip. Disponible en varios colores lisos y estampados. Fácil de poner y quitar.", material: "100% Poliéster", category: "formal", subcategory: "accesorios-formales", colors: ["Azul marino", "Negro", "Rojo", "Blanco"], basePrice: 990, sizes: ["116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "nino" },
  { name: "Vestido floreado primavera", description: "Vestido estampado con flores pequeñas. Cintura con lazo ajustable y mangas abullonadas. Fresco y elegante.", material: "100% Algodón", category: "formal", subcategory: "vestidos-fiesta", colors: ["Rosa", "Blanco", "Amarillo"], basePrice: 3490, sizes: ["98", "104", "110", "116", "122", "128"], gender: "nina" },
  { name: "Falda de vuelo", description: "Falda con vuelo y forro interior. Cintura elástica cómoda. Perfecta para combinar con camisa o blusa.", material: "100% Algodón", category: "formal", subcategory: "vestidos-fiesta", colors: ["Blanco", "Rosa", "Azul marino"], basePrice: 1990, sizes: ["104", "110", "116", "122", "128", "134", "140"], gender: "nina" },

  // ── Sport ──
  { name: "Camiseta deportiva transpirable", description: "Camiseta técnica de secado rápido. Tejido transpirable que aleja la humedad de la piel. Ideal para correr y jugar.", material: "100% Poliéster reciclado", category: "sport", subcategory: "camisetas-deporte", colors: ["Azul marino", "Negro", "Rojo", "Verde"], basePrice: 1490, sizes: ["104", "110", "116", "122", "128", "134", "140", "146", "152"], gender: "unisex" },
  { name: "Leggings deportivos", description: "Leggings de compresión con cintura alta. Tejido elástico en 4 direcciones. Costuras planas para evitar rozaduras.", material: "80% Poliéster, 20% Elastano", category: "sport", subcategory: "pantalones-deporte", colors: ["Negro", "Azul marino", "Rosa", "Gris"], basePrice: 1990, sizes: ["104", "110", "116", "122", "128", "134", "140", "146", "152"], gender: "nina" },
  { name: "Pantalón corto deportivo", description: "Pantalón corto para deporte con cintura elástica y cordón. Tejido ligero y transpirable. Con bolsillo trasero con cremallera.", material: "100% Poliéster", category: "sport", subcategory: "pantalones-deporte", colors: ["Negro", "Azul marino", "Rojo"], basePrice: 1490, sizes: ["104", "110", "116", "122", "128", "134", "140", "146", "152"], gender: "unisex" },
  { name: "Bañador infantil", description: "Bañador de natación con protección UV50+. Tejido de secado rápido y cintura ajustable con cordón interior. Resistente al cloro.", material: "80% Poliéster, 20% Elastano", category: "sport", subcategory: "banadores", colors: ["Azul marino", "Rojo", "Verde"], basePrice: 1790, sizes: ["98", "104", "110", "116", "122", "128", "134", "140"], gender: "nino" },
  { name: "Bikini infantil", description: "Bikini de dos piezas con protección UV50+. Tejido resistente al cloro y al agua salada. Estampado divertido.", material: "80% Poliéster, 20% Elastano", category: "sport", subcategory: "banadores", colors: ["Rosa", "Amarillo", "Azul marino"], basePrice: 1990, sizes: ["98", "104", "110", "116", "122", "128", "134", "140"], gender: "nina" },
  { name: "Chándal completo", description: "Conjunto deportivo de chándal. Chaqueta con cremallera completa y pantalón con cintura elástica. Forro interior cepillado.", material: "65% Algodón, 35% Poliéster", category: "sport", subcategory: "chandales", colors: ["Gris", "Azul marino", "Negro"], basePrice: 3490, sizes: ["104", "110", "116", "122", "128", "134", "140", "146", "152"], gender: "unisex" },
  { name: "Calcetines deportivos", description: "Pack de 3 pares de calcetines deportivos. Tejido transpirable con refuerzo en talón y puntera. Banda elástica suave.", material: "75% Algodón, 20% Poliéster, 5% Elastano", category: "sport", subcategory: "calcetines", colors: ["Blanco", "Negro", "Gris"], basePrice: 990, sizes: ["92", "98", "104", "110", "116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "unisex" },
  { name: "Chaqueta deportiva impermeable", description: "Chaqueta cortavientos e impermeable con capucha desmontable. Costuras selladas y cremallera impermeable. Ideal para días lluviosos.", material: "100% Poliéster con membrana impermeable", category: "sport", subcategory: "chandales", colors: ["Azul marino", "Rojo", "Verde"], basePrice: 3990, sizes: ["110", "116", "122", "128", "134", "140", "146", "152", "158", "164"], gender: "unisex" },
];

// ── Helpers ──────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateHandle(base: string, index: number): string {
  return `${base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}-${index}`;
}

// ── Main ─────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (in correct order for FK constraints)
  await prisma.pickupCode.deleteMany();
  await prisma.stripeEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeHours.deleteMany();
  await prisma.store.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.ageRange.deleteMany();
  await prisma.category.deleteMany();

  console.log("  ✓ Existing data cleared");

  // Create a test admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@tienda.com" },
    update: {},
    create: {
      name: "Admin Tienda",
      email: "admin@tienda.com",
      role: "ADMIN",
      password: "$2a$10$dummy_hash_placeholder", // password: "admin123"
    },
  });

  console.log(`  ✓ Admin user created: ${admin.email}`);

  // Create a test customer
  const customer = await prisma.user.upsert({
    where: { email: "cliente@test.com" },
    update: {},
    create: {
      name: "Cliente Prueba",
      email: "cliente@test.com",
      role: "CUSTOMER",
    },
  });

  console.log(`  ✓ Test customer created: ${customer.email}`);

  // Note: In a real setup with Medusa.js v2, products and categories are managed
  // through Medusa's own database via its migrations. This seed creates the necessary
  // auxiliary data for our Prisma-managed tables (reviews, wishlists, stores, etc.)
  // and outputs SQL/JSON that can be imported into Medusa for product data.

  // ── Generate product data for Medusa import ──
  console.log("\n📦 Generating product data...");

  interface GeneratedProduct {
    title: string;
    handle: string;
    description: string;
    material: string;
    originCountry: string;
    category: string;
    subcategory: string;
    variants: {
      sku: string;
      title: string;
      price: number;
      size: string;
      color: string;
      inventoryQuantity: number;
    }[];
    images: string[];
    tags: string[];
    gender: string;
  }

  const generatedProducts: GeneratedProduct[] = [];
  let productCounter = 0;

  for (const template of productTemplates) {
    productCounter++;
    const handle = generateHandle(template.name, productCounter);

    // Determine which sizes to use (vary per product)
    const availableSizes = template.sizes.length > 5
      ? template.sizes.filter(() => Math.random() > 0.3)
      : template.sizes;

    const availableColors = template.colors.length > 1
      ? template.colors.filter(() => Math.random() > 0.4)
      : template.colors;

    const variants: GeneratedProduct["variants"] = [];

    for (const color of availableColors) {
      for (const size of availableSizes) {
        // Skip some color+size combinations randomly
        if (Math.random() < 0.15) continue;

        const priceVariation = template.basePrice * (1 + (Math.random() - 0.5) * 0.2);
        variants.push({
          sku: `${template.subcategory.substring(0, 3).toUpperCase()}-${productCounter}-${size}-${color.substring(0, 2).toUpperCase()}`,
          title: size,
          price: Math.round(priceVariation / 10) * 10, // round to nearest 10 cents
          size,
          color,
          inventoryQuantity: randomInt(0, 50),
        });
      }
    }

    // Ensure at least one variant
    if (variants.length === 0) {
      const defaultColor = template.colors[0] ?? "Blanco";
      const defaultSize = template.sizes[0] ?? "104";
      variants.push({
        sku: `${template.subcategory.substring(0, 3).toUpperCase()}-${productCounter}-${defaultSize}-${defaultColor.substring(0, 2).toUpperCase()}`,
        title: defaultSize,
        price: template.basePrice,
        size: defaultSize,
        color: defaultColor,
        inventoryQuantity: randomInt(0, 20),
      });
    }

    const tags = [template.category, template.subcategory, template.gender];

    generatedProducts.push({
      title: template.name,
      handle,
      description: template.description,
      material: template.material,
      originCountry: "España",
      category: template.category,
      subcategory: template.subcategory,
      variants,
      images: [], // Placeholder — add real URLs in production
      tags,
      gender: template.gender,
    });
  }

  // Output summary
  const totalVariants = generatedProducts.reduce((sum, p) => sum + p.variants.length, 0);

  console.log(`  ✓ ${generatedProducts.length} products generated`);
  console.log(`  ✓ ${totalVariants} variants generated`);

  // ── Group by category ──
  const byCategory: Record<string, number> = {};
  for (const p of generatedProducts) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`    ${cat}: ${count} products`);
  }

  // ── Export product data as JSON for Medusa import ──
  // This file can be used to bulk-import products into Medusa.js
  const fs = await import("fs/promises");
  const path = await import("path");

  const exportPath = path.join(process.cwd(), "prisma", "seed-products.json");
  await fs.writeFile(
    exportPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        totalProducts: generatedProducts.length,
        totalVariants,
        categories: categories.map((c) => ({
          name: c.name,
          handle: c.handle,
          subcategories: c.subcategories,
        })),
        products: generatedProducts,
      },
      null,
      2,
    ),
  );

  console.log(`\n  ✓ Product data exported to prisma/seed-products.json`);

  // ── Create Categories ──
  console.log("\n🏷️ Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { handle: cat.handle },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, handle: cat.handle, description: cat.description },
    });
    categoryMap[cat.handle] = record.id;
  }
  console.log(`  ✓ ${Object.keys(categoryMap).length} categories created`);

  // ── Create Age Ranges ──
  console.log("\n📏 Creating age ranges...");
  const ageRanges = [
    { slug: "0-3", name: "0–3 años", min: 50, max: 86 },
    { slug: "3-7", name: "3–7 años", min: 92, max: 122 },
    { slug: "7-10", name: "7–10 años", min: 128, max: 140 },
    { slug: "10-14", name: "10–14 años", min: 146, max: 164 },
  ];
  const ageRangeMap: Record<string, string> = {};
  for (const ar of ageRanges) {
    const record = await prisma.ageRange.upsert({
      where: { slug: ar.slug },
      update: { name: ar.name, min: ar.min, max: ar.max },
      create: { slug: ar.slug, name: ar.name, min: ar.min, max: ar.max },
    });
    ageRangeMap[ar.slug] = record.slug;
  }
  console.log(`  ✓ ${Object.keys(ageRangeMap).length} age ranges created`);

  function getAgeRangeSlug(sizes: string[]): string {
    const minSize = Math.min(...sizes.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n)));
    if (minSize <= 86) return "0-3";
    if (minSize <= 122) return "3-7";
    if (minSize <= 140) return "7-10";
    return "10-14";
  }

  // ── Create Product records in Prisma ──
  console.log("\n🏪 Creating product records in Prisma...");

  for (const prod of generatedProducts) {
    const sizeNumbers = prod.variants.map((v) => parseInt(v.title, 10)).filter((n) => !isNaN(n));
    const ageSlug = getAgeRangeSlug(sizeNumbers.length > 0 ? sizeNumbers.map(String) : []);
    const imagePath = `/images/productos/${prod.handle}.jpg`;

    const categoryId = categoryMap[prod.category] ?? null;

    const product = await prisma.product.upsert({
      where: { handle: prod.handle },
      update: {
        title: prod.title,
        description: prod.description,
        material: prod.material,
        thumbnail: imagePath,
        images: [imagePath],
        categoryId,
        ageRange: ageSlug,
      },
      create: {
        title: prod.title,
        handle: prod.handle,
        description: prod.description,
        material: prod.material,
        thumbnail: imagePath,
        images: [imagePath],
        categoryId,
        ageRange: ageSlug,
      },
    });

    for (const v of prod.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          price: v.price,
          inventoryQuantity: v.inventoryQuantity,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          inventoryQuantity: v.inventoryQuantity,
        },
      });
    }
  }

  // Update thumbnail paths for products that need it
  await prisma.product.updateMany({
    where: { thumbnail: null },
    data: {
      thumbnail: "/images/productos/placeholder.jpg",
    },
  });

  const dbProductCount = await prisma.product.count();
  const dbVariantCount = await prisma.productVariant.count();
  console.log(`  ✓ ${dbProductCount} products created in Prisma`);
  console.log(`  ✓ ${dbVariantCount} variants created in Prisma`);

  // ── Create stores (pickup locations) ──
  const stores = [
    { name: "Tienda Centro", slug: "centro", address: "Calle Mayor 42, 28001 Madrid", city: "Madrid", lat: 40.4168, lng: -3.7038, phone: "+34 91 123 45 67" },
    { name: "Tienda Norte", slug: "norte", address: "Av. de la Constitución 15, 41001 Sevilla", city: "Sevilla", lat: 37.3891, lng: -5.9845, phone: "+34 95 234 56 78" },
    { name: "Tienda Costa", slug: "costa", address: "Calle Colón 28, 46004 Valencia", city: "Valencia", lat: 39.4699, lng: -0.3763, phone: "+34 96 345 67 89" },
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: {},
      create: store,
    });
  }
  console.log("  ✓ Store locations created");

  // ── Create store hours ──
  const storeRecords = await prisma.store.findMany();

  for (const store of storeRecords) {
    for (let day = 0; day < 7; day++) {
      const isWeekend = day === 0 || day === 6;
      await prisma.storeHours.upsert({
        where: { storeId_dayOfWeek: { storeId: store.id, dayOfWeek: day } },
        update: {},
        create: {
          storeId: store.id,
          dayOfWeek: day,
          openTime: isWeekend ? "10:00" : "09:30",
          closeTime: isWeekend ? "14:00" : "20:00",
          isClosed: day === 0, // Sunday closed
        },
      });
    }
  }
  console.log("  ✓ Store hours created");

  console.log("\n✅ Seed completed successfully!");
  console.log(`   ${generatedProducts.length} products in ${Object.keys(byCategory).length} categories`);
  console.log(`   ${totalVariants} total variants`);
  console.log(`   ${storeRecords.length} store locations`);
  console.log(`\n📄 Product data exported to: prisma/seed-products.json`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
