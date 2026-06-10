import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { type Place } from '../lib/store/useLocationStore';
import { categoryEmoji, formatDistance, haversineMeters } from '../lib/utils/distance';

type Props = {
  place: Place;
  isActive: boolean;
  userLat: number;
  userLng: number;
  onPress: (place: Place) => void;
};

export function MapPinMarker({ place, isActive, userLat, userLng, onPress }: Props) {
  const scale = useRef(new Animated.Value(isActive ? 1.3 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.3 : 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [isActive]);

  const meters = haversineMeters(userLat, userLng, place.latitude, place.longitude);
  const emoji = categoryEmoji(place.category);

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={isActive}
      onPress={() => onPress(place)}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderBottomRightRadius: 0,
            transform: [{ rotate: '45deg' }],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isActive ? '#2563EB' : '#1D4ED8',
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text style={{ transform: [{ rotate: '-45deg' }], fontSize: 14 }}>{emoji}</Text>
        </View>
      </Animated.View>
      {isActive && (
        <Callout tooltip onPress={() => onPress(place)}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              minWidth: 120,
              borderWidth: 0.5,
              borderColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#111827' }} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
              {formatDistance(meters)} away
            </Text>
          </View>
        </Callout>
      )}
    </Marker>
  );
}
