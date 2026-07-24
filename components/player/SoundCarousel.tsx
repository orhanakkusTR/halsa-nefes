import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sounds } from '@/data/sounds';
import { playAmbient, stopAmbient } from '@/lib/audio';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, spacing } from '@/theme';

const ITEM_W = 64;
const GAP = spacing(3);
const STEP = ITEM_W + GAP;

interface Item {
  id: string | null;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  tile?: [string, string];
}

/** Swipe left/right to pick the ambient sound without leaving the session */
export function SoundCarousel() {
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled);
  const lastSoundId = useAppStore((s) => s.settings.lastSoundId);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const items = useMemo<Item[]>(
    () => [
      { id: null, title: 'Sessiz', icon: 'volume-mute' },
      ...sounds.map((s) => ({ id: s.id, title: s.title, icon: s.icon, tile: s.tile })),
    ],
    []
  );

  const selectedIndex = useMemo(() => {
    if (!soundEnabled || !lastSoundId) return 0;
    const i = items.findIndex((it) => it.id === lastSoundId);
    return i < 0 ? 0 : i;
  }, [items, soundEnabled, lastSoundId]);

  const scrollRef = useRef<ScrollView>(null);
  const draggingRef = useRef(false);
  const [width, setWidth] = useState(0);
  const sidePad = Math.max(0, (width - ITEM_W) / 2);

  // Center the current selection once layout is known
  useEffect(() => {
    if (width === 0) return;
    const t = setTimeout(
      () => scrollRef.current?.scrollTo({ x: selectedIndex * STEP, animated: false }),
      30
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const select = (idx: number) => {
    const item = items[Math.max(0, Math.min(items.length - 1, idx))];
    if (item.id === null) {
      stopAmbient();
      updateSettings({ soundEnabled: false });
    } else {
      updateSettings({ soundEnabled: true });
      playAmbient(item.id);
    }
  };

  // Only user gestures may change the selection — programmatic scrolls
  // (initial centering) must never re-trigger a sound switch.
  const onSnap = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const idx = Math.round(e.nativeEvent.contentOffset.x / STEP);
    if (idx !== selectedIndex) select(idx);
  };

  const tapItem = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * STEP, animated: true });
    select(idx);
  };

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={STEP}
          decelerationRate="fast"
          onScrollBeginDrag={() => {
            draggingRef.current = true;
          }}
          onMomentumScrollEnd={onSnap}
          onScrollEndDrag={onSnap}
          contentContainerStyle={{ paddingHorizontal: sidePad, gap: GAP }}
        >
          {items.map((item, idx) => {
            const active = idx === selectedIndex;
            return (
              <Pressable key={item.id ?? 'sessiz'} onPress={() => tapItem(idx)} style={styles.item}>
                <View style={[styles.circle, active && styles.circleActive]}>
                  {item.tile ? (
                    <LinearGradient colors={item.tile} style={StyleSheet.absoluteFill} />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, styles.muteFill]} />
                  )}
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={active ? '#FFFFFF' : 'rgba(255,255,255,0.75)'}
                  />
                </View>
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  item: {
    width: ITEM_W,
    alignItems: 'center',
    gap: spacing(1.5),
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.72,
  },
  circleActive: {
    borderColor: colors.primary,
    opacity: 1,
  },
  muteFill: {
    backgroundColor: colors.surfaceRaised,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    maxWidth: ITEM_W + 6,
  },
  labelActive: {
    fontFamily: fonts.medium,
    color: colors.text,
  },
});
