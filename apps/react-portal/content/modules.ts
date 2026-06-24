import type { ModuleDefinition } from '@repo/content';

export const MODULES: ModuleDefinition[] = [
  {
    slug: 'module-1-foundations',
    title: 'React Foundations',
    description: 'What React is, why it exists, and your first components.',
    order: 1,
    lessons: [
      { slug: '1-what-is-react', title: 'What is React?', description: 'The why behind React and what problem it solves.', order: 1, duration: '8 min', personas: ['spark', 'builder', 'craftsman', 'consultant'] },
      { slug: '2-jsx-basics', title: 'JSX Basics', description: 'Writing HTML-like syntax in JavaScript.', order: 2, duration: '10 min', personas: ['spark', 'builder'] },
      { slug: '3-components', title: 'Components & Props', description: 'Building reusable pieces of UI.', order: 3, duration: '12 min', personas: ['spark', 'builder', 'craftsman', 'consultant'] },
    ],
  },
  {
    slug: 'module-2-hooks',
    title: 'React Hooks',
    description: 'State, side effects, and custom hooks.',
    order: 2,
    lessons: [
      { slug: '1-use-state', title: 'useState', description: 'Managing local component state.', order: 1, duration: '10 min', personas: ['spark', 'builder', 'craftsman'] },
      { slug: '2-use-effect', title: 'useEffect', description: 'Syncing with external systems.', order: 2, duration: '14 min', personas: ['builder', 'craftsman'] },
      { slug: '3-custom-hooks', title: 'Custom Hooks', description: 'Extracting reusable stateful logic.', order: 3, duration: '12 min', personas: ['builder', 'craftsman', 'consultant'] },
    ],
  },
  {
    slug: 'module-3-patterns',
    title: 'Building with React',
    description: 'Practical patterns for real-world apps.',
    order: 3,
    lessons: [
      { slug: '1-props-and-state', title: 'Props vs State', description: 'When to use which, and why it matters.', order: 1, duration: '10 min', personas: ['spark', 'builder', 'craftsman', 'consultant'] },
      { slug: '2-lifting-state', title: 'Lifting State Up', description: 'Sharing state between sibling components.', order: 2, duration: '12 min', personas: ['builder', 'craftsman', 'consultant'] },
      { slug: '3-composition', title: 'Component Composition', description: 'Building complex UI from small, focused pieces.', order: 3, duration: '10 min', personas: ['builder', 'craftsman', 'consultant'] },
    ],
  },
];

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  return getModule(moduleSlug)?.lessons.find((l) => l.slug === lessonSlug);
}
