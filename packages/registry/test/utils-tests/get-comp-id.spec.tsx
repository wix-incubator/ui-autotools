import React from 'react';
import {getCompId} from '../../src';
import {expect} from 'chai';
import {DefaultNameComp} from '../fixtures/component-fixtures';

describe('getCompId', () => {
  it('should return the "displayName" property first, if it exists', () => {
    const Comp = () => <h1>Hey person</h1>;

    Comp.displayName = 'ReturningTheDisplayName';

    expect(getCompId(Comp)).to.equal('ReturningTheDisplayName');
  });

  it('should return the "name" property, if displayName does not exist', () => {
    expect(getCompId(DefaultNameComp)).to.equal('DefaultNameComp');
  });

  it('should return an empty string if the component has no name', () => {
    expect(getCompId(() => <h1>why has my creator cursed me with a nameless existence</h1>)).to.equal('');
  });
});
