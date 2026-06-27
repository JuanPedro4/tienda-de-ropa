import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCache } from "@/lib/cache";

// ──────────────────────────────────────────────
// GET /api/stores
// Returns active stores with their hours.
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const stores = await withCache(
      "cache:stores:active",
      async () => {
        const data = await prisma.store.findMany({
          where: { isActive: true },
          include: {
            storeHours: {
              orderBy: { dayOfWeek: "asc" },
            },
          },
          orderBy: { name: "asc" },
        });

        return data.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          address: s.address,
          city: s.city,
          phone: s.phone,
          lat: s.lat,
          lng: s.lng,
          hours: s.hours,
          storeHours: s.storeHours.map((h) => ({
            id: h.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        }));
      },
      300,
    );

    return NextResponse.json({ stores });
  } catch (err) {
    console.error("[stores-api] Error fetching stores:", err);
    return NextResponse.json(
      { error: "Error al cargar sucursales" },
      { status: 500 },
    );
  }
}
