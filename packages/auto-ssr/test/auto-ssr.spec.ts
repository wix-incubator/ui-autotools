import { expect } from 'chai';
import autoSSRTest from './auto-ssr-fixtures/mocha-wrapper';
import {TestComp} from './auto-ssr-fixtures/passing-comp';
import {FailingTestComp} from './auto-ssr-fixtures/failing-comp';
import Registry from 'metadata-tools';

describe('AutoSSR', () => {
  beforeEach(() => {
    Registry.clear();
  });

  it('should pass with a valid component', async () => {
    Registry.getComponentMetadata(TestComp);
    await autoSSRTest((passing) => expect(passing).to.equal(1)); // Passing
  });

  it('should fail with an invalid component', () => {
    Registry.getComponentMetadata(FailingTestComp);
    autoSSRTest((passing) => expect(passing).to.equal(1)); // Failing
  });
});
