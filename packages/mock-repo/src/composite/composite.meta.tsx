import React from 'react';
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';

Registry.getComponentMetadata(Composite)
  .addSim({
    title: 'compositeSim',
    props: {
      text: <i>Text</i>
    }
  });
