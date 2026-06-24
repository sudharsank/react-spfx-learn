import type { ModuleDefinition } from '@repo/content';

export const MODULES: ModuleDefinition[] = [
  {
    slug: 'module-1-spfx-intro',
    title: 'SPFx Fundamentals',
    description: 'What SPFx is, your dev environment, and your first web part.',
    order: 1,
    lessons: [
      { slug: '1-what-is-spfx', title: 'What is SPFx?', description: 'The architecture behind SharePoint Framework.', order: 1, duration: '8 min', personas: ['explorer', 'maker', 'architect', 'integrator'] },
      { slug: '2-dev-environment', title: 'Dev Environment', description: 'Node 22, Heft, Yeoman — set up your machine.', order: 2, duration: '15 min', personas: ['explorer', 'maker', 'architect'] },
      { slug: '3-first-webpart', title: 'Your First Web Part', description: 'Scaffold, serve with heft start, and see it live.', order: 3, duration: '20 min', personas: ['explorer', 'maker', 'architect', 'integrator'] },
    ],
  },
  {
    slug: 'module-2-react-in-spfx',
    title: 'React in SPFx',
    description: 'Using React components inside SharePoint web parts.',
    order: 2,
    lessons: [
      { slug: '1-react-primer', title: 'React Primer for SPFx', description: 'Just enough React to build SPFx web parts.', order: 1, duration: '12 min', personas: ['explorer', 'maker'] },
      { slug: '2-scaffold-project', title: 'Scaffold with Yeoman', description: 'yo @microsoft/sharepoint and project structure explained.', order: 2, duration: '18 min', personas: ['maker', 'architect', 'integrator'] },
      { slug: '3-pnpjs-basics', title: 'PnP JS Basics', description: 'Query SharePoint data from your web part.', order: 3, duration: '15 min', personas: ['maker', 'architect', 'integrator'] },
    ],
  },
  {
    slug: 'module-3-deployment',
    title: 'Deploying SPFx',
    description: 'Build, package, and deploy to your SharePoint tenant.',
    order: 3,
    lessons: [
      { slug: '1-app-catalog', title: 'App Catalog', description: 'What the App Catalog is and how it works.', order: 1, duration: '8 min', personas: ['explorer', 'maker', 'architect', 'integrator'] },
      { slug: '2-heft-build', title: 'Build with Heft', description: 'heft build, heft package-solution --production explained.', order: 2, duration: '12 min', personas: ['maker', 'architect', 'integrator'] },
      { slug: '3-tenant-deploy', title: 'Tenant Deployment', description: 'Upload .sppkg, approve, and verify with Debug Toolbar.', order: 3, duration: '15 min', personas: ['explorer', 'maker', 'architect', 'integrator'] },
    ],
  },
];

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  return getModule(moduleSlug)?.lessons.find((l) => l.slug === lessonSlug);
}
