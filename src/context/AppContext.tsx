import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActivityGroup, WeekData, DayData, HourBlock, TodoItem, Habit } from '../types';
import { storageUtils } from '../utils/storage';
import { getWeekKey, getMonday, formatDate } from '../utils/dateUtils';

interface AppContextType {
  activityGroups: ActivityGroup[];
  setActivityGroups: (groups: ActivityGroup[]) => void;
  weekData: WeekData | null;
  updateWeekData: (data: Partial<WeekData>) => void;
  updateDayHours: (dayKey: string, hours: HourBlock[]) => void;
  updateTodos: (todos: TodoItem[]) => void;
  currentWeekOffset: number;
  setCurrentWeekOffset: (offset: number) => void;
  loadWeekData: (offset: number) => void;
  selectedBlocks: { dayKey: string; hours: number[] } | null;
  setSelectedBlocks: (selection: { dayKey: string; hours: number[] } | null) => void;
  sleepingHours: { start: number; end: number } | null;
  setSleepingHours: (hours: { start: number; end: number }) => void;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  loadHabits: () => Promise<void>;
  applyHabitsToWeek: (weekKey: string, weekData: WeekData, fromDate?: string) => Promise<WeekData>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

const createEmptyWeekData = (weekOffset: number): WeekData => {
  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7);
  const monday = getMonday(today);

  const days: { [key: string]: DayData } = {};
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  dayNames.forEach((dayName, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const hours: HourBlock[] = [];
    for (let h = 0; h < 24; h++) {
      hours.push({ hour: h, content: '' });
    }

    days[dayName] = {
      date: formatDate(date),
      hours,
    };
  });

