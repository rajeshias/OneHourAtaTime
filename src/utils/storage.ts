import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityGroup, WeekData, Habit } from '../types';

const ACTIVITY_GROUPS_KEY = '@activity_groups';
const WEEK_DATA_KEY = '@week_data_';
const SLEEPING_HOURS_KEY = '@sleeping_hours';
const HABITS_KEY = '@habits';
const HABIT_FILLED_WEEKS_KEY = '@habit_filled_weeks';
const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

export const storageUtils = {
  // Activity Groups
  async getActivityGroups(): Promise<ActivityGroup[]> {
    try {
      const data = await AsyncStorage.getItem(ACTIVITY_GROUPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting activity groups:', error);
      return [];
    }
  },

  async saveActivityGroups(groups: ActivityGroup[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVITY_GROUPS_KEY, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving activity groups:', error);
    }
  },

  // Week Data
  async getWeekData(weekKey: string): Promise<WeekData | null> {
    try {
      const data = await AsyncStorage.getItem(WEEK_DATA_KEY + weekKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting week data:', error);
      return null;
    }
  },

  async saveWeekData(weekKey: string, weekData: WeekData): Promise<void> {
    try {
      await AsyncStorage.setItem(WEEK_DATA_KEY + weekKey, JSON.stringify(weekData));
    } catch (error) {
      console.error('Error saving week data:', error);
    }
  },

  // Sleeping Hours
  async getSleepingHours(): Promise<{ start: number; end: number } | null> {
    try {
      const data = await AsyncStorage.getItem(SLEEPING_HOURS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting sleeping hours:', error);
      return null;
    }
  },

  async saveSleepingHours(hours: { start: number; end: number }): Promise<void> {
    try {
      await AsyncStorage.setItem(SLEEPING_HOURS_KEY, JSON.stringify(hours));
    } catch (error) {
      console.error('Error saving sleeping hours:', error);
    }
  },

  // Habits
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(HABITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  },

  async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  },

  // Habit-filled weeks tracking
  async getHabitFilledWeeks(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(HABIT_FILLED_WEEKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting habit filled weeks:', error);
      return [];
    }
  },

  async saveHabitFilledWeeks(weekKeys: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABIT_FILLED_WEEKS_KEY, JSON.stringify(weekKeys));
    } catch (error) {
      console.error('Error saving habit filled weeks:', error);
    }
  },

  async addHabitFilledWeek(weekKey: string): Promise<void> {
    try {
      const filled = await this.getHabitFilledWeeks();
      if (!filled.includes(weekKey)) {
        filled.push(weekKey);
        await this.saveHabitFilledWeeks(filled);
      }
    } catch (error) {
      console.error('Error adding habit filled week:', error);
    }
  },

  // Onboarding
  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return data === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  },
};
