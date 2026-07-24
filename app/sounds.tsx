import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Header, ListRow, Screen, SegmentedTabs } from '@/components/ui';
import { categoryLabel, soundById, soundCategories, sounds, SoundCategory } from '@/data/sounds';
import { pauseAmbient, playAmbient, resumeAmbient, stopAmbient } from '@/lib/audio';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

function SoundTile({ tile, icon }: { tile: [string, string]; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <LinearGradient colors={tile} style={styles.tile}>
      <Ionicons name={icon} size={22} color="rgba(255,255,255,0.9)" />
    </LinearGradient>
  );
}

export default function SoundsScreen() {
  const router = useRouter();
  const [cat, setCat] = useState<SoundCategory | 'all'>('all');
  const favorites = useAppStore((s) => s.favoriteSoundIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteSound);
  const nowPlaying = useAppStore((s) => s.nowPlaying);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const list = useMemo(
    () => (cat === 'all' ? sounds : sounds.filter((s) => s.category === cat)),
    [cat]
  );

  const activeSound = soundById(nowPlaying?.soundId);

  const selectSound = (id: string) => {
    updateSettings({ soundEnabled: true });
    playAmbient(id);
  };

  const silence = () => {
    stopAmbient();
    updateSettings({ soundEnabled: false });
  };

  return (
    <Screen header={<Header title="Sesler" leftIcon="back" safeTop={false} />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={{ gap: spacing(4) }}>
        <SegmentedTabs
          scrollable
          value={cat}
          onChange={setCat}
          options={soundCategories.map((c) => ({ value: c.value, label: c.label }))}
        />

        <ListRow
          title="Sessiz"
          subtitle="Arka plan sesini kapat"
          left={
            <View style={[styles.tile, { backgroundColor: colors.surfaceRaised }]}>
              <Ionicons name="volume-mute" size={22} color={colors.textSecondary} />
            </View>
          }
          onPress={silence}
          chevron={false}
          right={
            !nowPlaying?.soundId ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.teal} />
            ) : undefined
          }
        />

        <View style={{ gap: spacing(2.5) }}>
          {list.map((s) => {
            const fav = favorites.includes(s.id);
            const isActive = nowPlaying?.soundId === s.id;
            return (
              <ListRow
                key={s.id}
                title={s.title}
                subtitle={categoryLabel(s.category)}
                left={<SoundTile tile={s.tile} icon={s.icon} />}
                onPress={() => selectSound(s.id)}
                chevron={false}
                right={
                  <View style={styles.rowRight}>
                    {isActive && nowPlaying?.playing ? (
                      <Ionicons name="volume-high" size={18} color={colors.primary} />
                    ) : null}
                    <Pressable hitSlop={10} onPress={() => toggleFavorite(s.id)}>
                      <Ionicons
                        name={fav ? 'heart' : 'heart-outline'}
                        size={22}
                        color={fav ? colors.coral : colors.textMuted}
                      />
                    </Pressable>
                  </View>
                }
                style={isActive ? styles.activeRow : undefined}
              />
            );
          })}
        </View>
      </View>

      {activeSound ? (
        <Pressable
          style={styles.miniBar}
          onPress={() => {
            // Sounds is a modal — close it first so Now Playing opens inside the tabs
            if (router.canGoBack()) router.back();
            router.push('/(tabs)/(home)/now-playing');
          }}
        >
          <SoundTile tile={activeSound.tile} icon={activeSound.icon} />
          <View style={{ flex: 1 }}>
            <Text style={type.captionMedium}>Şimdi Çalıyor</Text>
            <Text style={type.title} numberOfLines={1}>
              {activeSound.title}
            </Text>
          </View>
          <Pressable
            hitSlop={10}
            onPress={() => (nowPlaying?.playing ? pauseAmbient() : resumeAmbient())}
          >
            <Ionicons
              name={nowPlaying?.playing ? 'pause-circle' : 'play-circle'}
              size={38}
              color={colors.primary}
            />
          </Pressable>
          <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 46,
    height: 46,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  activeRow: {
    borderColor: 'rgba(139,149,246,0.5)',
  },
  miniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginTop: spacing(5),
    padding: spacing(3),
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
