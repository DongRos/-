import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StudyEntry, DailyStats } from '../types';

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.uid;
};

// --- Entries ---

export const saveEntries = async (entries: StudyEntry[]) => {
  const uid = getUserId();
  if (!uid) return;
  try {
    await setDoc(doc(db, "users", uid, "data", "entries"), { list: entries });
  } catch (e) {
    console.error("Save failed:", e);
  }
};

export const getEntries = async (): Promise<StudyEntry[]> => {
  const uid = getUserId();
  if (!uid) return []; 
  try {
    const docRef = doc(db, "users", uid, "data", "entries");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list as StudyEntry[];
    }
  } catch (e) {
    console.error("Read failed:", e);
  }
  return [];
};

// --- Stats ---

export const saveStats = async (stats: DailyStats[]) => {
  const uid = getUserId();
  if (!uid) return;
  try {
    await setDoc(doc(db, "users", uid, "data", "stats"), { list: stats });
  } catch (e) {
    console.error("Save stats failed:", e);
  }
};

export const getStats = async (): Promise<DailyStats[]> => {
  const uid = getUserId();
  if (!uid) return [];
  try {
    const docRef = doc(db, "users", uid, "data", "stats");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list as DailyStats[];
    }
  } catch (e) {
    console.error("Read stats failed:", e);
  }
  return [];
};

export const recordActivity = async (type: 'review' | 'learn') => {
  const stats = await getStats();
  const today = new Date().toISOString().split('T')[0];
  
  let todayStat = stats.find(s => s.date === today);
  if (!todayStat) {
    todayStat = { date: today, reviewsCompleted: 0, newItemsLearned: 0 };
    stats.push(todayStat);
  }

  if (type === 'review') todayStat.reviewsCompleted += 1;
  if (type === 'learn') todayStat.newItemsLearned += 1;

  await saveStats(stats);
};
