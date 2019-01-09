import React from 'react';
import Registry from '@ui-autotools/registry';
import {BasicComposite} from './basicComposite';

const metadata = Registry.getComponentMetadata(BasicComposite);

metadata.exportedFrom({
  path: 'src/basicComposite/basicComposite',
  exportName: 'BasicComposite',
  baseStylePath: 'src/basicComposite/basicComposite.st.css'
});

metadata.addSim({
  title: 'compositeSim',
  props: {
    text: <i>Text</i>
  },
  state: {
    text: 'STATE OVERRIDE'
  }
});

metadata.addSim({
  title: 'secondSim',
  props: {
    text: <i>I'm another sim</i>
  }
});
