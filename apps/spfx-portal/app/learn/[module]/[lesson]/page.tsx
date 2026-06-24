import { notFound } from 'next/navigation';
import { MODULES, getModule, getLesson } from '../../../../content/modules';
import { LessonLayout } from '../../../../components/LessonLayout';
import * as Module1Lesson1 from '../../../../content/lessons/module-1-spfx-intro/1-what-is-spfx.mdx';
import * as Module1Lesson2 from '../../../../content/lessons/module-1-spfx-intro/2-dev-environment.mdx';
import * as Module1Lesson3 from '../../../../content/lessons/module-1-spfx-intro/3-first-webpart.mdx';
import * as Module2Lesson1 from '../../../../content/lessons/module-2-react-in-spfx/1-react-primer.mdx';
import * as Module2Lesson2 from '../../../../content/lessons/module-2-react-in-spfx/2-scaffold-project.mdx';
import * as Module2Lesson3 from '../../../../content/lessons/module-2-react-in-spfx/3-pnpjs-basics.mdx';
import * as Module3Lesson1 from '../../../../content/lessons/module-3-deployment/1-app-catalog.mdx';
import * as Module3Lesson2 from '../../../../content/lessons/module-3-deployment/2-heft-build.mdx';
import * as Module3Lesson3 from '../../../../content/lessons/module-3-deployment/3-tenant-deploy.mdx';

const LESSON_CONTENT: Record<string, React.ComponentType> = {
  'module-1-spfx-intro/1-what-is-spfx': Module1Lesson1.default,
  'module-1-spfx-intro/2-dev-environment': Module1Lesson2.default,
  'module-1-spfx-intro/3-first-webpart': Module1Lesson3.default,
  'module-2-react-in-spfx/1-react-primer': Module2Lesson1.default,
  'module-2-react-in-spfx/2-scaffold-project': Module2Lesson2.default,
  'module-2-react-in-spfx/3-pnpjs-basics': Module2Lesson3.default,
  'module-3-deployment/1-app-catalog': Module3Lesson1.default,
  'module-3-deployment/2-heft-build': Module3Lesson2.default,
  'module-3-deployment/3-tenant-deploy': Module3Lesson3.default,
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
