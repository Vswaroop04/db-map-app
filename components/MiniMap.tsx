import MapView, { Marker } from 'react-native-maps';

type Props = { latitude: number; longitude: number };

export function MiniMap({ latitude, longitude }: Props) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}
