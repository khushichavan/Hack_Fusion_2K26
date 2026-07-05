import L from "leaflet";
import type { MapMarkerType } from "@/types";

const typeStyle: Record<MapMarkerType, { color: string; glyph: string }> = {
  traffic: { color: "#38bdf8", glyph: "T" },
  congestion: { color: "#fb923c", glyph: "C" },
  camera: { color: "#a78bfa", glyph: "◉" },
  accident: { color: "#f87171", glyph: "!" },
  construction: { color: "#fbbf24", glyph: "▲" },
  emergency: { color: "#22d3ee", glyph: "✚" },
};

export function createMarkerIcon(type: MapMarkerType): L.DivIcon {
  const { color, glyph } = typeStyle[type];
  return L.divIcon({
    className: "traffic-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:34px;height:34px;border-radius:9999px;background:${color}33;animation:mk-ping 1.8s ease-out infinite;"></span>
        <span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${color};color:#0b1220;font-weight:800;font-size:13px;border:2px solid rgba(255,255,255,0.85);box-shadow:0 4px 12px rgba(0,0,0,0.4);">${glyph}</span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

export function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: "user-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:40px;height:40px;border-radius:9999px;background:#3b82f633;animation:mk-ping 1.8s ease-out infinite;"></span>
        <span style="position:relative;width:16px;height:16px;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6;"></span>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}
