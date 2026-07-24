import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Card, Header, IconBadge, Screen } from '@/components/ui';
import { badges } from '@/data/badges';
import { todayISO } from '@/lib/dates';
import { useAppStore } from '@/store/appStore';
import { colors, spacing, type } from '@/theme';

export default function BadgesScreen() {
  const sessions = useAppStore((s) => s.sessions);
  const today = todayISO();
  const unlockedIds = useMemo(
    () => new Set(badges.filter((b) => b.isUnlocked(sessions, today)).map((b) => b.id)),
    [sessions, today]
  );

  return (
    <Screen header={<Header title="Rozetler" leftIcon="back" variant="large" />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <Text style={[type.caption, { marginBottom: spacing(5) }]}>
        Düzenli pratikle rozetleri aç.
      </Text>
      <View style={styles.grid}>
        {badges.map((b) => {
          const unlocked = unlockedIds.has(b.id);
          return (
            <Card key={b.id} style={styles.cell}>
              <View style={!unlocked && { opacity: 0.35 }}>
                <IconBadge
                  icon={b.icon}
                  color={unlocked ? b.color : colors.textMuted}
                  size={64}
                  shape="circle"
                />
              </View>
              <Text style={[type.title, !unlocked && { color: colors.textSecondary }]}>
                {b.title}
              </Text>
              <Text style={[type.caption, { textAlign: 'center' }]}>{b.subtitle}</Text>
              {unlocked ? (
                <View style={styles.stateChip}>
                  <Ionicons name="checkmark" size={12} color={colors.teal} />
                  <Text style={[type.micro, { color: colors.teal }]}>Açıldı</Text>
                </View>
              ) : (
                <View style={styles.stateChip}>
                  <Ionicons name="lock-closed" size={11} color={colors.textMuted} />
                  <Text style={type.micro}>Kilitli</Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  cell: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing(2),
    paddingVertical: spacing(5),
  },
  stateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(1),
  },
});
