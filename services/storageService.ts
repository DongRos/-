import { StudyEntry, DailyStats } from '../types';

const KEYS = {
  ENTRIES: 'linguaflow_entries',
  STATS: 'linguaflow_stats'
};

export const saveEntries = (entries: StudyEntry[]) => {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
};

export const getEntries = (): StudyEntry[] => {
  const data = localStorage.getItem(KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
};

export const saveStats = (stats: DailyStats[]) => {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
};

export const getStats = (): DailyStats[] => {
  const data = localStorage.getItem(KEYS.STATS);
  return data ? JSON.parse(data) : [];
};

export const recordActivity = (type: 'review' | 'learn') => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  
  let todayStat = stats.find(s => s.date === today);
  if (!todayStat) {
    todayStat = { date: today, reviewsCompleted: 0, newItemsLearned: 0 };
    stats.push(todayStat);
  }

  if (type === 'review') todayStat.reviewsCompleted += 1;
  if (type === 'learn') todayStat.newItemsLearned += 1;

  saveStats(stats);
};