  return {
    weekNumber: weekOffset,
    startDate: formatDate(monday),
    todos: [],
    days,
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activityGroups, setActivityGroupsState] = useState<ActivityGroup[]>([]);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedBlocks, setSelectedBlocks] = useState<{ dayKey: string; hours: number[] } | null>(null);
  const [sleepingHours, setSleepingHoursState] = useState<{ start: number; end: number } | null>(null);
  const [habits, setHabitsState] = useState<Habit[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const groups = await storageUtils.getActivityGroups();
    setActivityGroupsState(groups);
    const sleeping = await storageUtils.getSleepingHours();
    setSleepingHoursState(sleeping);
    const loadedHabits = await storageUtils.getHabits();
    setHabitsState(loadedHabits);
    await loadWeekData(0);
  };

  const loadWeekData = async (offset: number) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);
    const weekKey = getWeekKey(today);

    let data = await storageUtils.getWeekData(weekKey);
    if (!data) {
      data = createEmptyWeekData(offset);
    }

    // Apply habits if conditions are met
    const filledWeeks = await storageUtils.getHabitFilledWeeks();
    const shouldApplyHabits =
      (offset === 0 && !filledWeeks.includes(weekKey)) ||  // Current week, not filled
      (offset > 0 && !filledWeeks.includes(weekKey));      // Future week, not filled

    if (shouldApplyHabits) {
      data = await applyHabitsToWeek(weekKey, data);
      await storageUtils.addHabitFilledWeek(weekKey);
    }

    await storageUtils.saveWeekData(weekKey, data);
    setWeekData(data);
    setCurrentWeekOffset(offset);
  };

  const setActivityGroups = async (groups: ActivityGroup[]) => {
    setActivityGroupsState(groups);
    await storageUtils.saveActivityGroups(groups);
  };

  const updateWeekData = async (updates: Partial<WeekData>) => {
    if (!weekData) return;

    const newData = { ...weekData, ...updates };
    setWeekData(newData);

    const today = new Date();
    today.setDate(today.getDate() + currentWeekOffset * 7);
    const weekKey = getWeekKey(today);
    await storageUtils.saveWeekData(weekKey, newData);
  };

  const updateDayHours = async (dayKey: string, hours: HourBlock[]) => {
    if (!weekData) return;

    const newData = {
      ...weekData,
      days: {
        ...weekData.days,
        [dayKey]: {
          ...weekData.days[dayKey],
          hours,
        },
      },
    };
    setWeekData(newData);

    const today = new Date();
    today.setDate(today.getDate() + currentWeekOffset * 7);
    const weekKey = getWeekKey(today);
    await storageUtils.saveWeekData(weekKey, newData);
  };

  const updateTodos = async (todos: TodoItem[]) => {
    if (!weekData) return;

    const newData = { ...weekData, todos };
    setWeekData(newData);

    const today = new Date();
    today.setDate(today.getDate() + currentWeekOffset * 7);
    const weekKey = getWeekKey(today);
    await storageUtils.saveWeekData(weekKey, newData);
  };

  const setSleepingHours = async (hours: { start: number; end: number }) => {
    setSleepingHoursState(hours);
    await storageUtils.saveSleepingHours(hours);
  };

  const setHabits = async (newHabits: Habit[]) => {
    setHabitsState(newHabits);
    await storageUtils.saveHabits(newHabits);
    // Clear habit filled weeks so new/updated habits can be applied
    await storageUtils.saveHabitFilledWeeks([]);

    // Apply habits to current week starting from tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = formatDate(tomorrow);

    const currentWeekKey = getWeekKey(today);
    const currentWeekData = await storageUtils.getWeekData(currentWeekKey);

    if (currentWeekData) {
      // Temporarily update habits state for applyHabitsToWeek to use the new habits
      const updatedWeekData = await applyHabitsToWeekWithCustomHabits(
        newHabits,
        currentWeekKey,
        currentWeekData,
        tomorrowDateStr
      );
      await storageUtils.saveWeekData(currentWeekKey, updatedWeekData);

      // Refresh the current week if we're viewing it (offset 0)
      if (currentWeekOffset === 0) {
        setWeekData(updatedWeekData);
      }
    }
  };

  // Helper function to apply habits with a custom habits list
  const applyHabitsToWeekWithCustomHabits = async (
    customHabits: Habit[],
    weekKey: string,
    weekData: WeekData,
    fromDate?: string
  ): Promise<WeekData> => {
    const enabledHabits = customHabits.filter(h => h.enabled);
    if (enabledHabits.length === 0) return weekData;

    const updatedDays = { ...weekData.days };

    for (const habit of enabledHabits) {
      for (const dayKey of habit.days) {
        if (!updatedDays[dayKey]) continue;

        const dayData = updatedDays[dayKey];

        // If fromDate is specified, skip days before it
        if (fromDate && dayData.date < fromDate) {
          continue;
        }

        const updatedHours = dayData.hours.map(hourBlock => {
          // Check if hour is in habit's range and block is empty
          if (
            hourBlock.hour >= habit.startHour &&
            hourBlock.hour < habit.endHour &&
            hourBlock.content === ''
          ) {
            let content = '';

            if (habit.type === 'standalone') {
              content = habit.activityReference;
            } else if (habit.type === 'activityGroup') {
              // Find the activity group
              const group = activityGroups.find(g => g.id === habit.activityReference);
              if (group && group.activities.length > 0) {
                // Randomly select an activity from the group
                const randomIndex = Math.floor(Math.random() * group.activities.length);
                content = group.activities[randomIndex];
              }
            }

            return { ...hourBlock, content };
          }
          return hourBlock;
        });

        updatedDays[dayKey] = { ...dayData, hours: updatedHours };
      }
    }

    return { ...weekData, days: updatedDays };
  };

  const loadHabits = async () => {
    const loadedHabits = await storageUtils.getHabits();
    setHabitsState(loadedHabits);
  };

  const applyHabitsToWeek = async (weekKey: string, weekData: WeekData, fromDate?: string): Promise<WeekData> => {
    const enabledHabits = habits.filter(h => h.enabled);
    if (enabledHabits.length === 0) return weekData;

    const updatedDays = { ...weekData.days };

    for (const habit of enabledHabits) {
      for (const dayKey of habit.days) {
        if (!updatedDays[dayKey]) continue;

        const dayData = updatedDays[dayKey];

        // If fromDate is specified, skip days before it
        if (fromDate && dayData.date < fromDate) {
          continue;
        }

        const updatedHours = dayData.hours.map(hourBlock => {
          // Check if hour is in habit's range and block is empty
          if (
            hourBlock.hour >= habit.startHour &&
            hourBlock.hour < habit.endHour &&
            hourBlock.content === ''
          ) {
            let content = '';

            if (habit.type === 'standalone') {
              content = habit.activityReference;
            } else if (habit.type === 'activityGroup') {
              // Find the activity group
              const group = activityGroups.find(g => g.id === habit.activityReference);
              if (group && group.activities.length > 0) {
                // Randomly select an activity from the group
                const randomIndex = Math.floor(Math.random() * group.activities.length);
                content = group.activities[randomIndex];
              }
            }

            return { ...hourBlock, content };
          }
          return hourBlock;
        });

        updatedDays[dayKey] = { ...dayData, hours: updatedHours };
      }
    }

    return { ...weekData, days: updatedDays };
  };

  return (
    <AppContext.Provider
      value={{
        activityGroups,
        setActivityGroups,
        weekData,
        updateWeekData,
        updateDayHours,
        updateTodos,
        currentWeekOffset,
        setCurrentWeekOffset,
        loadWeekData,
        selectedBlocks,
        setSelectedBlocks,
        sleepingHours,
        setSleepingHours,
        habits,
        setHabits,
        loadHabits,
        applyHabitsToWeek,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
