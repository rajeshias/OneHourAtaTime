import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { DailyColumn } from '../components/DailyColumn';
import { TodoColumn } from '../components/TodoColumn';
import { ActivityGroupScreen } from './ActivityGroupScreen';
import { SettingsScreen } from './SettingsScreen';
import { HabitsScreen } from './HabitsScreen';
import { SidebarMenu } from '../components/SidebarMenu';
import { OnboardingModal } from '../components/OnboardingModal';
import { DayOfWeek, HourBlock } from '../types';
import { notificationUtils } from '../utils/notifications';
import { storageUtils } from '../utils/storage';

const { width } = Dimensions.get('window');

type ViewMode = 'first' | 'second';

export const MainScreen: React.FC = () => {
  const {
    weekData,
    updateDayHours,
    updateTodos,
    activityGroups,
    loadWeekData,
    currentWeekOffset,
    selectedBlocks,
    setSelectedBlocks,
    sleepingHours,
  } = useAppContext();

  const [viewMode, setViewMode] = useState<ViewMode>('first');
  const [showActivityGroups, setShowActivityGroups] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHabits, setShowHabits] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [focusedColumn, setFocusedColumn] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasAutoScrolled = useRef(false);

  useEffect(() => {
    notificationUtils.requestPermissions();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await storageUtils.getOnboardingCompleted();
    if (!completed) {
      // Show onboarding after a brief delay for better UX
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  };

  useEffect(() => {
    // Auto-scroll to today's column on load (only once)
    if (weekData && currentWeekOffset === 0 && !hasAutoScrolled.current) {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // If Thursday (4), Friday (5), Saturday (6), or Sunday (0), scroll to second view
      if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: width, animated: false });
          setViewMode('second');
          hasAutoScrolled.current = true;
        }, 100);
      } else {
        hasAutoScrolled.current = true;
      }
    }
  }, [weekData, currentWeekOffset]);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageWidth = width;

    if (scrollX > pageWidth * 0.75 && viewMode === 'first') {
      setViewMode('second');
    } else if (scrollX < pageWidth * 0.25 && viewMode === 'second') {
      setViewMode('first');
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageWidth = width;

    if (scrollX > pageWidth * 0.5) {
      setViewMode('second');
      scrollViewRef.current?.scrollTo({ x: pageWidth, animated: true });
    } else {
      setViewMode('first');
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'next' ? currentWeekOffset + 1 : currentWeekOffset - 1;
    loadWeekData(newOffset);
    setViewMode('first');
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  };

  const navigateToToday = () => {
    if (currentWeekOffset === 0) {
      scrollToToday();
    } else {
      loadWeekData(0);
      setTimeout(scrollToToday, 100);
    }
  };

  const scrollToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Mon/Tue/Wed (1,2,3) -> first view
    // Thu/Fri/Sat/Sun (4,5,6,0) -> second view
    if (dayOfWeek >= 4 || dayOfWeek === 0) {
      scrollViewRef.current?.scrollTo({ x: width, animated: true });
      setViewMode('second');
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      setViewMode('first');
    }
  };

  const handleHourUpdate = (dayKey: string, hour: number, content: string) => {
    if (!weekData) return;

    const dayData = weekData.days[dayKey];
    const updatedHours = dayData.hours.map((h) =>
      h.hour === hour ? { ...h, content } : h
    );

    updateDayHours(dayKey, updatedHours);

    // Schedule notifications if content changed
    scheduleNotificationsForDay(dayKey, updatedHours);
  };

  const scheduleNotificationsForDay = (dayKey: string, hours: HourBlock[]) => {
    const schedule: { [hour: number]: string } = {};
    hours.forEach((h) => {
      if (h.content.trim()) {
        schedule[h.hour] = h.content.trim();
      }
    });
    notificationUtils.scheduleAllNotifications(schedule);
  };

  const handleHourLongPress = (dayKey: string, hour: number) => {
    setSelectionMode(true);
    setSelectedBlocks({ dayKey, hours: [hour] });
  };

  const handleHourPress = (dayKey: string, hour: number) => {
    if (!selectionMode || !selectedBlocks || selectedBlocks.dayKey !== dayKey) {
      return;
    }

    const hours = selectedBlocks.hours;
    if (hours.includes(hour)) {
      const updated = hours.filter((h) => h !== hour);
      if (updated.length === 0) {
        setSelectionMode(false);
        setSelectedBlocks(null);
      } else {
        setSelectedBlocks({ dayKey, hours: updated });
      }
    } else {
      setSelectedBlocks({ dayKey, hours: [...hours, hour] });
    }
  };

  const clearSelectedBlocks = () => {
    if (!selectedBlocks || !weekData) return;

    const { dayKey, hours } = selectedBlocks;
    const dayData = weekData.days[dayKey];
    const updatedHours = dayData.hours.map((h) =>
      hours.includes(h.hour) ? { ...h, content: '' } : h
    );

    updateDayHours(dayKey, updatedHours);
    setSelectedBlocks(null);
    setSelectionMode(false);
  };

  const populateSelectedBlocks = () => {
    if (!selectedBlocks || !weekData || activityGroups.length === 0) {
      Alert.alert('No Groups', 'Please create activity groups first.');
      return;
    }

    const groupNames = activityGroups.map((g) => g.name);
    Alert.alert(
      'Select Group',
      'Choose a group to populate activities from:',
      groupNames.map((name) => ({
        text: name,
        onPress: () => performPopulate(name),
      })).concat({ text: 'Cancel', style: 'cancel' })
    );
  };

  const performPopulate = (groupName: string) => {
    if (!selectedBlocks || !weekData) return;

    const group = activityGroups.find((g) => g.name === groupName);
    if (!group || group.activities.length === 0) {
      Alert.alert('Empty Group', 'This group has no activities.');
      return;
    }

    const { dayKey, hours } = selectedBlocks;
    const sortedHours = [...hours].sort((a, b) => a - b);
    const dayData = weekData.days[dayKey];

    const updatedHours = dayData.hours.map((h) => {
      if (sortedHours.includes(h.hour)) {
        const randomActivity =
          group.activities[Math.floor(Math.random() * group.activities.length)];
        return { ...h, content: randomActivity };
      }
      return h;
    });

    updateDayHours(dayKey, updatedHours);
    setSelectedBlocks(null);
    setSelectionMode(false);

    // Schedule notifications
    scheduleNotificationsForDay(dayKey, updatedHours);
  };

  const cancelSelection = () => {
    setSelectedBlocks(null);
    setSelectionMode(false);
  };

  const handleOnboardingSetupSleep = async () => {
    setShowOnboarding(false);
    await storageUtils.setOnboardingCompleted(true);
    // Small delay before opening settings for smooth transition
    setTimeout(() => {
      setShowSettings(true);
    }, 300);
  };

  const handleOnboardingClose = async () => {
    setShowOnboarding(false);
    await storageUtils.setOnboardingCompleted(true);
  };

  if (!weekData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const firstViewDays: DayOfWeek[] = ['Mon', 'Tue', 'Wed'];
  const secondViewDays: DayOfWeek[] = ['Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate column widths based on focus
  const getColumnWidth = (columnId: string) => {
    if (columnId === 'Todo') {
      // Todo expands when focused
      if (focusedColumn === 'Todo') {
        return (width * 5) / 8;
      }
      return width / 4;
    }
    // Daily columns shrink when Todo is focused
    if (columnId === 'Mon' || columnId === 'Tue' || columnId === 'Wed') {
      if (focusedColumn === 'Todo') {
        return width / 8;
      }
      return width / 4;
    }
    // Thu-Sun always normal width
    return width / 4;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowSidebar(true)}
          style={styles.menuButton}
        >
          <Text style={styles.menuButtonText}>☰ Menu</Text>
        </TouchableOpacity>

        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
            <Text style={styles.navButtonText}>← Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={navigateToToday}
            style={[
              styles.todayButton,
              currentWeekOffset === 0 && styles.todayButtonActive,
            ]}
          >
            <Text
              style={[
                styles.todayButtonText,
                currentWeekOffset === 0 && styles.todayButtonTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selection toolbar */}
      {selectionMode && selectedBlocks && (
        <View style={styles.selectionToolbar}>
          <Text style={styles.selectionText}>
            {selectedBlocks.hours.length} hour(s) selected
          </Text>
          <View style={styles.toolbarButtons}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={clearSelectedBlocks}
            >
              <Text style={styles.toolbarButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarButton, styles.populateButton]}
              onPress={populateSelectedBlocks}
            >
              <Text style={styles.toolbarButtonText}>Populate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarButton, styles.cancelButton]}
              onPress={cancelSelection}
            >
              <Text style={styles.toolbarButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Columns */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {/* First view: Todo + Mon/Tue/Wed */}
        <View style={[styles.page, { width }]}>
          <TodoColumn
            todos={weekData.todos}
            onUpdateTodos={updateTodos}
            width={getColumnWidth('Todo')}
            onFocus={() => setFocusedColumn('Todo')}
            onBlur={() => {}}
          />
          {firstViewDays.map((day) => (
            <DailyColumn
              key={day}
              dayName={day}
              date={weekData.days[day].date}
              hours={weekData.days[day].hours}
              onUpdateHour={(hour, content) => handleHourUpdate(day, hour, content)}
              selectedHours={
                selectedBlocks?.dayKey === day ? selectedBlocks.hours : []
              }
              onHourLongPress={(hour) => handleHourLongPress(day, hour)}
              onHourPress={(hour) => handleHourPress(day, hour)}
              width={getColumnWidth(day)}
              onFocus={() => setFocusedColumn(null)}
              onBlur={() => {}}
              sleepingHours={sleepingHours}
            />
          ))}
        </View>

        {/* Second view: Thu/Fri/Sat/Sun */}
        <View style={[styles.page, { width }]}>
          {secondViewDays.map((day) => (
            <DailyColumn
              key={day}
              dayName={day}
              date={weekData.days[day].date}
              hours={weekData.days[day].hours}
              onUpdateHour={(hour, content) => handleHourUpdate(day, hour, content)}
              selectedHours={
                selectedBlocks?.dayKey === day ? selectedBlocks.hours : []
              }
              onHourLongPress={(hour) => handleHourLongPress(day, hour)}
              onHourPress={(hour) => handleHourPress(day, hour)}
              width={getColumnWidth(day)}
              onFocus={() => setFocusedColumn(null)}
              onBlur={() => {}}
              sleepingHours={sleepingHours}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sidebar Menu */}
      <SidebarMenu
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        onGroupsPress={() => {
          setShowSidebar(false);
          setShowActivityGroups(true);
        }}
        onHabitsPress={() => {
          setShowSidebar(false);
          setShowHabits(true);
        }}
        onSettingsPress={() => {
          setShowSidebar(false);
          setShowSettings(true);
        }}
      />

      {/* Activity Groups Modal */}
      <ActivityGroupScreen
        visible={showActivityGroups}
        onClose={() => setShowActivityGroups(false)}
      />

      {/* Habits Modal */}
      <HabitsScreen
        visible={showHabits}
        onClose={() => setShowHabits(false)}
      />

      {/* Settings Modal */}
      <SettingsScreen
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onSetupSleep={handleOnboardingSetupSleep}
        onClose={handleOnboardingClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2196F3',
    borderBottomWidth: 1,
    borderBottomColor: '#1976D2',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  todayButtonActive: {
    backgroundColor: '#fff',
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  todayButtonTextActive: {
    color: '#2196F3',
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toolbarButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  populateButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  page: {
    flexDirection: 'row',
  },
});
