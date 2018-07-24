import * as React from 'react';
import { expect } from 'chai';
import ssrTest from './ssr-test-fixtures/mocha-wrapper';
import Registry from '@ui-autotools/registry';

interface IProps {
  text?: string;
}

const TestComp: React.SFC<IProps> = (props: IProps) => {
  return <h1>Hey {props.text} person</h1>;
};

TestComp.displayName = 'Test Comp';

const FailingTestComp: React.SFC = () => {
  const accessDocument = () => {
    document.createElement('div');
  };

  accessDocument();
  return null;
};

FailingTestComp.displayName = 'Failing Test Comp';

describe('SSR Test', () => {
  beforeEach(() => {
    Registry.clear();
  });

  it('should pass with a valid component', (done) => {
    Registry.getComponentMetadata(TestComp);
    ssrTest((flag) => {
      expect(flag, 'Test did not pass with valid component').to.equal(1);
      done();
    });
  }).timeout(3000);

  it('should fail with an invalid component', (done) => {
    Registry.getComponentMetadata(FailingTestComp);
    ssrTest((flag) => {
      expect(flag, 'Test did not fail with invalid component').to.equal(-1);
      done();
    });
  }).timeout(3000);
});
