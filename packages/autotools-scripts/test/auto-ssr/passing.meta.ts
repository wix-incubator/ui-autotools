import Registry from 'metadata-tools';
import {TestComp} from './passing-comp';

const myMetadata = Registry.describe(TestComp);

myMetadata.addSim({props: {text: 'cool'}});
