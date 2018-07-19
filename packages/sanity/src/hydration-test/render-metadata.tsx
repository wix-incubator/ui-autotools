import React from 'react';
import {renderToString} from 'react-dom/server';
import Registry from 'metadata-tools';

export function renderMetadata() {
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata, Comp) => {
    metadata.simulations.forEach(((simulation) => {
      renderedComps.push(renderToString(<Comp {...simulation.props} />));
    }));
  });

  return renderedComps;
}
