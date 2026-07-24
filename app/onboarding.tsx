import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HalsaLogo } from '@/components/HalsaLogo';
import { Button } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

// İlk açılış tanıtımı: video karşılama + 2 görsel sayfa + isimle profil.
const WELCOME_VIDEO = require('@/assets/video/karsilama.mp4');

const INTRO_PAGES = [
  {
    video: true,
    image: null,
    title: "Hälsa Breathe'e hoş geldin",
    body: 'Uyumadan önce nefes al, zihnini yavaşlat, güne dinlenmiş uyan.',
    brand: 'none',
  },
  {
    video: false,
    image: require('@/assets/images/home-hero.jpg'),
    title: 'Uyumadan önce nefes al',
    body: 'Rehberli nefes egzersizleri ve uyku müzikleriyle bedenini uykuya hazırla.',
    brand: 'inline',
  },
  {
    video: false,
    image: require('@/assets/images/onboarding-geyik.jpg'),
    title: 'Yolculuğunu takip et',
    body: '30 günlük uyku yolculuğu, seriler ve rozetlerle ilerlemeni gör.',
    // Logo görselin ortasının biraz üstünde konumlanır
    brand: 'float',
  },
] as const;

const NAME_PAGE_INDEX = INTRO_PAGES.length;
const PAGE_COUNT = INTRO_PAGES.length + 1;
const LOGO_WIDTH = 148;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const savedName = useAppStore((s) => s.settings.name);

  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [name, setName] = useState(savedName);

  // Karşılama videosu: sessiz, döngülü, otomatik başlar
  const welcomePlayer = useVideoPlayer(WELCOME_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Yalnızca 1. sayfadayken oynat. Web'de OYNAYAN video, tarayıcının
  // scroll-snap'ini sürekli 1. sayfaya geri çektiği için (ölçülen davranış)
  // sayfadan çıkınca DOM video elementi de doğrudan duraklatılır —
  // player API'sinin duraklatması bu yarışa yetişemiyordu.
  useEffect(() => {
    const domVideos = () =>
      Platform.OS === 'web' && typeof document !== 'undefined'
        ? Array.from(document.querySelectorAll('video'))
        : [];
    if (page === 0) {
      welcomePlayer.play();
      domVideos().forEach((v) => {
        const p = v.play();
        if (p) p.catch(() => {});
      });
    } else {
      welcomePlayer.pause();
      domVideos().forEach((v) => v.pause());
    }
  }, [page, welcomePlayer]);

  const goTo = (idx: number) => {
    // Web'de scroll-snap, animasyonlu programatik kaydırmayı geri alabiliyor —
    // orada anlık kaydır; native'de animasyon kalsın.
    scrollRef.current?.scrollTo({ x: idx * width, animated: Platform.OS !== 'web' });
    setPage(idx);
  };

  // Dot'lar kaydırmayla CANLI senkron: her scroll karesinde sayfa indeksi
  // güncellenir (yalnızca bırakma anını dinlemek web'de geç kalıyordu).
  const onScrollSync = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== page) setPage(Math.max(0, Math.min(PAGE_COUNT - 1, idx)));
  };

  const onNamePage = page === NAME_PAGE_INDEX;
  const canFinish = name.trim().length > 0;

  const finish = () => {
    if (!canFinish) return;
    completeOnboarding(name);
    router.replace('/');
  };

  const next = () => {
    if (onNamePage) finish();
    else goTo(page + 1);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScrollSync}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScrollSync}
        onScrollEndDrag={onScrollSync}
        style={styles.flex}
      >
        {INTRO_PAGES.map((p) => (
          <View key={p.title} style={[styles.page, { width }]}>
            {p.video ? (
              <VideoView
                player={welcomePlayer}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
              />
            ) : (
              <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
            )}
            <LinearGradient
              colors={['rgba(11,18,32,0.35)', 'rgba(11,18,32,0.10)', colors.bg]}
              locations={[0, 0.45, 0.9]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            {p.brand === 'float' ? (
              <View style={styles.brandFloat} pointerEvents="none">
                <HalsaLogo width={LOGO_WIDTH} />
                <Text style={[type.brandCaps, styles.breathe]}>BREATHE</Text>
              </View>
            ) : null}
            <View style={styles.pageBody}>
              {p.brand === 'inline' ? (
                <View style={styles.brand}>
                  <HalsaLogo width={LOGO_WIDTH} />
                  <Text style={[type.brandCaps, styles.breathe]}>BREATHE</Text>
                </View>
              ) : null}
              <View style={styles.textBlock}>
                <Text style={type.h2}>{p.title}</Text>
                <Text style={[type.body, styles.bodyText]}>{p.body}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Son adım: isimle yerel profil — isim yalnızca cihazda saklanır */}
        <View style={[styles.page, { width }]}>
          <LinearGradient
            colors={[colors.bgTop, colors.bg]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.pageBody, styles.nameBody]}>
            <View style={styles.textBlock}>
              <Text style={type.h2}>Seni tanıyalım</Text>
              <Text style={[type.body, styles.bodyText]}>
                İsmin yalnızca bu cihazda saklanır; seni selamlamak ve ilerlemeni
                kişiselleştirmek için kullanılır.
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Adın"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={finish}
            />
          </View>
        </View>
      </ScrollView>

      {!onNamePage ? (
        <Pressable
          onPress={() => goTo(NAME_PAGE_INDEX)}
          hitSlop={spacing(3)}
          style={[styles.skip, { top: insets.top + spacing(4) }]}
        >
          <Text style={[type.label, styles.skipText]}>Atla</Text>
        </Pressable>
      ) : null}

      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing(6) }]}>
        <View style={styles.dots}>
          {Array.from({ length: PAGE_COUNT }, (_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={onNamePage ? 'Başla' : 'Devam'}
          onPress={next}
          disabled={onNamePage && !canFinish}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  page: {
    flex: 1,
    // Web'de video elementi sayfadan taşıp scroll-snap'i bozabiliyor — kırp
    overflow: 'hidden',
  },
  pageBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(4),
    gap: spacing(6),
  },
  nameBody: {
    justifyContent: 'center',
    gap: spacing(5),
  },
  brand: {
    alignItems: 'center',
    gap: spacing(2),
  },
  // Logo, görselin ortasının biraz üstünde
  brandFloat: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '32%',
    alignItems: 'center',
    gap: spacing(2),
  },
  breathe: {
    marginTop: spacing(1),
  },
  textBlock: {
    gap: spacing(2),
  },
  bodyText: {
    color: colors.textSecondary,
  },
  input: {
    ...type.input,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  skip: {
    position: 'absolute',
    right: spacing(5),
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1),
  },
  skipText: {
    color: colors.textSecondary,
  },
  panel: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(3),
    gap: spacing(4),
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(2),
  },
  dot: {
    width: spacing(2),
    height: spacing(2),
    borderRadius: spacing(1),
    backgroundColor: 'rgba(139,149,246,0.25)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: spacing(5),
  },
});
