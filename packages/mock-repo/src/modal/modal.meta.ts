import Registry from 'metadata-tools';
import {Modal} from './modal';

Registry.getComponentMetadata(Modal)
  .addSim({
    props: {
      children: ['🧒', '👶', '🐊']
    }
  });
