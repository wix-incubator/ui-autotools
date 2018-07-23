import React from 'react';
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';

Registry.getComponentMetadata(Composite)
  .addSim({
    props: {
      text: <i>Text</i>
    }
  });
