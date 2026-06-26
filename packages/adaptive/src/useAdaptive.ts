'use client';

import { useState, useCallback } from 'react';
import { AdaptiveScore, updateScore, getContentDepth } from './adaptiveScore';
import { BadgeDefinition, getEarnedBadges, awardBadge, checkBadge } from './badges';

const SCORE_KEY_PREFIX = 'adaptive_score_';

function loadScore(portal: string): AdaptiveScore {
  if (typeof window === 'undefined') return { scores: {}, completedLessons: [] };
  try {
    const raw = localStorage.getItem(SCORE_KEY_PREFIX + portal);
    return raw ? (JSON.parse(raw) as AdaptiveScore) : { scores: {}, completedLessons: [] };
  } catch {
    return { scores: {}, completedLessons: [] };
  }
}

function saveScore(portal: string, score: AdaptiveScore): void {
  localStorage.setItem(SCORE_KEY_PREFIX + portal, JSON.stringify(score));
}

export function useAdaptive(portal: 'react' | 'spfx') {
  const [score, setScore] = useState<AdaptiveScore>(() => loadScore(portal));
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => getEarnedBadges());
  const [pendingBadge, setPendingBadge] = useState<BadgeDefinition | null>(null);

  const topicScores = Object.values(score.scores);
  const avgScore = topicScores.length ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length) : 50;
  const contentDepth = getContentDepth(avgScore);

  const tryAwardBadge = useCallback((event: Parameters<typeof checkBadge>[0], currentEarned: string[]) => {
    const badge = checkBadge(event, currentEarned);
    if (badge) {
      const updated = awardBadge(badge.id);
      setEarnedBadges(updated);
      setPendingBadge(badge);
    }
  }, []);

  const onQuizComplete = useCallback((lessonSlug: string, correct: number, total: number) => {
    setScore((prev) => {
      const next = updateScore(prev, lessonSlug, correct, total);
      saveScore(portal, next);
      return next;
    });
    if (correct === total && total > 0) {
      tryAwardBadge({ type: 'quiz-perfect', slug: lessonSlug }, earnedBadges);
    }
  }, [portal, earnedBadges, tryAwardBadge]);

  const onLessonComplete = useCallback((lessonSlug: string) => {
    setScore((prev) => {
      if (prev.completedLessons.includes(lessonSlug)) return prev;
      const next = { ...prev, completedLessons: [...prev.completedLessons, lessonSlug] };
      saveScore(portal, next);
      return next;
    });
    tryAwardBadge({ type: 'lesson', slug: lessonSlug }, earnedBadges);
  }, [portal, earnedBadges, tryAwardBadge]);

  const onModuleComplete = useCallback((moduleSlug: string) => {
    tryAwardBadge({ type: 'module', slug: moduleSlug }, earnedBadges);
  }, [earnedBadges, tryAwardBadge]);

  const onLabComplete = useCallback((labSlug: string) => {
    tryAwardBadge({ type: 'lab', slug: labSlug }, earnedBadges);
  }, [earnedBadges, tryAwardBadge]);

  const dismissBadge = useCallback(() => setPendingBadge(null), []);

  return { score, contentDepth, earnedBadges, pendingBadge, onQuizComplete, onLessonComplete, onModuleComplete, onLabComplete, dismissBadge };
}
