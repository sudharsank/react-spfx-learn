export interface DeployStep {
  title: string;
  description: string;
  command?: string;
  adminNote?: string;
}

export interface DeployLab {
  slug: string;
  title: string;
  description: string;
  steps: DeployStep[];
}

export const DEPLOY_LABS: DeployLab[] = [
  {
    slug: 'tenant-deploy',
    title: 'Deploy to Tenant App Catalog',
    description: 'Walk through the full pipeline: build your web part, upload to the App Catalog, approve permissions, and add to a SharePoint site.',
    steps: [
      {
        title: 'Build the production bundle',
        description: 'Run the production build to generate the minified bundle. This creates the .sppkg file in the sharepoint/solution/ folder.',
        command: 'heft build --production && gulp bundle --ship && gulp package-solution --ship',
        adminNote: 'The --ship flag enables production optimizations. Your .sppkg will be in sharepoint/solution/.',
      },
      {
        title: 'Upload .sppkg to Tenant App Catalog',
        description: 'Go to your SharePoint Admin Center → Apps → App Catalog → Apps for SharePoint. Click Upload and select your .sppkg file. When prompted, check "Make this solution available to all sites in the organization" for tenant-wide deployment.',
        adminNote: 'You need SharePoint Admin or Global Admin privileges for this step.',
      },
      {
        title: 'Approve API permissions',
        description: 'In the SharePoint Admin Center, go to Advanced → API access. Your pending permission requests from webApiPermissionRequests in package-solution.json appear here. Approve each one.',
        adminNote: 'If no permissions appear, your web part does not request API access — skip this step.',
      },
      {
        title: 'Add the web part to a site',
        description: 'If you did NOT use tenant-wide deployment, go to the target SharePoint site → Site Contents → Add an app → find your solution and install it. For tenant-wide, the web part is already available in every site.',
      },
      {
        title: 'Add the web part to a page',
        description: 'Edit a SharePoint page → click the + button to add a web part → find your web part by name in the web part picker → select it. Configure properties in the property pane on the right. Save and publish the page.',
        adminNote: 'The web part may take up to 5 minutes to appear in the picker after deployment.',
      },
    ],
  },
  {
    slug: 'update-version',
    title: 'Update and Redeploy',
    description: 'Update your web part version, rebuild, re-upload, and verify the update propagates to existing pages.',
    steps: [
      {
        title: 'Bump the version in package-solution.json',
        description: 'Open config/package-solution.json. Increment the "version" field (e.g. "1.0.0.0" → "1.1.0.0"). SharePoint uses this version to detect updates.',
        command: '# Edit config/package-solution.json manually\n# Change "version": "1.0.0.0" to "version": "1.1.0.0"',
      },
      {
        title: 'Also bump the version in package.json',
        description: 'Open package.json at the project root. Update "version" to match (e.g. "1.1.0"). Keeping both in sync prevents confusion.',
        command: 'npm version minor --no-git-tag-version',
      },
      {
        title: 'Rebuild and repackage',
        description: 'Run the full production build again to generate a new .sppkg with the updated version.',
        command: 'heft build --production && gulp bundle --ship && gulp package-solution --ship',
      },
      {
        title: 'Re-upload to App Catalog',
        description: 'Upload the new .sppkg to the App Catalog. When prompted to replace the existing solution, click Replace. SharePoint will push the update to all sites automatically (for tenant-wide deployments).',
        adminNote: 'Pages already using the web part get the update automatically. No need to re-add the web part to pages.',
      },
      {
        title: 'Verify the update',
        description: 'Go to a page using your web part and do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). Open the browser devtools Network tab, filter by your bundle name, and confirm the response headers show the new version.',
      },
    ],
  },
];
