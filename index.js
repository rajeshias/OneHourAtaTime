import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Handle background notification events (e.g., user taps a notification while app is killed)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    // Notification was pressed — app will open to MainScreen automatically
    // Remove the delivered notification
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
