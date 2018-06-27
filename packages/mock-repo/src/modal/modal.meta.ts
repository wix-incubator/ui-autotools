import Registry from 'metadata-tools';
import {Modal} from './modal';

// [ISSUE] this component needs to be a child of another component, and we
// have no ability to express this as a simulation.

Registry.getComponentMetadata(Modal)
  .addSim({
    props: {
      children: ['🧒', '👶', '🐊']
    }
  });
