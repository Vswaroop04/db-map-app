import { Pressable, Text, View } from 'react-native';
import { type Place } from '../lib/store/useLocationStore';
import { categoryEmoji, formatDistance, haversineMeters } from '../lib/utils/distance';

type Props = {
  place: Place;
  isActive: boolean;
  userLat: number;
  userLng: number;
  onPress: (place: Place) => void;
};

export function PlaceListItem({ place, isActive, userLat, userLng, onPress }: Props) {
  const meters = haversineMeters(userLat, userLng, place.latitude, place.longitude);
  const emoji = categoryEmoji(place.category);

  return (
    <Pressable
      onPress={() => onPress(place)}
      className={`flex-row items-center px-4 py-3 gap-3 border-b border-gray-100 ${isActive ? 'bg-blue-50' : 'bg-white'}`}
    >
      <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
          {place.city ?? place.address ?? place.category ?? ''}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-xs text-gray-400">{formatDistance(meters)}</Text>
        {place.category && (
          <View className="bg-gray-100 rounded px-1.5 py-0.5 mt-1">
            <Text className="text-xs text-gray-500">{place.category}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
