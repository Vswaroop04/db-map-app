import { useRef } from 'react';
import { Animated, FlatList, PanResponder, Text, useWindowDimensions, View } from 'react-native';
import { type Place } from '../lib/store/useLocationStore';
import { PlaceListItem } from './PlaceListItem';

const PEEK_HEIGHT = 120;
const EXPANDED_RATIO = 0.6;

type Props = {
  places: Place[];
  activeId: string | null;
  userLat: number;
  userLng: number;
  onSelectPlace: (place: Place) => void;
};

export function BottomSheet({ places, activeId, userLat, userLng, onSelectPlace }: Props) {
  const { height } = useWindowDimensions();
  const expandedHeight = height * EXPANDED_RATIO;
  const maxTranslate = expandedHeight - PEEK_HEIGHT;

  const translateY = useRef(new Animated.Value(maxTranslate)).current;
  const lastY = useRef(maxTranslate);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        translateY.stopAnimation((v) => { lastY.current = v; });
      },
      onPanResponderMove: (_, g) => {
        const next = Math.min(maxTranslate, Math.max(0, lastY.current + g.dy));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const current = lastY.current + g.dy;
        const expand = g.vy < -0.5 || (Math.abs(g.vy) <= 0.5 && current < maxTranslate / 2);
        const target = expand ? 0 : maxTranslate;
        lastY.current = target;
        Animated.spring(translateY, { toValue: target, useNativeDriver: true, friction: 8 }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: expandedHeight,
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 0.5,
        borderTopColor: '#E5E7EB',
        transform: [{ translateY }],
        overflow: 'hidden',
      }}
    >
      <View {...panResponder.panHandlers} style={{ paddingBottom: 4 }}>
        <View
          style={{
            width: 36,
            height: 4,
            backgroundColor: '#D1D5DB',
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 10,
            marginBottom: 10,
          }}
        />
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
            Nearby places
          </Text>
          <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
            {places.length} found near you
          </Text>
        </View>
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceListItem
            place={item}
            isActive={item.id === activeId}
            userLat={userLat}
            userLng={userLng}
            onPress={onSelectPlace}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </Animated.View>
  );
}
