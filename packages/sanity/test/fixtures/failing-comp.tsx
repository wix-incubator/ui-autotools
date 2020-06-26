import React from 'react';
import Registry from '@ui-autotools/registry';

export const FailingComp: React.FC = () => {
  document.createElement('div');
  return null;
};

FailingComp.displayName = 'FailingComp';

const meta = Registry.getComponentMetadata(FailingComp);

meta.addSim({
  title: 'FailingComp Simulation',
  props: {},
});
