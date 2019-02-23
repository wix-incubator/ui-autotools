import path from 'path';
import { ISnapshot, ISnapInfo, ISnapPlugin, ICompSnapInfo, ISnapConfig } from './types';
import Registry from '@ui-autotools/registry';
import { eyesKeyExists } from './utils';
import { consoleLog } from '@ui-autotools/utils';
import { runEyes } from './applitools/send-snapshots-to-applitools';

const runComponentAndSimHooks = async (snapInfo: ISnapInfo, plugin: ISnapPlugin): Promise<void> => {
  // Iterate first over the component metadata, and then over the simulations for each component. Each hook may modify files
  for (const [, componentMetadata] of Registry.metadata.components) {
    const compSnapInfo = {...snapInfo, componentMetadata};

    if (plugin.componentHook) {
      await plugin.componentHook(compSnapInfo);
    }

    await runSimulationHooks(compSnapInfo, plugin);
  }
};

const runSimulationHooks = async (compSnapInfo: ICompSnapInfo, plugin: ISnapPlugin): Promise<void> => {
  for (const simulation of compSnapInfo.componentMetadata.simulations) {
    if (plugin.simulationHook) {
      await plugin.simulationHook({...compSnapInfo, simulation});
    }
  }
};

const getFileCollector = (fileCollection: ISnapshot[]): (fileToAdd: ISnapshot) => void => {
  return (fileToAdd: ISnapshot) => {
    fileCollection.push(fileToAdd);
  };
};

export async function eyesTest(projectPath: string, skipOnMissingKey: boolean, configFile: string = 'snap.config.js') {
  const config: ISnapConfig = require(path.join(projectPath, '.autotools', configFile));
  try {
    if (eyesKeyExists()) {
      const snapshotFiles: ISnapshot[] = [];
      const fileCollector = getFileCollector(snapshotFiles);
      const snapInfo: ISnapInfo = {Registry, projectPath, collectSnapshot: fileCollector};

      for (const plugin of config.plugins) {
        if (plugin.projectHook) {
          await plugin.projectHook(snapInfo);
        }

        await runComponentAndSimHooks(snapInfo, plugin);
      }

      if (snapshotFiles.length > 0) {
        await runEyes(projectPath, snapshotFiles);
      } else {
        throw new Error('No snapshots found. This is probably an issue with a plugin failing to generate or return snapshots.');
      }

      for (const plugin of config.plugins) {
        if (plugin.afterHook) {
          await plugin.afterHook(snapInfo, snapshotFiles);
        }
      }
    } else if (skipOnMissingKey) {
      consoleLog('The "--skip-on-missing-key" flag was set to true, and no API key exists, so snap is skipping the eyes test.');
    } else {
      throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
    }
  } catch (e) {
    consoleLog(e);
  }
}
