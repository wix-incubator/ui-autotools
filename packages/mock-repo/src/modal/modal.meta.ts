import Registry from 'ui-autotools-registry';
import {Modal} from './modal';

Registry.getComponentMetadata(Modal)
  .addSim({
    props: {
      children: ['🧒', '👶', '🐊']
    }
  });
