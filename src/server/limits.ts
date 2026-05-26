/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface UsageLimitInfo {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  resetHours: number;
}

const LIMITS = {
  GENERATION: 5,      // New AI study materials per 24 hours
  QUESTION: 30,       // Questions to the AI Tutor per 24 hours
  REGISTRATION: 5,    // Registrations per IP per 24 hours
  MAX_LECTURES: 15,   // Max saved study monographs per user space
};

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours rolling window

// Memory maps for tracking sliding windows
const generationTracker = new Map<string, number[]>();
const questionTracker = new Map<string, number[]>();
const registrationTracker = new Map<string, number[]>();

/**
 * Filter out timestamps older than 24 hours and return remaining valid times
 */
function pruneAndGetTimestamps(map: Map<string, number[]>, key: string): number[] {
  const now = Date.now();
  const times = map.get(key) || [];
  const pruned = times.filter((t) => now - t < WINDOW_MS);
  if (pruned.length !== times.length) {
    if (pruned.length === 0) {
      map.delete(key);
    } else {
      map.set(key, pruned);
    }
  }
  return pruned;
}

function getResetHoursRemaining(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  // Earliest timestamp in window will expire in:
  const oldest = timestamps[0];
  const timeElapsed = Date.now() - oldest;
  const timeRemaining = Math.max(0, WINDOW_MS - timeElapsed);
  return Number((timeRemaining / (3600 * 1000)).toFixed(1));
}

export function checkGenerationLimit(identifier: string): UsageLimitInfo {
  const times = pruneAndGetTimestamps(generationTracker, identifier);
  const current = times.length;
  const limit = LIMITS.GENERATION;
  return {
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current),
    resetHours: current >= limit ? getResetHoursRemaining(times) : 0,
  };
}

export function incrementGeneration(identifier: string): void {
  const times = pruneAndGetTimestamps(generationTracker, identifier);
  times.push(Date.now());
  generationTracker.set(identifier, times);
}

export function checkQuestionLimit(identifier: string): UsageLimitInfo {
  const times = pruneAndGetTimestamps(questionTracker, identifier);
  const current = times.length;
  const limit = LIMITS.QUESTION;
  return {
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current),
    resetHours: current >= limit ? getResetHoursRemaining(times) : 0,
  };
}

export function incrementQuestion(identifier: string): void {
  const times = pruneAndGetTimestamps(questionTracker, identifier);
  times.push(Date.now());
  questionTracker.set(identifier, times);
}

export function checkRegistrationLimit(ip: string): UsageLimitInfo {
  const times = pruneAndGetTimestamps(registrationTracker, ip);
  const current = times.length;
  const limit = LIMITS.REGISTRATION;
  return {
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current),
    resetHours: current >= limit ? getResetHoursRemaining(times) : 0,
  };
}

export function incrementRegistration(ip: string): void {
  const times = pruneAndGetTimestamps(registrationTracker, ip);
  times.push(Date.now());
  registrationTracker.set(ip, times);
}

export function getSystemLimits() {
  return LIMITS;
}

export function getUsageSummary(identifier: string, ip: string, activeLecturesCount: number) {
  const gen = checkGenerationLimit(identifier);
  const qst = checkQuestionLimit(identifier);
  return {
    lectures: {
      current: activeLecturesCount,
      limit: LIMITS.MAX_LECTURES,
      remaining: Math.max(0, LIMITS.MAX_LECTURES - activeLecturesCount),
      allowed: activeLecturesCount < LIMITS.MAX_LECTURES,
    },
    generations: gen,
    chatQuestions: qst,
    ip,
    identifier,
  };
}
