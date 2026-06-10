import { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheet } from '../../components/BottomSheet';
import { MapRenderer } from '../../components/MapRenderer';
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
    router.push({
      pathname: '/location/[id]',
      params: { id: place.id, place: JSON.stringify(place) },
    });
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

  return (
    <View className="flex-1">
      <MapRenderer
        places={filteredPlaces}
        activeId={activeId}
        userLocation={userLocation}
        onPinPress={handlePinPress}
      />

      {Platform.OS !== 'web' && userLocation && (
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
