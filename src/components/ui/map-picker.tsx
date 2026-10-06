"use client";

import {
  Compass,
  Crosshair,
  ExternalLink,
  MapPin,
  Search,
  X,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Default coordinates: Central Dhaka, Bangladesh
const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 13;

type MapPickerProps = {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (coords: { lat: number | null; lng: number | null }) => void;
  addressHint?: string;
  className?: string;
  label?: string;
  description?: string;
};

export function MapPicker({
  latitude,
  longitude,
  onChange,
  addressHint,
  className,
  label = "ম্যাপে লোকেশন পিন করুন (Location Pin on Map)",
  description = "ম্যাপে ক্লিক করে বা পিন ড্র্যাগ করে আপনার সঠিক লোকেশন সিলেক্ট করুন। কাস্টমাররা গুগল ম্যাপে ডিরেকশন দেখতে পারবে।",
}: MapPickerProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerInstanceRef = React.useRef<any>(null);
  const roadmapLayerRef = React.useRef<any>(null);
  const satelliteLayerRef = React.useRef<any>(null);
  const [mapType, setMapType] = React.useState<"roadmap" | "satellite">("roadmap");
  const [isClient, setIsClient] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // Client-side only mounting for Leaflet
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Leaflet map
  React.useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      // Dynamic import of Leaflet
      const L = (await import("leaflet")).default;
      // Inject Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean existing instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter: [number, number] = hasCoords
        ? [latitude, longitude]
        : DEFAULT_CENTER;

      const initialZoom = hasCoords ? 15 : DEFAULT_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        scrollWheelZoom: "center",
      });

      // Google Maps Roadmap layer (100% Free, no API key required)
      const roadmapLayer = L.tileLayer(
        "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; Google Maps',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        },
      );

      // Google Maps Satellite / Hybrid layer (100% Free)
      const satelliteLayer = L.tileLayer(
        "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; Google Maps',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        },
      );

      roadmapLayerRef.current = roadmapLayer;
      satelliteLayerRef.current = satelliteLayer;

      if (mapType === "satellite") {
        satelliteLayer.addTo(map);
      } else {
        roadmapLayer.addTo(map);
      }

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

      let marker: any = null;

      if (hasCoords) {
        marker = L.marker([latitude, longitude], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange({
            lat: Number(pos.lat.toFixed(7)),
            lng: Number(pos.lng.toFixed(7)),
          });
        });
      }

      // Map click handler to set or move pin
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const roundedLat = Number(lat.toFixed(7));
        const roundedLng = Number(lng.toFixed(7));

        if (!marker) {
          marker = L.marker([lat, lng], {
            icon: customPinIcon,
            draggable: true,
          }).addTo(map);

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange({
              lat: Number(pos.lat.toFixed(7)),
              lng: Number(pos.lng.toFixed(7)),
            });
          });
        } else {
          marker.setLatLng([lat, lng]);
        }

        markerInstanceRef.current = marker;
        onChange({ lat: roundedLat, lng: roundedLng });
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Fix map rendering when displayed inside flex/tabs/collapsibles
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
  }, [isClient]);

  // Sync marker position when external props change
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    let marker = markerInstanceRef.current;

    if (hasCoords) {
      if (marker) {
        marker.setLatLng([latitude, longitude]);
      } else {
        // Create marker
        import("leaflet").then((L) => {
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
          marker = L.marker([latitude, longitude], {
            icon: customPinIcon,
            draggable: true,
          }).addTo(map);

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange({
              lat: Number(pos.lat.toFixed(7)),
              lng: Number(pos.lng.toFixed(7)),
            });
          });
          markerInstanceRef.current = marker;
        });
      }
    } else if (marker) {
      map.removeLayer(marker);
      markerInstanceRef.current = null;
    }
  }, [latitude, longitude, hasCoords]);

  // Switch between Roadmap and Satellite layer
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !roadmapLayerRef.current || !satelliteLayerRef.current) return;
    if (mapType === "roadmap") {
      if (map.hasLayer(satelliteLayerRef.current)) {
        map.removeLayer(satelliteLayerRef.current);
      }
      roadmapLayerRef.current.addTo(map);
    } else {
      if (map.hasLayer(roadmapLayerRef.current)) {
        map.removeLayer(roadmapLayerRef.current);
      }
      satelliteLayerRef.current.addTo(map);
    }
  }, [mapType]);

  // Search location using OpenStreetMap Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim() || addressHint?.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
      );
      const json = await res.json();

      if (!json.success || !json.data) {
        setSearchError("লোকেশন খুঁজে পাওয়া যায়নি। ম্যাপে সরাসরি ক্লিক করুন।");
        return;
      }

      const lat = json.data.lat;
      const lng = json.data.lng;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true });

        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
        } else {
          const L = (await import("leaflet")).default;
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
          const marker = L.marker([lat, lng], {
            icon: customPinIcon,
            draggable: true,
          }).addTo(mapInstanceRef.current);

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange({
              lat: Number(pos.lat.toFixed(7)),
              lng: Number(pos.lng.toFixed(7)),
            });
          });
          markerInstanceRef.current = marker;
        }
      }

      onChange({
        lat: Number(lat.toFixed(7)),
        lng: Number(lng.toFixed(7)),
      });
    } catch {
      setSearchError("অনুসন্ধান করতে সমস্যা হয়েছে। ম্যাপে ক্লিক করে পিন করুন।");
    } finally {
      setIsSearching(false);
    }
  };

  // Browser Geolocation / GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("আপনার ব্রাউজারে লোকেশন সার্ভিস উপলব্ধ নেই।");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([lat, lng]);
          } else {
            const L = (await import("leaflet")).default;
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
            const marker = L.marker([lat, lng], {
              icon: customPinIcon,
              draggable: true,
            }).addTo(mapInstanceRef.current);

            marker.on("dragend", () => {
              const p = marker.getLatLng();
              onChange({
                lat: Number(p.lat.toFixed(7)),
                lng: Number(p.lng.toFixed(7)),
              });
            });
            markerInstanceRef.current = marker;
          }
        }

        onChange({
          lat: Number(lat.toFixed(7)),
          lng: Number(lng.toFixed(7)),
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("লোকেশন পারমিশন দেওয়া হয়নি। ম্যাপে ক্লিক করে পিন করুন।");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleClearPin = () => {
    onChange({ lat: null, lng: null });
  };

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="latitude" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <MapPin className="size-4 text-emerald-600" />
            {label}
          </label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {hasCoords && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-mono text-[11px] bg-emerald-50 text-emerald-700 border-emerald-300"
            >
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </Badge>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearPin}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
            >
              <X className="size-3.5 mr-1" /> Clear
            </Button>
          </div>
        )}
      </div>

      {/* Map Control Bar (Search & Quick GPS) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form
          onSubmit={handleSearch}
          className="relative flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="এলাকা বা ঠিকানা খুঁজুন (যেমন: ধানমন্ডি, গুলশান, মিরপুর)..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isSearching}
            className="h-9 text-xs shrink-0"
          >
            {isSearching ? "খোঁজা হচ্ছে..." : "খুঁজুন"}
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="h-9 text-xs shrink-0 gap-1.5"
          title="আপনার বর্তমান অবস্থান ব্যবহার করুন"
        >
          <Crosshair
            className={cn("size-3.5 text-primary", isLocating && "animate-spin")}
          />
          {isLocating ? "লোকেশন খোঁজা হচ্ছে..." : "আমার অবস্থান (GPS)"}
        </Button>
      </div>

      {searchError && (
        <p className="text-xs text-destructive font-medium">{searchError}</p>
      )}

      {/* Interactive Map Box */}
      <div className="relative rounded-xl border border-border overflow-hidden bg-muted shadow-xs">
        <div
          ref={mapContainerRef}
          className="w-full h-72 sm:h-80 z-0"
          style={{ minHeight: "280px" }}
        />

        {/* Layer Switcher (Roadmap vs Satellite) */}
        <div className="absolute top-2 left-12 z-400 flex items-center bg-background/95 backdrop-blur-xs rounded-lg border shadow-xs p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMapType("roadmap")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
              mapType === "roadmap"
                ? "bg-[#1F4D3D] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            রোডম্যাপ
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
              mapType === "satellite"
                ? "bg-[#1F4D3D] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            স্যাটেলাইট
          </button>
        </div>

        {/* Floating Instruction Overlay */}
        <div className="absolute bottom-2 left-2 z-400 bg-background/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border text-[11px] shadow-sm text-foreground flex items-center gap-1.5 pointer-events-none">
          <Compass className="size-3.5 text-emerald-600 shrink-0" />
          <span>ম্যাপে যেকোনো স্থানে ক্লিক করুন অথবা পিন টেনে আনুন</span>
        </div>

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 z-400 bg-background/90 hover:bg-background backdrop-blur-xs px-2.5 py-1.5 rounded-lg border text-[11px] shadow-sm text-foreground font-medium flex items-center gap-1 transition-colors"
          >
            Google Maps-এ দেখুন <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {/* Manual Fine-Tuning Coordinates Inputs */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label htmlFor="latitude" className="text-[11px] text-muted-foreground block mb-1">
            Latitude (অক্ষাংশ)
          </label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : parseFloat(e.target.value);
              onChange({ lat: val, lng: longitude ?? null });
            }}
            placeholder="e.g. 23.810332"
            className="h-8 text-xs font-mono"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="text-[11px] text-muted-foreground block mb-1">
            Longitude (দ্রাঘিমাংশ)
          </label>
          <Input
          id="longitude"
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : parseFloat(e.target.value);
              onChange({ lat: latitude ?? null, lng: val });
            }}
            placeholder="e.g. 90.412518"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  );
}
