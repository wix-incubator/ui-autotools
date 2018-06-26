import { expect } from 'chai';
import autoSSRTest from './auto-ssr-fixtures/mocha-wrapper';
import {TestComp} from './auto-ssr-fixtures/passing-comp';
import {FailingTestComp} from './auto-ssr-fixtures/failing-comp';
import Registry from 'metadata-tools';

describe('AutoSSR', () => {
  beforeEach(() => {
    Registry.clear();
  });

  it('should pass with a valid component', (done) => {
    Registry.getComponentMetadata(TestComp);
    autoSSRTest((flag) => {
      expect(flag, 'Test did not pass with valid component').to.equal(1);
      done();
    });
  });

  it('should fail with an invalid component', (done) => {
    Registry.getComponentMetadata(FailingTestComp);
    autoSSRTest((flag) => {
      expect(flag, 'Test did not fail with invalid component').to.equal(-1);
      done();
    });
  });
});
