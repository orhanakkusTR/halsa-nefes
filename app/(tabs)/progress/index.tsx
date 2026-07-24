import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BarChart } from '@/components/charts/BarChart';
import { Card, IconBadge, Screen, SegmentedTabs } from '@/components/ui';
import { badges } from '@/data/badges';
import { todayISO } from '@/lib/dates';
import {
  avgSessionMinutes,
  completedDaysInRange,
  deltaVsPrevious,
  minutesSeries,
  Range,
  successRate,
  totalMinutes,
} from '@/lib/stats';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, spacing, type } from '@/theme';

const RANGE_LABEL: Record<Range, string> = {
  week: 'Bu Hafta',
  month: 'Bu Ay',
  year: 'Bu Yıl',
};

export default function ProgressScreen() {
  const router = useRouter();
  const sessions = useAppStore((s) => s.sessions);
  const [range, setRange] = useState<Range>('month');
  const today = todayISO();

  const data = useMemo(() => {
    return {
      series: minutesSeries(sessions, range, today),
      total: totalMinutes(sessions, range, today),
      delta: deltaVsPrevious(sessions, range, today),
      days: completedDaysInRange(sessions, range, today),
      avg: avgSessionMinutes(sessions, range, today),
      success: successRate(sessions, range, today),
    };
  }, [sessions, range, today]);

  const unlockedIds = useMemo(
    () => new Set(badges.filter((b) => b.isUnlocked(sessions, today)).map((b) => b.id)),
    [sessions, today]
  );

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={{ width: 40 }} />
        <Text style={[type.h2, { flex: 1, textAlign: 'center' }]}>İlerleme</Text>
        <Pressable
          hitSlop={10}
          style={styles.headerBtn}
          onPress={() => router.push('/(tabs)/progress/stats')}
        >
          <Ionicons name="analytics-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
      <View style={{ gap: spacing(5) }}>
        <SegmentedTabs
          value={range}
          onChange={setRange}
          options={[
            { value: 'week', label: 'Haftalık' },
            { value: 'month', label: 'Aylık' },
            { value: 'year', label: 'Yıllık' },
          ]}
        />

        <Card>
          <Text style={type.caption}>{RANGE_LABEL[range]}</Text>
          <View style={styles.totalRow}>
            <Text style={type.bigStat}>{data.total}</Text>
            <Text style={[type.body, { color: colors.textSecondary }]}>dakika nefes</Text>
            {data.delta !== null ? (
              <View style={[styles.deltaChip, data.delta < 0 && styles.deltaDown]}>
                <Ionicons
                  name={data.delta >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={data.delta >= 0 ? colors.green : colors.coral}
                />
                <Text
                  style={[
                    styles.deltaText,
                    { color: data.delta >= 0 ? colors.green : colors.coral },
                  ]}
                >
                  %{Math.abs(data.delta)}
                </Text>
              </View>
            ) : null}
          </View>
          {sessions.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={30} color={colors.textMuted} />
              <Text style={[type.caption, { textAlign: 'center' }]}>
                Henüz seans yok. İlk nefes egzersizini{'\n'}tamamladığında grafiğin burada olacak.
              </Text>
            </View>
          ) : (
            <BarChart values={data.series.values} labels={data.series.labels} />
          )}
        </Card>

        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{data.days} Gün</Text>
            <Text style={styles.statLabel}>Rutin Tamamlama</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{data.avg} dk</Text>
            <Text style={styles.statLabel}>Ortalama Süre</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>%{data.success}</Text>
            <Text style={styles.statLabel}>Rutin Başarı</Text>
          </Card>
        </View>

        <View style={{ gap: spacing(3) }}>
          <View style={styles.badgeHeader}>
            <Text style={type.title}>Rozetler</Text>
            <Pressable hitSlop={8} onPress={() => router.push('/badges')}>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </Pressable>
          </View>
          <View style={styles.badgeRow}>
            {badges.map((b) => {
              const unlocked = unlockedIds.has(b.id);
              return (
                <View key={b.id} style={[styles.badgeItem, !unlocked && { opacity: 0.35 }]}>
                  <IconBadge icon={b.icon} color={unlocked ? b.color : colors.textMuted} size={52} shape="circle" />
                  <Text style={styles.badgeTitle}>{b.title}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(5),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing(2),
    marginTop: spacing(1),
    marginBottom: spacing(3),
  },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderRadius: 999,
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
  },
  deltaDown: { backgroundColor: 'rgba(240,142,125,0.12)' },
  deltaText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  emptyChart: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(8),
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(2),
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'center',
    gap: spacing(2),
    width: 72,
  },
  badgeTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
