export interface ActivityGroup {
  id: string;
  name: string;
  activities: string[];
}

export interface HourBlock {
  hour: number;
  content: string;
}

export interface DayData {
  date: string;
  hours: HourBlock[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  todos: TodoItem[];
  days: {
    [key: string]: DayData;
  };
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type HabitType = 'standalone' | 'activityGroup';

export interface Habit {
  id: string;
  type: HabitType;
  activityReference: string;  // For standalone: activity name, For activityGroup: group ID
  days: DayOfWeek[];
  startHour: number;  // 0-23
  endHour: number;    // 0-23 (exclusive)
  enabled: boolean;
}
