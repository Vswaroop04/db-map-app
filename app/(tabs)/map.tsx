import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { BottomSheet } from '../../components/BottomSheet';
import { MapPinMarker } from '../../components/MapPinMarker';
import { useLocationStore, type Place } from '../../lib/store/useLocationStore';

export default function MapScreen() {
  const router = useRouter();
  const { filteredPlaces, userLocation, activeId, loading, error, fetchNearby, setActiveId } =
    useLocationStore();

  useEffect(() => {
    fetchNearby();
  }, []);

  const handlePinPress = (place: Place) => {
    setActiveId(place.id);
  };

  const handleSelectPlace = (place: Place) => {
    router.push({
      pathname: '/location/[id]',
      params: { id: place.id, place: JSON.stringify(place) },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 text-sm">Finding nearby places...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-red-500 text-center text-sm">{error}</Text>
      </View>
    );
  }

  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {filteredPlaces.map((place) => (
          <MapPinMarker
            key={place.id}
            place={place}
            isActive={place.id === activeId}
            userLat={userLocation?.latitude ?? region.latitude}
            userLng={userLocation?.longitude ?? region.longitude}
            onPress={handlePinPress}
          />
        ))}
      </MapView>

      {userLocation && (
        <BottomSheet
          places={filteredPlaces}
          activeId={activeId}
          userLat={userLocation.latitude}
          userLng={userLocation.longitude}
          onSelectPlace={handleSelectPlace}
        />
      )}
    </View>
  );
}
