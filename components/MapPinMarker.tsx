import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Place } from '../lib/types/place';
import { categoryEmoji } from '../lib/utils/distance';

type Props = {
  place: Place;
  isActive: boolean;
  userLat: number;
  userLng: number;
  onPress: (place: Place) => void;
};

export function MapPinMarker({ place, isActive, userLat: _userLat, userLng: _userLng, onPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const emoji = categoryEmoji(place.category);
  const size = isActive ? 42 : 32;

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
      onPress={() => onPress(place)}
    >
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
    </Marker>
  );
}
