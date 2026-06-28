import { REACT_PROJECTS } from '../../../content/projects';
import ProjectWizard from '../../../components/ProjectWizard';

export function generateStaticParams() {
  return REACT_PROJECTS.map((p) => ({ project: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const proj = REACT_PROJECTS.find((p) => p.slug === slug);
  if (!proj) return <div className="p-8 text-gray-500">Project not found.</div>;
  return <ProjectWizard project={proj} />;
}
