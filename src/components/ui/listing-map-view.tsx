"use client";

import { ExternalLink, MapPin, Navigation } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type ListingMapViewProps = {
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  address?: string | null;
  className?: string;
};

export function ListingMapView({
  latitude,
  longitude,
  title,
  address,
  className,
}: ListingMapViewProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const [isClient, setIsClient] = React.useState(false);

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient || !hasCoords || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isSubscribed || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false, // Don't hijack page scroll
      });

      L.tileLayer(
        "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; Google Maps',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        },
      ).addTo(map);

      // Custom SVG Pin Marker
      const customPinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; width: 34px; height: 34px; transform: translate(-50%, -100%);">
            <svg viewBox="0 0 24 24" fill="#1F4D3D" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 34px; height: 34px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#1F4D3D" stroke-width="1.5"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([latitude!, longitude!], {
        icon: customPinIcon,
      }).addTo(map);

      if (title) {
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
            <strong style="color: #1F4D3D; font-size: 14px;">${title}</strong>
            ${address ? `<p style="margin: 4px 0 0; color: #4b5563;">${address}</p>` : ""}
          </div>
        `).openPopup();
      }

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    void initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, latitude, longitude, hasCoords, title, address]);

  // Google Maps Directions link
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : null;

  const viewOnGoogleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  if (!hasCoords && !address) return null;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-[#deebe1] bg-card shadow-xs", className)}>
      {/* Map display if coords exist */}
      {hasCoords ? (
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-56 sm:h-64 z-0"
            style={{ minHeight: "220px" }}
          />

          <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
            {viewOnGoogleMapsUrl && (
              <a
                href={viewOnGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background/90 hover:bg-background text-foreground px-2.5 py-1.5 rounded-lg border text-xs font-medium shadow-sm backdrop-blur-xs flex items-center gap-1 transition-colors"
              >
                Google Maps <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>
      ) : null}

      {/* Address and Directions Action Bar */}
      <div className="p-4 bg-[#f8faf8] border-t border-[#deebe1] space-y-3">
        {address && (
          <div className="flex items-start gap-2.5 text-sm">
            <MapPin className="size-4 text-[#1F4D3D] shrink-0 mt-0.5" />
            <p className="text-foreground/90 font-medium leading-relaxed">{address}</p>
          </div>
        )}

        {directionsUrl && (
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1F4D3D] hover:bg-[#16382c] text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs transition-colors"
            >
              <Navigation className="size-3.5 fill-current" />
              Get directions
            </a>

            {hasCoords && (
              <span className="font-mono text-[11px] text-muted-foreground ml-auto hidden sm:inline-block">
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
