import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { type Place } from '../lib/types/place';
import { categoryEmoji, formatDistance, haversineMeters } from '../lib/utils/distance';

type Props = {
  place: Place;
  isActive: boolean;
  userLat: number;
  userLng: number;
  onPress: (place: Place) => void;
  onCalloutPress: (place: Place) => void;
};

export function MapPinMarker({ place, isActive, userLat, userLng, onPress, onCalloutPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  // render once then stop tracking — avoids continuous re-renders
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const meters = haversineMeters(userLat, userLng, place.latitude, place.longitude);
  const emoji = categoryEmoji(place.category);
  const size = isActive ? 42 : 32;

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
      onPress={() => onPress(place)}
    >
      {/* fixed outer size keeps anchor stable — only inner pin resizes */}
      <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderBottomRightRadius: 0,
            transform: [{ rotate: '45deg' }],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isActive ? '#2563EB' : '#1D4ED8',
            borderWidth: 2,
            borderColor: 'white',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Text style={{ transform: [{ rotate: '-45deg' }], fontSize: isActive ? 18 : 13 }}>
            {emoji}
          </Text>
        </View>
      </View>
      {isActive && (
        <Callout tooltip onPress={() => onCalloutPress(place)}>
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
              {formatDistance(meters)} away · tap for details
            </Text>
          </View>
        </Callout>
      )}
    </Marker>
  );
}
