import React from 'react';
import { expect } from 'chai';
import ssrTest from './ssr-test-fixtures/mocha-wrapper';
import Registry from '@ui-autotools/registry';

interface IProps {
  text?: string;
}

const TestComp: React.FunctionComponent<IProps> = (props: IProps) => {
  return <h1>Hey {props.text} person</h1>;
};

TestComp.displayName = 'TestComp';

const FailingTestComp: React.FunctionComponent = () => {
  const accessDocument = () => {
    document.createElement('div');
  };

  accessDocument();
  return null;
};

FailingTestComp.displayName = 'FailingTestComp';

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
  }).timeout(15000);

  it('should fail with an invalid component', (done) => {
    Registry.getComponentMetadata(FailingTestComp);
    ssrTest((flag) => {
      expect(flag, 'Test did not fail with invalid component').to.equal(-1);
      done();
    });
  }).timeout(15000);
});
