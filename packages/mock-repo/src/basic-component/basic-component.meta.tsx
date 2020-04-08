import React from 'react';
import Registry from '@ui-autotools/registry';
import { BasicComponent } from './basic-component';

const metadata = Registry.getComponentMetadata(BasicComponent);

metadata.exportInfo = {
  path: 'src/basic-component/basic-component',
  exportName: 'BasicComponent',
  baseStylePath: 'src/basic-component/basic-component.st.css',
};

metadata.addSim({
  title: 'firstSim',
  props: {
    text: <i>Text</i>,
  },
});

metadata.addSim({
  title: 'secondSim',
  props: {
    text: <i>I'm another sim</i>,
  },
});
