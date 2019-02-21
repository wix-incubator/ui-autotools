import path from 'path';
import fs from 'fs';
import util from 'util';
import React from 'react';
import { exec } from 'child_process';
import { createHtml, ISnapResource } from '@ui-autotools/snap';
import { renderToStaticMarkup } from 'react-dom/server';
import { ISimSnapInfo, ISnapPlugin, ISnapshot } from '@ui-autotools/snap';
import { consoleLog } from '@ui-autotools/utils';

const asyncExec = util.promisify(exec);

export class MockRepoPlugin implements ISnapPlugin {
  /**
   * This is the key for a custom field in the metadata
   * where we'll store any information we need for this plugin
   */
  public static metadataKey = 'MockRepoPluginInfo';

  /**
   * Project hooks are run at the beginning of Snap execution. This is where
   * we'll do any necessary setup. In this case, we want to build the project.
   */
  public projectHook  = async (): Promise<void> => {
    try {
      const {stdout} = await asyncExec('yarn build');
      if (stdout) { consoleLog('stdout:', stdout); }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Sim hooks are run for every simulation. This is where we'll generate a snapshot per simulation.
   */
  public simulationHook = async (simInfo: ISimSnapInfo): Promise<void> => {
    const componentMetadata = simInfo.componentMetadata;
    // Get the metadata's customField for our MockRepoPlugin
    const mockRepoPluginMetadata = componentMetadata.customFields[MockRepoPlugin.metadataKey];

    /**
     * We only want to create snapshots for components that have specified the correct info
     * in their metadata file.
     */
    if (!mockRepoPluginMetadata) { return; }

    // Get the path to the compiled component
    const compPath = mockRepoPluginMetadata.compPath;
    const compName = componentMetadata.exportInfo.exportName;
    const simulationName = simInfo.simulation.title;
    const testName = `${compName}: ${simulationName}`;
    const comp = require(path.join(simInfo.projectPath, compPath)).default;
    const compRenderedToString = renderToStaticMarkup(React.createElement(comp, simInfo.simulation.props));

    const compStaticResources = componentMetadata.staticResources ? componentMetadata.staticResources : [];
    const simStaticResources = simInfo.simulation.staticResources ? simInfo.simulation.staticResources : [];
    const staticResources = [...compStaticResources, ...simStaticResources];
    const snapshotResources: ISnapResource[] = [];
    const links: string[] = [];

    /**
     * Components may have resources, which we need to read from disk so that our snaphsot files can reference
     * the resources in tests.
     */
    if (staticResources) {
      for (const resource of staticResources) {
        snapshotResources.push({
          url: resource.url,
          mimeType: resource.mimeType,
          data: fs.readFileSync(path.join(simInfo.projectPath, resource.path))
        });

        if (resource.mimeType === 'text/css') {
          // Then we want to include a link in the head
          links.push(`<link rel="stylesheet" type="text/css" href="${encodeURI(resource.url)}">`);
        }
      }
    }

    const html = createHtml(compRenderedToString, links, simulationName);
    const snapshot: ISnapshot = {html, testName, staticResources: snapshotResources};

    /**
     * Snap provides a method which we can call with one or more files. Snap stores these files,
     * and only sends them to Applitools after every component and simulation hook has run
     */
    simInfo.collectSnapshot(snapshot);
  }
}
