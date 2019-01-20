import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { generateSnapshotFilename } from './filename-utils';
import { writeDataToFs } from './write-data-to-fs';
import { consoleLog } from '@ui-autotools/utils';
import { IFileInfo } from './build-base-files';
import { IComponentMetadata, IRegistry } from '@ui-autotools/registry';

export const generateSnapshots2 = async (projectDir: string, tempDirectory: string, Registry: IRegistry) => {
    const files: IFileInfo[] = [];
    consoleLog('Generating snapshots...');
    Registry.metadata.components.forEach((componentMetadata) => {
        const simIndex = componentMetadata.simulations.length;
        const compName = componentMetadata.exportName;

        if (compName) {
            for (let i = 0; i < simIndex; i++) {
                const simulationName = componentMetadata.simulations[i].title;
                const basename = generateSnapshotFilename(compName, simulationName, i);
                const filepath = path.join(tempDirectory, basename + '.snapshot.ts');
                const data = createHtml(projectDir, componentMetadata, componentMetadata.simulations[i].props);
                files.push({ basename, filepath, data });
            }
        }
    });

    writeDataToFs(files);
    return files;
};

const createHtml = (projectDir: string, compMetadata: IComponentMetadata<any, any>, props: any) => {
    if (!compMetadata.compPath) {
        throw new Error(`Component ${compMetadata.exportName} has no path`);
    }
    const comp = require(path.join(projectDir, compMetadata.compPath)).default;
    const cssLink = compMetadata.cssPath ? `<link rel="stylesheet" type="text/css" href="${path.join(projectDir, compMetadata.cssPath)}.css">` : '';
    const componentString = renderToStaticMarkup(React.createElement(comp, props));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>${compMetadata.exportName}</title>
      ${cssLink}
    </head>
    <body>
      ${componentString}
    </body>
    </html>`;
};
