import Registry from 'metadata-tools';
import {Portal} from './portal';

// [ISSUE] this component needs to be a child of another component, and we
// have no ability to express this as a simulation.

Registry.getComponentMetadata(Portal)
  .addSim({
    props: {
      children: ['🧒', '👶', '🐊'],
      root: document.body
    }
  });
