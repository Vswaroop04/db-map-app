import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MiniMap } from '../../components/MiniMap';
import { categoryEmoji } from '../../lib/utils/distance';
import { type Place } from '../../lib/types/place';

export default function DetailScreen() {
  const { place: placeJson } = useLocalSearchParams<{ place: string }>();
  const router = useRouter();
  const place: Place = JSON.parse(placeJson ?? '{}');
  const emoji = categoryEmoji(place.category);

  const openDirections = () => {
    const native = `maps://app?daddr=${place.latitude},${place.longitude}`;
    const web = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    Linking.canOpenURL(native).then((ok) => Linking.openURL(ok ? native : web));
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="h-52 bg-blue-50 items-center justify-center">
        <Text style={{ fontSize: 64 }}>{emoji}</Text>
      </View>

      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-4 bg-white rounded-full w-9 h-9 items-center justify-center shadow"
        style={{ elevation: 3 }}
      >
        <Text className="text-gray-700 text-base">←</Text>
      </Pressable>

      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900">{place.name}</Text>
        {place.category && (
          <View className="bg-blue-100 self-start px-3 py-1 rounded-full mt-2">
            <Text className="text-blue-700 text-xs font-medium">{place.category}</Text>
          </View>
        )}

        <View className="h-px bg-gray-100 my-4" />

        {place.address && (
          <View className="flex-row gap-3 mb-3">
            <Text style={{ fontSize: 16 }}>📍</Text>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-0.5">Address</Text>
              <Text className="text-sm text-gray-700">
                {[place.address, place.city, place.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}

        <View className="h-px bg-gray-100 my-4" />

        <Text className="text-sm font-semibold text-gray-700 mb-3">Location</Text>
        <View className="rounded-xl overflow-hidden" style={{ height: 180 }}>
          <MiniMap latitude={place.latitude} longitude={place.longitude} />
        </View>

        <Pressable
          onPress={openDirections}
          className="bg-blue-600 rounded-xl py-3 flex-row items-center justify-center gap-2 mt-4 mb-6"
        >
          <Text style={{ fontSize: 16 }}>🧭</Text>
          <Text className="text-white font-semibold text-sm">Get Directions</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
