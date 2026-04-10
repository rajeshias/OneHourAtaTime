import notifee, { AuthorizationStatus, RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { ReminderSettings } from '../types';

const CHANNEL_ID = 'one-hour-at-a-time-channel';
const MORNING_REMINDER_ID = 'daily-morning-reminder';
const EVENING_REMINDER_ID = 'daily-evening-reminder';

// Create notification channel for Android
async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'One Hour at a Time',
      description: 'Notifications for hourly activity reminders',
      sound: 'default',
      importance: 4,
      vibration: true,
    });
  }
}

// Initialize notification channel
createNotificationChannel();

export const notificationUtils = {
  async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  },

  async scheduleActivityNotification(activityName: string, hour: number): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel existing notifications for this hour
    await this.cancelNotificationsForHour(hour);

    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hour, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notificationTime.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: `activity-${hour}`,
        title: 'Activity Reminder',
        body: `Time to start: ${activityName}`,
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
        data: {
          hour: hour.toString(),
          activityName,
        },
      },
      trigger
    );
  },

  async cancelNotificationsForHour(hour: number): Promise<void> {
    const notificationId = `activity-${hour}`;
    await notifee.cancelNotification(notificationId);
  },

  async scheduleAllNotifications(schedule: { [hour: number]: string }): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel all existing notifications
    await notifee.cancelAllNotifications();

    // Schedule notifications only when the activity changes from the previous hour
    const hours = Object.keys(schedule).map(Number).sort((a, b) => a - b);

    for (let i = 0; i < hours.length; i++) {
      const currentHour = hours[i];
      const currentActivity = schedule[currentHour];
      const prevActivity = i > 0 ? schedule[hours[i - 1]] : null;

      // Only notify if this activity is different from what was scheduled the previous hour
      if (currentActivity !== prevActivity) {
        await this.scheduleActivityNotification(currentActivity, currentHour);
      }
    }
  },

  // --- Daily Reminder Notifications ---

  async scheduleDailyReminders(settings: ReminderSettings): Promise<void> {
    // Always cancel existing reminders first
    await this.cancelDailyReminders();

    if (!settings.enabled) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Schedule morning planning reminder
    await this._scheduleRepeatingReminder(
      MORNING_REMINDER_ID,
      settings.morningHour,
      'Plan Your Day',
      "Your schedule is looking empty today. Take a minute to plan your hours!"
    );

    // Schedule evening review reminder
    if (settings.eveningEnabled) {
      await this._scheduleRepeatingReminder(
        EVENING_REMINDER_ID,
        settings.eveningHour,
        'Review Tomorrow',
        "How was your day? Take a moment to plan tomorrow's schedule."
      );
    }
  },

  async _scheduleRepeatingReminder(
    id: string,
    hour: number,
    title: string,
    body: string
  ): Promise<void> {
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hour, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notificationTime.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id,
        title,
        body,
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
        data: {
          type: 'daily-reminder',
        },
      },
      trigger
    );
  },

  async cancelDailyReminders(): Promise<void> {
    await notifee.cancelNotification(MORNING_REMINDER_ID);
    await notifee.cancelNotification(EVENING_REMINDER_ID);
  },
};
