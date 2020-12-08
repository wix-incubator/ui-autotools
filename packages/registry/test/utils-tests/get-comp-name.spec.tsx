import { expect } from 'chai';
import React from 'react';
import { getCompName } from '@ui-autotools/registry';
import { DefaultNameComp, TestComp } from '../fixtures/component-fixtures';

describe('getCompName', () => {
  it('should return the "displayName" property first, if it exists', () => {
    TestComp.displayName = 'ReturningTheDisplayName';

    expect(getCompName(TestComp)).to.equal('ReturningTheDisplayName');
  });

  it('should return the "name" property, if displayName does not exist', () => {
    expect(getCompName(DefaultNameComp)).to.equal('DefaultNameComp');
  });

  it('should return an empty string if the component has no name', () => {
    expect(getCompName(() => <h1>why has my creator cursed me with a nameless existence</h1>)).to.equal('');
  });
});
