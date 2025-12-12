import notifee, { AuthorizationStatus, RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';

// Create notification channel for Android
async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'one-hour-at-a-time-channel',
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
          channelId: 'one-hour-at-a-time-channel',
          smallIcon: 'ic_launcher',
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

    // Schedule notifications for activity switches
    const hours = Object.keys(schedule).map(Number).sort((a, b) => a - b);

    for (let i = 0; i < hours.length; i++) {
      const currentHour = hours[i];
      const currentActivity = schedule[currentHour];
      const nextActivity = i < hours.length - 1 ? schedule[hours[i + 1]] : null;

      // Schedule notification when activity changes
      if (nextActivity && currentActivity !== nextActivity) {
        await this.scheduleActivityNotification(nextActivity, hours[i + 1]);
      }
    }
  },
};
