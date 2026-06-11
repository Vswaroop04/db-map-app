import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
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

export function MapRenderer({ places, activeId, userLocation, onPinPress, onBoundsChange }: Props) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const onPinPressRef = useRef(onPinPress);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  onPinPressRef.current = onPinPress;
  onBoundsChangeRef.current = onBoundsChange;

  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [51.5074, -0.1278];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const node = containerRef.current as unknown as HTMLDivElement | null;
      if (!node || mapRef.current) return;
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      const map = L.map(node, { zoomControl: true }).setView(center, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // ResizeObserver fires when the container gets real pixel dimensions —
      // more reliable than setTimeout for flex layouts that resolve after paint.
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(node);

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
    }

    init();
    return () => {
      cancelled = true;
      ro?.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function updateMarkers() {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      places.forEach((place) => {
        const isActive = place.id === activeId;
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

    updateMarkers();
    return () => { cancelled = true; };
  }, [places, activeId]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject, backgroundColor: '#e8eae0' },
});
