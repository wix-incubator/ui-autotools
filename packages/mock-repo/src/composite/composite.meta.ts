import Registry from 'metadata-tools';
import {ParentComp} from './composite';

Registry.getComponentMetadata(ParentComp)
  .addSim({
    props: {}
  });
