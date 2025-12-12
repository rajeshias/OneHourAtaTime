export const getWeekKey = (date: Date): string => {
  const weekNumber = getWeekNumber(date);
  const year = date.getFullYear();
  return `${year}-W${weekNumber}`;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayOfWeek = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Convert to Mon=0, Sun=6
};

export const isWeekend = (dayName: string): boolean => {
  return dayName === 'Sat' || dayName === 'Sun';
};
