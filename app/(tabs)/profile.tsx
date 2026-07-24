import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconBadge, ListRow, Screen } from '@/components/ui';
import { confirmDestructive } from '@/lib/confirm';
import { seedDemoData } from '@/lib/devSeed';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, radii, spacing, type } from '@/theme';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export default function ProfileScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const resetAll = useAppStore((s) => s.resetAll);

  const name = settings.name.trim();
  const initials = name
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toLocaleUpperCase('tr'))
        .join('')
    : '?';

  const reminderLabel = settings.reminderEnabled
    ? `Her gün ${pad2(settings.reminderHour)}:${pad2(settings.reminderMinute)}`
    : 'Kapalı';

  const onReset = () =>
    confirmDestructive(
      'Verileri Sıfırla',
      'Tüm seanslar, seriler, rozetler ve ayarlar silinecek. Bu işlem geri alınamaz.',
      'Sıfırla',
      resetAll
    );

  return (
    <Screen>
      <Text style={[type.h2, styles.title]}>Profil</Text>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.caption}>Merhaba,</Text>
          <Text style={type.h2}>{name || 'Misafir'}</Text>
        </View>
        <Pressable onPress={() => router.push('/settings/edit-name')} hitSlop={8}>
          <Text style={styles.edit}>Düzenle</Text>
        </Pressable>
      </View>

      <Text style={[type.captionMedium, styles.sectionLabel]}>Ayarlar</Text>
      <View style={{ gap: spacing(2.5) }}>
        <ListRow
          title="Hatırlatıcı"
          left={<IconBadge icon="alarm-outline" color={colors.primary} shape="circle" size={40} />}
          right={<Text style={type.caption}>{reminderLabel}</Text>}
          onPress={() => router.push('/settings/reminder')}
        />
        <ListRow
          title="Ses & Müzik"
          left={<IconBadge icon="musical-notes-outline" color={colors.violet} shape="circle" size={40} />}
          onPress={() => router.push('/sounds')}
        />
        <ListRow
          title="Bildirimler"
          left={<IconBadge icon="notifications-outline" color={colors.sky} shape="circle" size={40} />}
          onPress={() => router.push('/settings/reminder')}
        />
        <ListRow
          title="Sağlık Uygulamaları"
          left={<IconBadge icon="heart-outline" color={colors.teal} shape="circle" size={40} />}
          right={
            <View style={styles.soonChip}>
              <Text style={styles.soonText}>Yakında</Text>
            </View>
          }
          chevron={false}
        />
        <ListRow
          title="Hälsa Hakkında"
          left={<IconBadge icon="information-circle-outline" color={colors.amber} shape="circle" size={40} />}
          onPress={() => router.push('/settings/about')}
        />
        <ListRow
          title="Yardım & Destek"
          left={<IconBadge icon="help-buoy-outline" color={colors.green} shape="circle" size={40} />}
          onPress={() => router.push('/settings/help')}
        />
        <ListRow
          title="Verileri Sıfırla"
          left={<IconBadge icon="trash-outline" color={colors.coral} shape="circle" size={40} />}
          onPress={onReset}
          chevron={false}
        />
        {__DEV__ ? (
          <ListRow
            title="Demo verisi yükle (DEV)"
            subtitle="Grafikler ve rozetler için 5 haftalık örnek veri"
            left={<IconBadge icon="flask-outline" color={colors.violet} shape="circle" size={40} />}
            onPress={seedDemoData}
            chevron={false}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing(5),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    marginBottom: spacing(6),
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(139,149,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.primary,
  },
  edit: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  sectionLabel: {
    marginBottom: spacing(3),
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  soonChip: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(90,214,190,0.14)',
  },
  soonText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.teal,
  },
});
