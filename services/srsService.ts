import { StudyEntry, SRSStage } from '../types';

// Ratings: 0 (Blackout), 1 (Incorrect), 2 (Hard), 3 (Good), 4 (Easy)
export const calculateNextReview = (entry: StudyEntry, rating: number): StudyEntry => {
  let newInterval = entry.interval;
  let newRepetition = entry.repetitionCount;
  let newEaseFactor = entry.easeFactor;
  let newStage = entry.stage;

  if (rating >= 3) {
    // Correct response
    if (newRepetition === 0) {
      newInterval = 1;
    } else if (newRepetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEaseFactor);
    }
    newRepetition += 1;
    newStage = SRSStage.Reviewing;
  } else {
    // Incorrect or Hard
    newRepetition = 0;
    newInterval = 1; // Reset to 1 day
    newStage = SRSStage.Learning;
  }

  // Update Ease Factor (Standard SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // q = rating
  newEaseFactor = newEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  nextReviewDate.setHours(4, 0, 0, 0); // Set to 4 AM next due day

  return {
    ...entry,
    interval: newInterval,
    repetitionCount: newRepetition,
    easeFactor: newEaseFactor,
    nextReviewDate: nextReviewDate.getTime(),
    stage: newStage
  };
};

export const getReviewStatus = (entries: StudyEntry[]) => {
  const now = Date.now();
  const due = entries.filter(e => e.nextReviewDate <= now);
  const future = entries.filter(e => e.nextReviewDate > now);
  return { due, future };
};