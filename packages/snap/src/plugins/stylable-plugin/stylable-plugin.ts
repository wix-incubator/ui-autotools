import path from 'path';
import fs from 'fs';
import { consoleLog, consoleError } from '@ui-autotools/utils';
import { createTempFolder, ITempFolder } from '../../utils/create-autotools-folder';
import { generateSnapshotFilename, generateData, parseSnapshotFilename } from '../../utils/filename-utils';
import { generateSnapshots } from './generate-snapshots';
import { ISnapInfo, ISimSnapInfo, ISnapPlugin, ISnapshot, ISnapResource } from '../../types';

const htmlReturner = (returnHtml: (html: string) => void): (html: string) => void => {
  return (html: string) => {
    returnHtml(html);
  };
};

const formatName = (filename: string) => {
  const {compName, simName, styleName} = parseSnapshotFilename(filename);

  return styleName ? `${compName}: ${simName}. Style: ${styleName}.` : `${compName}: ${simName}.`;
};

export class StylableSnapPlugin implements ISnapPlugin {
  constructor(private baseFilesDir: ITempFolder) {}

  public projectHook = async (snapInfo: ISnapInfo): Promise<any> => {
    consoleLog('Building base files...');
    this.baseFilesDir = await createTempFolder(snapInfo.projectPath);
  }

  public simulationHook = async (simInfo: ISimSnapInfo): Promise<void> => {
    // Not a Stylable component
    const componentMetadata = simInfo.componentMetadata;
    if (!componentMetadata.exportInfo) { return; }
    if (!componentMetadata.exportInfo.baseStylePath) { return; }

    const autotoolsFolder = this.baseFilesDir.path;
    const stylePathPrefix = '../../'; // We're two folders deep in .autotools
    const compPathPrefix = '../../';

    const styles = componentMetadata.styles;

      // See below comment
    const compPath =  componentMetadata.exportInfo.path ? path.join(compPathPrefix, componentMetadata.exportInfo.path) : '';
    const compName = componentMetadata.exportInfo.exportName;
    const simulationName = simInfo.simulation.title;

    if (compName && compPath) {
      try {
        if (styles.size) {
          for (const [, value] of styles) {
            const stylePath = path.join(stylePathPrefix, value.path);
            const basename = generateSnapshotFilename(compName, simulationName, value.name);
            const testName = formatName(basename);
            const filepath = path.join(autotoolsFolder, basename + '.snapshot.ts');
            const data = generateData(compName, compPath, stylePath);
            const file = [{basename, filepath}];
            fs.writeFileSync(filepath, data);
            // The "double snapshot" is necessary because we need a way to identify the base files
            // (so we use *.snapshot.ts), but then the "HTMLSnapshotPlugin" we use to generate snapshots
            // appends ".snapshot.html" to the name of the file it used to create a snapshot, so we end up
            // duplicating snapshot twice. Needs to be fixed...
            let snapshotData;
            await generateSnapshots(simInfo.projectPath, this.baseFilesDir.path, file, simInfo, htmlReturner((html) => snapshotData = html));

            const cssFileName = `${basename}.css`;
            const cssData = fs.readFileSync(path.join(autotoolsFolder, cssFileName));
            const cssResource: ISnapResource = {
              data: cssData,
              url: cssFileName,
              mimeType: '	text/css'
            };

            if (snapshotData) {
              const snapshot: ISnapshot = {testName, html: snapshotData, staticResources: [cssResource]};
              simInfo.collectSnapshot(snapshot);
            }
          }
        } else {
          // We only want to render the base style if there are no other style variants
          const stylePath = path.join(stylePathPrefix, componentMetadata.exportInfo.baseStylePath!);
          const basename = generateSnapshotFilename(compName, simulationName);
          const testName = formatName(basename);
          const filepath = path.join(autotoolsFolder, basename + '.snapshot.ts');
          const data = generateData(compName, compPath, stylePath);
          const file = [{basename, filepath}];
          fs.writeFileSync(filepath, data);

          let snapshotData;
          await generateSnapshots(simInfo.projectPath, this.baseFilesDir.path, file, simInfo, htmlReturner((html) => snapshotData = html));

          const cssFileName = `${basename}.css`;
          const cssData = fs.readFileSync(path.join(autotoolsFolder, cssFileName));
          const cssResource: ISnapResource = {
            data: cssData,
            url: cssFileName,
            mimeType: '	text/css'
          };

          if (snapshotData) {
            const snapshot: ISnapshot = {testName, html: snapshotData, staticResources: [cssResource]};
            simInfo.collectSnapshot(snapshot);
          }
        }
      } catch (e) {
        consoleError(e);
      }
    }
  }

  public afterHook = async (_snapInfo: ISnapInfo, _files: ISnapshot[]): Promise<void> => {
    this.baseFilesDir.destroy();
  }
}
