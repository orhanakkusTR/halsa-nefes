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
import { colors, radii, spacing, type } from '@/theme';

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
      <View style={styles.titleRow}>
        <Text style={[type.h2, styles.titleText]}>İlerleme</Text>
        <Pressable
          hitSlop={spacing(2)}
          style={styles.titleAction}
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
                    type.labelStrong,
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
            <Text style={type.statValue}>{data.days} Gün</Text>
            <Text style={[type.micro, styles.statLabel]}>Rutin Tamamlama</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={type.statValue}>{data.avg} dk</Text>
            <Text style={[type.micro, styles.statLabel]}>Ortalama Süre</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={type.statValue}>%{data.success}</Text>
            <Text style={[type.micro, styles.statLabel]}>Rutin Başarı</Text>
          </Card>
        </View>

        <View style={{ gap: spacing(3) }}>
          <View style={styles.badgeHeader}>
            <Text style={type.title}>Rozetler</Text>
            <Pressable hitSlop={spacing(2)} onPress={() => router.push('/badges')}>
              <Text style={[type.label, styles.seeAll]}>Tümünü Gör</Text>
            </Pressable>
          </View>
          <View style={styles.badgeRow}>
            {badges.map((b) => {
              const unlocked = unlockedIds.has(b.id);
              return (
                <View key={b.id} style={[styles.badgeItem, !unlocked && { opacity: 0.35 }]}>
                  <IconBadge icon={b.icon} color={unlocked ? b.color : colors.textMuted} size={52} shape="circle" />
                  <Text style={[type.micro, styles.badgeTitle]}>{b.title}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(5),
  },
  titleText: {
    flex: 1,
  },
  titleAction: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
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
    gap: spacing(0.5),
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.75),
  },
  deltaDown: { backgroundColor: 'rgba(240,142,125,0.12)' },
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
    gap: spacing(0.75),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(2),
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'center',
    gap: spacing(2),
    width: spacing(18),
  },
  badgeTitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
