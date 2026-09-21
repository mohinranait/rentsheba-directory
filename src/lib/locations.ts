import { prisma } from "@/lib/prisma";

const LOCATION_SELECT = {
  id: true,
  nameEn: true,
  nameLocal: true,
  slug: true,
  parentId: true,
  lat: true,
  lon: true,
  postalCode: true,
  type: true,
} as const;

function mapLocation<T extends { lat: unknown; lon: unknown }>(location: T) {
  const { lat, lon, ...rest } = location;
  return {
    ...rest,
    lat: lat === null ? null : Number(lat),
    lon: lon === null ? null : Number(lon),
  };
}

export async function getDivisions() {
  const locations = await prisma.location.findMany({
    where: {
      type: "DIVISION",
      parentId: null,
    },
    orderBy: {
      nameEn: "asc",
    },
    select: LOCATION_SELECT,
  });

  return locations.map(mapLocation);
}

async function getChildLocations(
  parentSlug: string,
  type: "DISTRICT" | "UPAZILA",
) {
  const parent = await prisma.location.findFirst({
    where: {
      slug: parentSlug,
    },
    select: {
      id: true,
    },
  });

  if (!parent) {
    return [];
  }

  return prisma.location
    .findMany({
      where: {
        type,
        parentId: parent.id,
      },
      orderBy: {
        nameEn: "asc",
      },
      select: LOCATION_SELECT,
    })
    .then((locations) => locations.map(mapLocation));
}

export async function getDistricts(parentSlug: string) {
  return getChildLocations(parentSlug, "DISTRICT");
}

export async function getUpazilas(parentSlug: string) {
  return getChildLocations(parentSlug, "UPAZILA");
}
