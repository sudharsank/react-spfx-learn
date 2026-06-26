// apps/spfx-portal/content/labs.ts

export type LabType = 'guided' | 'challenge';

export interface SpfxLabStep {
  title: string;
  instruction: string;
  code?: string;
  language?: string;
  hint?: string;
}

export interface SpfxLabDefinition {
  slug: string;
  title: string;
  description: string;
  type: LabType;
  duration: string;
  module: string;
  steps?: SpfxLabStep[];
  goal?: string;
  starterCode?: string;
}

export const SPFX_LABS: SpfxLabDefinition[] = [
  {
    slug: 'scaffold-webpart',
    title: 'Scaffold Your First Web Part',
    description: 'Use the SPFx generator to scaffold a Hello World web part, then explore the generated files.',
    type: 'guided',
    duration: '20 min',
    module: 'module-1-spfx-intro',
    steps: [
      {
        title: 'Install global dependencies',
        instruction: 'Open your terminal and install the SPFx toolchain globally. You need Node.js 22 LTS (check with `node -v`), then run:',
        code: `npm install -g @microsoft/generator-sharepoint yo @rushstack/heft`,
        language: 'bash',
        hint: 'If you see EACCES errors on Mac/Linux, prefix with `sudo` or fix npm permissions with `nvm`.',
      },
      {
        title: 'Run the Yeoman generator',
        instruction: 'Create a new directory for your project, then run the SPFx Yeoman generator. Choose "WebPart", "React", and give it the name "HelloWorld".',
        code: `mkdir my-first-webpart && cd my-first-webpart\nyo @microsoft/sharepoint`,
        language: 'bash',
        hint: 'When prompted for framework, choose "React". When prompted for component type, choose "WebPart".',
      },
      {
        title: 'Start the development server',
        instruction: 'In SPFx 1.22+, Heft replaces gulp. Start the local development server with:',
        code: `heft start`,
        language: 'bash',
      },
      {
        title: 'Open the Debug Toolbar',
        instruction: 'In SPFx 1.21+, the classic Workbench (/_layouts/15/workbench.aspx) is deprecated. Instead, use the SPFx Debug Toolbar. Open your browser and navigate to your SharePoint site, then press F12 → SPFx Debug Toolbar to add your local web part to a page.',
        hint: 'The Debug Toolbar URL format is: https://your-tenant.sharepoint.com/sites/your-site?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js',
      },
    ],
  },
  {
    slug: 'pnpjs-list-data',
    title: 'Fetch SharePoint List Data with PnP JS',
    description: 'Use @pnp/sp to read list items from SharePoint and display them in your web part.',
    type: 'guided',
    duration: '25 min',
    module: 'module-2-react-in-spfx',
    steps: [
      {
        title: 'Install @pnp/sp',
        instruction: 'Install the PnP JS SharePoint library:',
        code: `npm install @pnp/sp`,
        language: 'bash',
      },
      {
        title: 'Initialise PnP in onInit',
        instruction: 'In your web part class (`.ts` file), override `onInit` and configure PnP with the web part context:',
        code: `import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

private sp: ReturnType<typeof spfi>;

protected async onInit(): Promise<void> {
  await super.onInit();
  this.sp = spfi().using(SPFx(this.context));
}`,
        language: 'typescript',
        hint: 'The SPFx context provides the current user, site URL, and auth tokens PnP needs to make API calls.',
      },
      {
        title: 'Fetch items in your React component',
        instruction: 'Pass the sp instance to your React component as a prop, then use useEffect to fetch list items:',
        code: `const [items, setItems] = React.useState([]);

React.useEffect(() => {
  sp.web.lists.getByTitle("Announcements").items()
    .then(result => setItems(result))
    .catch(console.error);
}, []);`,
        language: 'typescript',
        hint: 'Make sure the list "Announcements" exists in your SharePoint site, or replace it with a list you have.',
      },
    ],
  },
  {
    slug: 'deploy-sppkg',
    title: 'Package & Deploy Challenge',
    description: 'Package your web part as an .sppkg file and deploy it to the SharePoint App Catalog.',
    type: 'challenge',
    duration: '30 min',
    module: 'module-3-deployment',
    goal: 'Starting from a working SPFx web part project, build and deploy it to your tenant. Your goal: (1) run `heft package-solution --production` to create the .sppkg file, (2) upload it to the App Catalog, (3) add it to a page. Document each step with screenshots.',
  },
];

export function getSpfxLab(slug: string): SpfxLabDefinition | undefined {
  return SPFX_LABS.find((l) => l.slug === slug);
}
