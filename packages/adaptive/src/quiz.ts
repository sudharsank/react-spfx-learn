import type { ReactPersona, SpfxPersona } from './personas';

export interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string; scores: Record<string, number> }[];
}

export const REACT_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'How would you describe your JavaScript experience?',
    options: [
      { id: 'a', text: 'I know the basics — variables, loops, functions', scores: { spark: 3, builder: 1, craftsman: 0, consultant: 0 } },
      { id: 'b', text: 'I write JS daily and feel confident with it', scores: { spark: 0, builder: 3, craftsman: 1, consultant: 2 } },
      { id: 'c', text: 'I know JS deeply — closures, event loop, async patterns', scores: { spark: 0, builder: 1, craftsman: 3, consultant: 2 } },
    ],
  },
  {
    id: 'q2',
    text: 'What is your main goal with React?',
    options: [
      { id: 'a', text: 'Build my first interactive web page', scores: { spark: 3, builder: 1, craftsman: 0, consultant: 0 } },
      { id: 'b', text: 'Learn patterns and best practices properly', scores: { spark: 0, builder: 3, craftsman: 1, consultant: 2 } },
      { id: 'c', text: 'Understand how React works under the hood', scores: { spark: 0, builder: 0, craftsman: 3, consultant: 0 } },
      { id: 'd', text: 'Deliver React projects for clients effectively', scores: { spark: 0, builder: 1, craftsman: 0, consultant: 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'What does "component" mean to you right now?',
    options: [
      { id: 'a', text: "I've heard the term but I'm not totally sure", scores: { spark: 3, builder: 0, craftsman: 0, consultant: 0 } },
      { id: 'b', text: 'A reusable piece of UI with props and state', scores: { spark: 0, builder: 3, craftsman: 1, consultant: 2 } },
      { id: 'c', text: 'A function that returns a fiber node tree', scores: { spark: 0, builder: 0, craftsman: 3, consultant: 0 } },
    ],
  },
  {
    id: 'q4',
    text: 'Pick the closest to your work situation:',
    options: [
      { id: 'a', text: 'Learning on my own / side projects', scores: { spark: 2, builder: 2, craftsman: 1, consultant: 0 } },
      { id: 'b', text: 'Developer at a product company', scores: { spark: 0, builder: 2, craftsman: 2, consultant: 0 } },
      { id: 'c', text: 'Consultant / freelancer / agency', scores: { spark: 0, builder: 1, craftsman: 0, consultant: 3 } },
      { id: 'd', text: 'Student or career switcher', scores: { spark: 3, builder: 1, craftsman: 0, consultant: 0 } },
    ],
  },
  {
    id: 'q5',
    text: 'What frustrates you most about React tutorials?',
    options: [
      { id: 'a', text: 'Too much code, not enough explanation', scores: { spark: 3, builder: 0, craftsman: 0, consultant: 0 } },
      { id: 'b', text: 'Too basic — I know this already', scores: { spark: 0, builder: 1, craftsman: 3, consultant: 1 } },
      { id: 'c', text: 'No real-world examples of trade-offs', scores: { spark: 0, builder: 2, craftsman: 0, consultant: 3 } },
      { id: 'd', text: "I'm just starting so I haven't hit this yet", scores: { spark: 3, builder: 0, craftsman: 0, consultant: 0 } },
    ],
  },
];

export const SPFX_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'How familiar are you with React before starting SPFx?',
    options: [
      { id: 'a', text: "I haven't used React before", scores: { explorer: 3, maker: 0, architect: 0, integrator: 0 } },
      { id: 'b', text: 'I know React basics', scores: { explorer: 1, maker: 3, architect: 1, integrator: 2 } },
      { id: 'c', text: "I use React professionally", scores: { explorer: 0, maker: 2, architect: 3, integrator: 2 } },
    ],
  },
  {
    id: 'q2',
    text: 'What is your SharePoint background?',
    options: [
      { id: 'a', text: 'I manage SharePoint sites and permissions', scores: { explorer: 3, maker: 0, architect: 0, integrator: 1 } },
      { id: 'b', text: 'I build apps in M365 / Microsoft 365', scores: { explorer: 0, maker: 3, architect: 1, integrator: 2 } },
      { id: 'c', text: 'I architect enterprise SharePoint solutions', scores: { explorer: 0, maker: 0, architect: 3, integrator: 1 } },
      { id: 'd', text: 'I deliver SharePoint projects for clients', scores: { explorer: 0, maker: 1, architect: 1, integrator: 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'What does a .sppkg file mean to you?',
    options: [
      { id: 'a', text: "I've seen the term but I'm not sure", scores: { explorer: 3, maker: 1, architect: 0, integrator: 0 } },
      { id: 'b', text: 'A package you upload to the App Catalog', scores: { explorer: 0, maker: 3, architect: 2, integrator: 2 } },
      { id: 'c', text: 'The output of heft package-solution --production', scores: { explorer: 0, maker: 1, architect: 3, integrator: 2 } },
    ],
  },
  {
    id: 'q4',
    text: 'What is your main goal with SPFx?',
    options: [
      { id: 'a', text: 'Customise my company SharePoint without IT help', scores: { explorer: 3, maker: 0, architect: 0, integrator: 0 } },
      { id: 'b', text: 'Build web parts for my organisation', scores: { explorer: 0, maker: 3, architect: 1, integrator: 1 } },
      { id: 'c', text: 'Build enterprise extensions with full DevOps', scores: { explorer: 0, maker: 0, architect: 3, integrator: 1 } },
      { id: 'd', text: 'Deliver SPFx solutions for multiple clients', scores: { explorer: 0, maker: 1, architect: 1, integrator: 3 } },
    ],
  },
  {
    id: 'q5',
    text: 'Have you used Node.js or npm before?',
    options: [
      { id: 'a', text: 'Rarely or never', scores: { explorer: 3, maker: 0, architect: 0, integrator: 0 } },
      { id: 'b', text: 'Yes, for front-end tooling', scores: { explorer: 0, maker: 3, architect: 1, integrator: 2 } },
      { id: 'c', text: 'Yes, extensively — I build full CI/CD pipelines', scores: { explorer: 0, maker: 0, architect: 3, integrator: 2 } },
    ],
  },
];

export function scoreQuiz(
  answers: Record<string, string>,
  questions: QuizQuestion[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const q of questions) {
    const selected = answers[q.id];
    if (!selected) continue;
    const option = q.options.find((o) => o.id === selected);
    if (!option) continue;
    for (const [persona, score] of Object.entries(option.scores)) {
      totals[persona] = (totals[persona] ?? 0) + score;
    }
  }
  return totals;
}

export function pickPersona(scores: Record<string, number>): ReactPersona | SpfxPersona {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ReactPersona | SpfxPersona;
}
