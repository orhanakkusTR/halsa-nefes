import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Settings } from './model';

export type ReminderResult = 'scheduled' | 'disabled' | 'denied' | 'unsupported';

const REMINDER_ID = 'daily-reminder';
const CHANNEL_ID = 'reminders';

export async function initNotifications() {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Hatırlatıcılar',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch {
    // notifications must never crash the app
  }
}

/** Single entry point: call whenever reminder settings change */
export async function syncReminder(settings: Settings): Promise<ReminderResult> {
  if (Platform.OS === 'web') return 'unsupported';
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
    if (!settings.reminderEnabled) return 'disabled';

    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      perm = await Notifications.requestPermissionsAsync();
    }
    if (!perm.granted) return 'denied';

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'Nefes zamanı 🌙',
        body: 'Bu geceki rutinin seni bekliyor. Rahatla, nefes al, bırak.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.reminderHour,
        minute: settings.reminderMinute,
        channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
      },
    });
    return 'scheduled';
  } catch {
    return 'unsupported';
  }
}
