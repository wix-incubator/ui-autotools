import * as React from 'react';
import {ChildComp} from './child';

export const ParentComp: React.SFC = () => {
  return <div><ChildComp text="This is the child" /></div>;
};
