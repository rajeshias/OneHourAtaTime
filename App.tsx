import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <SafeAreaView style={styles.container}>
          <MainScreen />
          <StatusBar barStyle="light-content" />
        </SafeAreaView>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
