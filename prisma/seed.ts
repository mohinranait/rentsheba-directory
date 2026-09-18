

import { prisma } from "@/lib/prisma";
import locationsData from "./data/bangladesh-locations.json"



type LocationType = "DIVISION" | "DISTRICT" | "UPAZILA";

interface LocationItem {
  id: string;
  name_en: string;
  name_local: string;
  slug: string;
  lat?: number;
  lon?: number;
  parent_id?: string;
  parent_name_en?: string;
  parent_name_local?: string;
  postal_code?: string;
}

const data = locationsData;

async function seedLocations(
  locations: LocationItem[],
  type: LocationType,
) {
  for (const location of locations) {
    await prisma.location.upsert({
      where: {
        id: location.id,
      },
      update: {
        nameEn: location.name_en,
        nameLocal: location.name_local,
        slug: location.slug,
        lat: location.lat,
        lon: location.lon,
        postalCode: location.postal_code,
        parentId: location.parent_id ?? null,
        type,
      },
      create: {
        id: location.id,
        nameEn: location.name_en,
        nameLocal: location.name_local,
        slug: location.slug,
        lat: location.lat,
        lon: location.lon,
        postalCode: location.postal_code,
        parentId: location.parent_id ?? null,
        type,
      },
    });
  }
}

async function main() {
  console.log("🌍 Seeding Bangladesh locations...");

  // Parent আগে create করতে হবে
  await seedLocations(data.division, "DIVISION");

  // তারপর district
  await seedLocations(data.district, "DISTRICT");

  // তারপর upazila
  await seedLocations(data.upazila, "UPAZILA");

  console.log("✅ Bangladesh locations seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Location seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });