import * as React from 'react';
import {getCompName} from '../../src';
import {expect} from 'chai';
import {DefaultNameComp, TestComp} from '../fixtures/component-fixtures';

describe('getCompName', () => {
  it('should return the "displayName" property first, if it exists', () => {
    TestComp.displayName = 'Returning the displayName';

    expect(getCompName(TestComp)).to.equal('Returning the displayName');
  });

  it('should return the "name" property, if displayName does not exist', () => {
    expect(getCompName(DefaultNameComp)).to.equal('DefaultNameComp');
  });

  it('should return an empty string if the component has no name', () => {
    expect(getCompName(() => <h1>why has my creator cursed me with a nameless existence</h1>)).to.equal('');
  });
});
