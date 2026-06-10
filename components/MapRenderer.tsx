import MapView from 'react-native-maps';
import { MapPinMarker } from './MapPinMarker';
import { type Place } from '../lib/types/place';

type Props = {
  places: Place[];
  activeId: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  onPinPress: (place: Place) => void;
  onCalloutPress: (place: Place) => void;
};

export function MapRenderer({ places, activeId, userLocation, onPinPress, onCalloutPress }: Props) {
  const region = userLocation
    ? { ...userLocation, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : { latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  const userLat = userLocation?.latitude ?? region.latitude;
  const userLng = userLocation?.longitude ?? region.longitude;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
    >
      {places.map((place) => (
        <MapPinMarker
          key={place.id}
          place={place}
          isActive={place.id === activeId}
          userLat={userLat}
          userLng={userLng}
          onPress={onPinPress}
          onCalloutPress={onCalloutPress}
        />
      ))}
    </MapView>
  );
}
