"use client";

import { useEffect, useRef } from "react";

type Props = {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number;
};

export function PropertyMap({ latitude, longitude, zoom = 14, height = 320 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let map: any;
    let cancelled = false;

    async function init() {
      await ensureLeafletCss();
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      map = L.map(ref.current, {
        center: [latitude, longitude],
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      L.marker([latitude, longitude]).addTo(map);
    }

    init();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [latitude, longitude, zoom]);

  return (
    <div
      ref={ref}
      style={{ height: `${height}px` }}
      className="rounded-xl overflow-hidden border border-slate-200"
    />
  );
}

async function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  const id = "leaflet-css";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  link.integrity =
    "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
  link.crossOrigin = "";
  document.head.appendChild(link);
}
