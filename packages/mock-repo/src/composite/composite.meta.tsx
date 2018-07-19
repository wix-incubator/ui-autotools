import React from 'react';
import Registry from 'metadata-tools';
import {Composite} from './composite';

Registry.getComponentMetadata(Composite)
  .addSim({
    props: {
      text: <i>Text</i>
    }
  });
