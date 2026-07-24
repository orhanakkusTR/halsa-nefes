import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Card, Header, Screen } from '@/components/ui';
import { ReminderResult, syncReminder } from '@/lib/notifications';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, radii, spacing, type } from '@/theme';

const pad2 = (n: number) => String(n).padStart(2, '0');

function Stepper({
  label,
  value,
  onChange,
  step,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  max: number;
}) {
  const change = (dir: 1 | -1) => onChange((value + dir * step + max) % max);
  return (
    <View style={styles.stepperRow}>
      <Text style={type.body}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => change(-1)} hitSlop={8} style={styles.stepBtn}>
          <Ionicons name="remove" size={20} color={colors.primary} />
        </Pressable>
        <Text style={styles.stepValue}>{pad2(value)}</Text>
        <Pressable onPress={() => change(1)} hitSlop={8} style={styles.stepBtn}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ReminderScreen() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [status, setStatus] = useState<ReminderResult | null>(null);

  // Re-sync the scheduled notification whenever reminder settings change
  useEffect(() => {
    let cancelled = false;
    syncReminder(settings).then((r) => {
      if (!cancelled) setStatus(r);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.reminderEnabled, settings.reminderHour, settings.reminderMinute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen header={<Header title="Hatırlatıcı" leftIcon="back" safeTop={false} />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={{ gap: spacing(4) }}>
        <Card style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Günlük Hatırlatıcı</Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              Her akşam nefes rutinin için nazik bir hatırlatma.
            </Text>
          </View>
          <Switch
            value={settings.reminderEnabled}
            onValueChange={(v) => updateSettings({ reminderEnabled: v })}
            trackColor={{ false: colors.surfaceRaised, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </Card>

        {settings.reminderEnabled ? (
          <Card style={{ gap: spacing(4) }}>
            <View style={styles.timePreview}>
              <Ionicons name="alarm-outline" size={22} color={colors.primary} />
              <Text style={styles.timeText}>
                Her gün {pad2(settings.reminderHour)}:{pad2(settings.reminderMinute)}
              </Text>
            </View>
            <Stepper
              label="Saat"
              value={settings.reminderHour}
              onChange={(v) => updateSettings({ reminderHour: v })}
              step={1}
              max={24}
            />
            <Stepper
              label="Dakika"
              value={settings.reminderMinute}
              onChange={(v) => updateSettings({ reminderMinute: v })}
              step={5}
              max={60}
            />
          </Card>
        ) : null}

        {status === 'denied' ? (
          <Card style={styles.warnCard}>
            <Ionicons name="alert-circle" size={20} color={colors.coral} />
            <Text style={[type.caption, { flex: 1, color: colors.text }]}>
              Bildirim izni verilmedi. Hatırlatıcının çalışması için telefon ayarlarından
              Hälsa Breathe bildirimlerine izin ver.
            </Text>
          </Card>
        ) : null}
        {status === 'unsupported' ? (
          <Text style={[type.caption, { textAlign: 'center' }]}>
            Web önizlemede bildirim desteklenmez; ayarların telefonda geçerli olacak.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  timeText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    minWidth: 36,
    textAlign: 'center',
  },
  warnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: 'rgba(240,142,125,0.10)',
    borderRadius: radii.md,
  },
});
