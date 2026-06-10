import { FlatList, ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { PlaceListItem } from '../../components/PlaceListItem';
import { useLocationStore, type Place } from '../../lib/store/useLocationStore';

export default function ListScreen() {
  const router = useRouter();
  const { filteredPlaces, categories, selectedCategory, userLocation, setCategory } =
    useLocationStore();

  const userLat = userLocation?.latitude ?? 0;
  const userLng = userLocation?.longitude ?? 0;

  const handleSelect = (place: Place) => {
    router.push({
      pathname: '/location/[id]',
      params: { id: place.id, place: JSON.stringify(place) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' }}
      >
        <Pressable
          onPress={() => setCategory(null)}
          className={`px-4 py-1.5 rounded-full border ${
            selectedCategory === null
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              selectedCategory === null ? 'text-white' : 'text-gray-600'
            }`}
          >
            All
          </Text>
        </Pressable>

        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full border ${
              selectedCategory === cat
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === cat ? 'text-white' : 'text-gray-600'
              }`}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        style={{ flex: 1 }}
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceListItem
            place={item}
            isActive={false}
            userLat={userLat}
            userLng={userLng}
            onPress={handleSelect}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-sm">No places found near you yet.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
