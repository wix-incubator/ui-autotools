import React from 'react';
import Registry from '@ui-autotools/registry';
import { Composite } from './composite';
import style1 from './variant1.st.css';
import style2 from './variant2.st.css';

const metadata = Registry.getComponentMetadata(Composite);

metadata.exportInfo = {
  path: 'src/composite/composite',
  exportName: 'Composite',
  baseStylePath: 'src/composite/composite.st.css',
};

metadata.addSim({
  title: 'compositeSim',
  props: {
    text: <i>Text</i>,
  },
  state: {
    text: 'STATE OVERRIDE',
  },
});

metadata.addSim({
  title: 'secondSim',
  props: {
    text: <i>I&apos;m another sim</i>,
  },
});

metadata.addStyle(style1, { name: 'style1', path: 'src/composite/variant1.st.css' });
metadata.addStyle(style2, { name: 'style2', path: 'src/composite/variant2.st.css' });
