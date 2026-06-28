import { SPFX_PROJECTS } from '../../../content/projects';
import SpfxProjectWizard from '../../../components/SpfxProjectWizard';

export function generateStaticParams() {
  return SPFX_PROJECTS.map((p) => ({ project: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const proj = SPFX_PROJECTS.find((p) => p.slug === slug);
  if (!proj) return <div className="p-8 text-gray-500">Project not found.</div>;
  return <SpfxProjectWizard project={proj} />;
}
