import { notFound } from 'next/navigation';
import { MODULES, getModule, getLesson } from '../../../../content/modules';
import { LessonLayout } from '../../../../components/LessonLayout';
import * as Module1Lesson1 from '../../../../content/lessons/module-1-foundations/1-what-is-react.mdx';
import * as Module1Lesson2 from '../../../../content/lessons/module-1-foundations/2-jsx-basics.mdx';
import * as Module1Lesson3 from '../../../../content/lessons/module-1-foundations/3-components.mdx';
import * as Module2Lesson1 from '../../../../content/lessons/module-2-hooks/1-use-state.mdx';
import * as Module2Lesson2 from '../../../../content/lessons/module-2-hooks/2-use-effect.mdx';
import * as Module2Lesson3 from '../../../../content/lessons/module-2-hooks/3-custom-hooks.mdx';
import * as Module3Lesson1 from '../../../../content/lessons/module-3-patterns/1-props-and-state.mdx';
import * as Module3Lesson2 from '../../../../content/lessons/module-3-patterns/2-lifting-state.mdx';
import * as Module3Lesson3 from '../../../../content/lessons/module-3-patterns/3-composition.mdx';
// Import pattern — each MDX file imported statically for static export compatibility

const LESSON_CONTENT: Record<string, React.ComponentType> = {
  'module-1-foundations/1-what-is-react': Module1Lesson1.default,
  'module-1-foundations/2-jsx-basics': Module1Lesson2.default,
  'module-1-foundations/3-components': Module1Lesson3.default,
  'module-2-hooks/1-use-state': Module2Lesson1.default,
  'module-2-hooks/2-use-effect': Module2Lesson2.default,
  'module-2-hooks/3-custom-hooks': Module2Lesson3.default,
  'module-3-patterns/1-props-and-state': Module3Lesson1.default,
  'module-3-patterns/2-lifting-state': Module3Lesson2.default,
  'module-3-patterns/3-composition': Module3Lesson3.default,
};

export async function generateStaticParams() {
  const params: { module: string; lesson: string }[] = [];
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      params.push({ module: mod.slug, lesson: lesson.slug });
    }
  }
  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const mod = getModule(moduleSlug);
  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!mod || !lesson) notFound();

  const key = `${moduleSlug}/${lessonSlug}`;
  const Content = LESSON_CONTENT[key];
  if (!Content) notFound();

  return (
    <LessonLayout module={mod} lesson={lesson}>
      <Content />
    </LessonLayout>
  );
}
