import * as React from 'react';
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';
import style1 from './variant1.st.css';
import style2 from './variant2.st.css';

const metadata = Registry.getComponentMetadata(Composite);

metadata.exportedFrom({
  path: 'src/composite/composite',
  importName: 'Composite',
  baseStylePath: 'src/composite/child.st.css',
  displayName: 'Composite'
});

metadata.addSim({
  title: 'compositeSim',
  props: {
    text: <i>Text</i>
  }
});

metadata.addSim({
  title: 'secondSim',
  props: {
    text: <i>I'm another sim</i>
  }
});

metadata.addStyle(style1, {name: 'style1', path: 'src/composite/variant1.st.css'});
metadata.addStyle(style2, {name: 'style2', path: 'src/composite/variant2.st.css'});
