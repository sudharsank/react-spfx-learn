export interface AdaptiveScore {
  scores: Record<string, number>;
  completedLessons: string[];
}

export function updateScore(
  current: AdaptiveScore,
  lessonSlug: string,
  quizScore: number,
  total: number
): AdaptiveScore {
  const pct = Math.round((quizScore / total) * 100);
  const topic = lessonSlug.split('/')[0] ?? lessonSlug;
  const prev = current.scores[topic] ?? 50;
  const updated = Math.round(prev * 0.6 + pct * 0.4);
  return {
    scores: { ...current.scores, [topic]: updated },
    completedLessons: current.completedLessons.includes(lessonSlug)
      ? current.completedLessons
      : [...current.completedLessons, lessonSlug],
  };
}

export function getContentDepth(score: number): 'simplified' | 'standard' | 'enriched' {
  if (score < 40) return 'simplified';
  if (score <= 70) return 'standard';
  return 'enriched';
}
