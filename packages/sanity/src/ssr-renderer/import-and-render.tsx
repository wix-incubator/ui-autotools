import glob from 'glob';
import React from 'react';
import {renderToString} from 'react-dom/server';
import Registry from 'metadata-tools';

const importMetadata = (globPattern: any) => {
  const options = {
    nosort: true,
    matchBase: true,
    absolute: true,
  };
  const defaultPattern = './**/*.meta.ts[x?]';

  const files = glob.sync(globPattern || defaultPattern, options);

  files.map((file: any) => {
    require(file);
  });
};

export function importAndRenderMetadata(globPattern: string) {
  importMetadata(globPattern);
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata, Comp) => {
    metadata.simulations.forEach(((simulation) => {
      renderedComps.push(renderToString(<Comp {...simulation.props} />));
    }));
  });

  return renderedComps;
}
