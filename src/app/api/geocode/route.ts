import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'q' is required" },
        { status: 400 },
      );
    }

    // Call Nominatim with standard User-Agent header (required by OSM policy)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${query}, Bangladesh`,
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "RentShebaDirectory/1.0 (contact@rentsheba.com)",
        "Accept-Language": "en,bn",
      },
      next: { revalidate: 3600 }, // Cache geocode results for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Geocoding service unavailable" },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const first = data[0];
    return NextResponse.json({
      success: true,
      data: {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.display_name,
      },
    });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
