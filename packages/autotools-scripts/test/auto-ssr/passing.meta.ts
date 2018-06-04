import {TestComp} from './passing-comp';
import Registry from 'metadata-tools';

const myMetadata = Registry.describe(TestComp);

myMetadata.addSim({text: 'cool'});
