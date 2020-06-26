import React from 'react';
import Registry from '@ui-autotools/registry';

export interface PassingCompProps {
  text?: string;
}

export const PassingComp: React.FC<PassingCompProps> = ({ text = '' }) => {
  return <h1>Hey {text} person</h1>;
};

PassingComp.displayName = 'PassingComp';

const meta = Registry.getComponentMetadata(PassingComp);

meta.addSim({
  title: 'PassingComp Simulation',
  props: {
    text: 'wow',
  },
});
