import { ConceptCard, AnnotatedCode, QuizBlock, AnalogyBridge, DangerZone, DeepDive, VideoEmbed, TryItInline, HintCard } from '@repo/ui';
import { ClientMicroAnimation as MicroAnimation } from './components/ClientMicroAnimation';
import { ClientConceptMap as ConceptMap } from './components/ClientConceptMap';

export function useMDXComponents(components: Record<string, React.ComponentType>) {
  return {
    ConceptCard,
    AnnotatedCode,
    QuizBlock,
    AnalogyBridge,
    DangerZone,
    DeepDive,
    VideoEmbed,
    TryItInline,
    HintCard,
    ConceptMap,
    MicroAnimation,
    ...components,
  };
}
