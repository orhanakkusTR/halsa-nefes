import { AppState } from 'react-native';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { trackById } from '@/lib/tracks';
import { useAppStore } from '@/store/appStore';

// Module-level ambient player singleton — survives navigation. One track at a time.
let player: AudioPlayer | null = null;
let currentId: string | null = null;
let sleepTimerHandle: ReturnType<typeof setTimeout> | null = null;

let modeReady = false;
async function ensureAudioMode() {
  if (modeReady) return;
  modeReady = true;
  try {
    // Ekran kapansa / uygulama arka plana düşse de uyku müziği çalmaya
    // devam eder; müzik odağı diğer uygulamalardan devralınır.
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      interruptionModeAndroid: 'doNotMix',
    });
  } catch {
    // web / unsupported: ignore
  }
}

/**
 * Uyku zamanlayıcısı dolduysa müziği durdurur. Arka planda JS sayaçları
 * kısılabildiği için tek başına setTimeout'a güvenilmez; bu kontrol ayrıca
 * (1) çalma durumu güncellemelerinde ve (2) uygulama öne dönünce çalışır.
 */
function enforceSleepTimer(): boolean {
  const st = useAppStore.getState().sleepTimer;
  if (st && Date.now() >= st.endsAt) {
    stopAmbient();
    return true;
  }
  return false;
}

AppState.addEventListener('change', (state) => {
  if (state === 'active') enforceSleepTimer();
});

function syncStore(playing: boolean) {
  useAppStore.getState().setNowPlaying(currentId ? { soundId: currentId, playing } : undefined);
}

/** Remove the player instance only — the sleep timer survives track switches */
function teardownPlayer() {
  if (player) {
    // Android: remove() tek başına çalan native AudioTrack'i durdurmuyor
    // (iki ses üst üste biniyordu) — önce pause şart.
    try {
      player.pause();
    } catch {}
    try {
      player.remove();
    } catch {}
  }
  player = null;
  currentId = null;
}

/** Play any track (ambient sound or sleep music) through the shared singleton */
export async function playAmbient(soundId: string) {
  const track = trackById(soundId);
  if (!track) return;
  await ensureAudioMode();

  if (currentId === soundId && player) {
    player.play();
    syncStore(true);
    return;
  }

  try {
    currentId = soundId;
    if (player) {
      // Parça değişimi replace() ile: player asla yeniden yaratılmaz.
      // remove() + createAudioPlayer döngüsü Android'de eski sesi
      // durdurmayıp yenisini üstüne bindiriyordu.
      player.replace(track.file);
    } else {
      player = createAudioPlayer(track.file);
      // Mirror the player's real state into the store (web autoplay may defer/block)
      try {
        player.addListener('playbackStatusUpdate', (status: { playing?: boolean }) => {
          if (enforceSleepTimer()) return;
          if (currentId) syncStore(!!status.playing);
        });
      } catch {}
    }
    player.loop = useAppStore.getState().loopEnabled;
    player.volume = useAppStore.getState().settings.volume;
    player.play();
    // Only ambient sounds become the remembered breathing-session background;
    // sleep music must not leak into the session carousel.
    if (track.isAmbient) {
      useAppStore.getState().updateSettings({ lastSoundId: soundId });
    }
    syncStore(true);
  } catch {
    teardownPlayer();
  }
}

export function pauseAmbient() {
  if (player) {
    try {
      player.pause();
    } catch {}
    syncStore(false);
  }
}

export function resumeAmbient() {
  if (player) {
    try {
      player.play();
    } catch {}
    syncStore(true);
  }
}

/** Full stop: playback ends and the sleep timer is cleared */
export function stopAmbient() {
  teardownPlayer();
  clearSleepTimer();
  syncStore(false);
}

export function setAmbientVolume(volume: number) {
  if (player) {
    try {
      player.volume = volume;
    } catch {}
  }
}

export function setLoopEnabled(on: boolean) {
  useAppStore.getState().setLoopEnabled(on);
  if (player) {
    try {
      player.loop = on;
    } catch {}
  }
}

function clearSleepTimer() {
  if (sleepTimerHandle) {
    clearTimeout(sleepTimerHandle);
    sleepTimerHandle = null;
  }
  useAppStore.getState().setSleepTimerState(undefined);
}

/** Auto-stop playback after N minutes; null disables the timer */
export function setSleepTimer(minutes: number | null) {
  if (sleepTimerHandle) {
    clearTimeout(sleepTimerHandle);
    sleepTimerHandle = null;
  }
  if (minutes == null) {
    useAppStore.getState().setSleepTimerState(undefined);
    return;
  }
  const ms = minutes * 60_000;
  sleepTimerHandle = setTimeout(() => {
    sleepTimerHandle = null;
    stopAmbient();
  }, ms);
  useAppStore.getState().setSleepTimerState({ minutes, endsAt: Date.now() + ms });
}

export function ambientSoundId() {
  return currentId;
}
