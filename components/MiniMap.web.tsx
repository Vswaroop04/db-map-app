import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Map as LeafletMap } from 'leaflet';

type Props = { latitude: number; longitude: number };

export function MiniMap({ latitude, longitude }: Props) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function init() {
      const node = containerRef.current as unknown as HTMLDivElement | null;
      if (!node || mapRef.current) return;
      const L = (await import('leaflet')).default;

      const map = L.map(node, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([latitude, longitude], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.marker([latitude, longitude]).addTo(map);
      mapRef.current = map;
    }

    init();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: '#e8eae0' },
});
