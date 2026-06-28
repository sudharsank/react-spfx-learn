export interface SpfxProjectStep {
  title: string;
  instruction: string;
  codeFile: string;
  code: string;
  hint: string;
}

export interface SpfxProject {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate';
  steps: SpfxProjectStep[];
}

export const SPFX_PROJECTS: SpfxProject[] = [
  {
    slug: 'team-calendar-webpart',
    title: 'Team Calendar Web Part',
    description: 'Build an SPFx web part that displays SharePoint calendar events using PnPjs.',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Step 1 — Scaffold the web part class',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Create the web part class that extends BaseClientSideWebPart. Implement render() to mount a React component into this.domElement, and onDispose() to unmount it.',
        hint: 'Use ReactDom.render(React.createElement(TeamCalendar, { context: this.context }), this.domElement) in render().',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import TeamCalendar from './components/TeamCalendar';

export default class TeamCalendarWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
      },
      {
        title: 'Step 2 — Initialize PnPjs in onInit',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Override onInit() to configure PnPjs with the SPFx context. Import spfi and SPFx from @pnp/sp and @pnp/sp/presets/all. Call spfi().using(SPFx(this)) and store the result on the class.',
        hint: 'protected async onInit(): Promise<void> { await super.onInit(); this.sp = spfi().using(SPFx(this)); }',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/presets/all';
import TeamCalendar from './components/TeamCalendar';

export default class TeamCalendarWebPart extends BaseClientSideWebPart<{}> {
  private sp: ReturnType<typeof spfi>;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.sp = spfi().using(SPFx(this));
  }

  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
      sp: this.sp,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
      },
      {
        title: 'Step 3 — Create the React component',
        codeFile: 'src/webparts/teamCalendar/components/TeamCalendar.tsx',
        instruction: 'Create a TeamCalendar functional component. It receives context and sp as props. On mount, fetch events from a SharePoint list called "Team Calendar" using sp.web.lists.getByTitle("Team Calendar").items(). Store them in state.',
        hint: 'Use useEffect with an async IIFE: useEffect(() => { (async () => { const items = await sp.web.lists.getByTitle("Team Calendar").items(); setEvents(items); })(); }, []);',
        code: `import * as React from 'react';
import { spfi } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface ITeamCalendarProps {
  context: WebPartContext;
  sp: ReturnType<typeof spfi>;
}

interface ICalendarEvent {
  Id: number;
  Title: string;
  EventDate: string;
  EndDate: string;
}

const TeamCalendar: React.FC<ITeamCalendarProps> = ({ sp }) => {
  const [events, setEvents] = React.useState<ICalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const items = await sp.web.lists
          .getByTitle('Team Calendar')
          .items
          .select('Id', 'Title', 'EventDate', 'EndDate')();
        setEvents(items);
      } catch (e) {
        console.error('Failed to fetch events', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (events.length === 0) return <div>No events found in "Team Calendar" list.</div>;

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui', padding: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Team Calendar</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map((e) => (
          <li key={e.Id} style={{ padding: '10px 0', borderBottom: '1px solid #edebe9' }}>
            <strong>{e.Title}</strong>
            <br />
            <span style={{ fontSize: '13px', color: '#605e5c' }}>
              {new Date(e.EventDate).toLocaleDateString()} – {new Date(e.EndDate).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamCalendar;`,
      },
      {
        title: 'Step 4 — Add property pane for list name',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Add a listName property to the web part properties interface so admins can configure which list to read events from. Implement getPropertyPaneConfiguration() with a PropertyPaneTextField for "listName".',
        hint: 'Import { PropertyPaneConfiguration, PropertyPaneTextField } from @microsoft/sp-property-pane. Return them from getPropertyPaneConfiguration().',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  PropertyPaneTextField,
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/presets/all';
import TeamCalendar from './components/TeamCalendar';

export interface ITeamCalendarWebPartProps {
  listName: string;
}

export default class TeamCalendarWebPart extends BaseClientSideWebPart<ITeamCalendarWebPartProps> {
  private sp: ReturnType<typeof spfi>;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.sp = spfi().using(SPFx(this));
  }

  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
      sp: this.sp,
      listName: this.properties.listName || 'Team Calendar',
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configure Team Calendar' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: 'Calendar List Name',
                  description: 'The name of the SharePoint list containing calendar events',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}`,
      },
      {
        title: 'Step 5 — Package and prepare for deployment',
        codeFile: 'config/package-solution.json',
        instruction: 'Update package-solution.json to version 1.0.0.0 and set isDomainIsolated to false for tenant deployment. Add the required permissions for SharePoint access under webApiPermissionRequests.',
        hint: 'Set "version": "1.0.0.0" and "skipFeatureDeployment": true for tenant-wide deployment. Add "webApiPermissionRequests": [{"resource": "SharePoint", "scope": "AllSites.Read"}].',
        code: `{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/package-solution/2017-02/package-solution.schema.json",
  "solution": {
    "name": "team-calendar-client-side-solution",
    "id": "your-unique-guid-here",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "",
      "websiteUrl": "",
      "privacyUrl": "",
      "termsOfUseUrl": "",
      "mpnId": "Undefined-1.18.1"
    },
    "webApiPermissionRequests": [
      {
        "resource": "SharePoint",
        "scope": "AllSites.Read"
      }
    ],
    "metadata": {
      "shortDescription": { "default": "Team Calendar Web Part" },
      "longDescription": { "default": "Displays SharePoint calendar events" },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    },
    "features": []
  },
  "paths": {
    "zippedPackage": "solution/team-calendar.sppkg"
  }
}`,
      },
    ],
  },
];
