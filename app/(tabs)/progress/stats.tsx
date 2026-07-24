import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from '@/components/charts/LineChart';
import { Card, Header, IconBadge, Screen } from '@/components/ui';
import { formatMinutes, todayISO } from '@/lib/dates';
import {
  completedDaysInRange,
  currentStreak,
  habitSeries,
  longestStreak,
  totalCompletedSessions,
  totalMinutes,
} from '@/lib/stats';
import { useAppStore } from '@/store/appStore';
import { colors, spacing, type } from '@/theme';

export default function StatsScreen() {
  const sessions = useAppStore((s) => s.sessions);
  const today = todayISO();

  const data = useMemo(
    () => ({
      monthMinutes: totalMinutes(sessions, 'month', today),
      monthDays: completedDaysInRange(sessions, 'month', today),
      habit: habitSeries(sessions, today, 5),
      bestStreak: Math.max(longestStreak(sessions), currentStreak(sessions, today)),
      totalSessions: totalCompletedSessions(sessions),
    }),
    [sessions, today]
  );

  const habitImproving =
    data.habit.length >= 2 && data.habit[data.habit.length - 1].pct >= data.habit[0].pct;

  return (
    <Screen header={<Header title="İstatistikler" variant="large" />}>
      <View style={{ gap: spacing(4) }}>
        <View style={styles.row}>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={type.caption}>Toplam Nefes Süresi</Text>
              <IconBadge icon="time-outline" color={colors.primary} size={34} shape="circle" />
            </View>
            <Text style={type.statValue}>{formatMinutes(data.monthMinutes)}</Text>
            <Text style={type.caption}>(Bu Ay)</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={type.caption}>Tamamlanan Rutinler</Text>
              <IconBadge icon="calendar-outline" color={colors.sky} size={34} shape="circle" />
            </View>
            <Text style={type.statValue}>{data.monthDays} gün</Text>
            <Text style={type.caption}>(Bu Ay)</Text>
          </Card>
        </View>

        <Card>
          <Text style={type.title}>Nefes Alışkanlığın</Text>
          <Text style={[type.caption, { marginTop: 4, marginBottom: spacing(3) }]}>
            {sessions.length === 0
              ? 'İlk seanslarını tamamladığında alışkanlık eğrin burada görünecek.'
              : habitImproving
                ? 'Harikasın! Düzenli nefes pratiğin uykunu iyileştiriyor.'
                : 'Ritmini korumaya çalış — küçük adımlar da sayılır.'}
          </Text>
          <LineChart points={data.habit} />
        </Card>

        <View style={styles.row}>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={type.caption}>En Uzun Seri</Text>
              <Ionicons name="flame" size={22} color={colors.gold} />
            </View>
            <Text style={type.statValue}>{data.bestStreak} gün</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={type.caption}>Toplam Rutin</Text>
              <Ionicons name="leaf" size={22} color={colors.teal} />
            </View>
            <Text style={type.statValue}>{data.totalSessions}</Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  statCard: {
    flex: 1,
    gap: spacing(1.5),
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(2),
    marginBottom: spacing(1),
  },
});
