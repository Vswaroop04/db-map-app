import { useEffect, useRef } from 'react';
import type * as LeafletType from 'leaflet';
import type { Map as LeafletMap, Marker as LeafletMarker, CircleMarker } from 'leaflet';
import { categoryEmoji } from '../lib/utils/distance';
import { type Place } from '../lib/types/place';
import { type Bounds } from '../lib/services/geoapify';

type Props = {
  places: Place[];
  activeId: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  onPinPress: (place: Place) => void;
  onBoundsChange?: (bounds: Bounds) => void;
};

function pinHtml(emoji: string, active: boolean) {
  const size = active ? 36 : 30;
  const bg = active ? '#2563EB' : '#1D4ED8';
  return `<div style="
    width:${size}px;height:${size}px;
    background:${bg};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2px solid rgba(255,255,255,0.8);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;
  "><span style="transform:rotate(45deg);display:block;">${emoji}</span></div>`;
}

function loadLeafletCSS(): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.getElementById('leaflet-css') as HTMLLinkElement | null;
    if (existing) {
      existing.sheet ? resolve() : existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
    document.head.appendChild(link);
  });
}

export function MapRenderer({ places, activeId, userLocation, onPinPress, onBoundsChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const userDotRef = useRef<CircleMarker | null>(null);
  const onPinPressRef = useRef(onPinPress);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const userLocationRef = useRef(userLocation);
  const placesRef = useRef(places);
  const activeIdRef = useRef(activeId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  onPinPressRef.current = onPinPress;
  onBoundsChangeRef.current = onBoundsChange;
  userLocationRef.current = userLocation;
  placesRef.current = places;
  activeIdRef.current = activeId;

  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [51.5074, -0.1278];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function init() {
      const node = containerRef.current;
      if (!node || mapRef.current) return;

      await loadLeafletCSS();
      if (cancelled) return;

      const L = (await import('leaflet')).default;
      if (cancelled) return;

      const map = L.map(node, { zoomControl: true }).setView(center, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Locate button
      const LocateControl = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd() {
          const btn = L.DomUtil.create('button');
          btn.title = 'Go to my location';
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`;
          btn.style.cssText = [
            'width:36px;height:36px;border-radius:8px;border:none;cursor:pointer;',
            'background:white;display:flex;align-items:center;justify-content:center;',
            'box-shadow:0 2px 6px rgba(0,0,0,0.2);color:#1D4ED8;margin-bottom:8px;margin-right:2px;',
          ].join('');
          btn.onmouseenter = () => { btn.style.background = '#EFF6FF'; };
          btn.onmouseleave = () => { btn.style.background = 'white'; };
          L.DomEvent.on(btn, 'click', () => {
            const loc = userLocationRef.current;
            if (loc) map.flyTo([loc.latitude, loc.longitude], 14, { duration: 1 });
          });
          L.DomEvent.disableClickPropagation(btn);
          return btn;
        },
      });
      new LocateControl().addTo(map);

      map.on('moveend', () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const b = map.getBounds();
          onBoundsChangeRef.current?.({
            minLat: b.getSouth(),
            maxLat: b.getNorth(),
            minLon: b.getWest(),
            maxLon: b.getEast(),
          });
        }, 1000);
      });

      mapRef.current = map;

      // Apply any places/location that arrived while init was awaiting CSS+Leaflet
      applyMarkers(map, L, placesRef.current, activeIdRef.current);
      applyUserDot(map, L, userLocationRef.current);
    }

    init();
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-sync place pins whenever places or activeId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    (async () => {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      applyMarkers(map, L, places, activeId);
    })();
    return () => { cancelled = true; };
  }, [places, activeId]);

  // Re-sync user dot whenever GPS location changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    (async () => {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      applyUserDot(map, L, userLocation);
    })();
    return () => { cancelled = true; };
  }, [userLocation]);

  function applyMarkers(
    map: LeafletMap,
    L: typeof LeafletType,
    currentPlaces: Place[],
    currentActiveId: string | null,
  ) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    currentPlaces.forEach((place) => {
      const isActive = place.id === currentActiveId;
      const emoji = categoryEmoji(place.category);
      const icon = L.divIcon({
        className: '',
        html: pinHtml(emoji, isActive),
        iconSize: [isActive ? 36 : 30, isActive ? 36 : 30],
        iconAnchor: [isActive ? 18 : 15, isActive ? 36 : 30],
      });
      const marker = L.marker([place.latitude, place.longitude], { icon }).addTo(map);
      marker.bindTooltip(place.name, {
        direction: 'top',
        offset: [0, -(isActive ? 36 : 30) - 4],
        className: 'map-pin-tooltip',
      });
      marker.on('click', () => onPinPressRef.current(place));
      markersRef.current.push(marker);
    });
  }

  function applyUserDot(
    map: LeafletMap,
    L: typeof LeafletType,
    loc: { latitude: number; longitude: number } | null,
  ) {
    userDotRef.current?.remove();
    userDotRef.current = null;
    if (!loc) return;
    userDotRef.current = L.circleMarker([loc.latitude, loc.longitude], {
      radius: 9,
      fillColor: '#2563EB',
      color: 'white',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map);
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#e8eae0' }}
    />
  );
}
