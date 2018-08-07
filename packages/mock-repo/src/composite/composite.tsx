import * as React from 'react';
import {ChildComp} from './child';

export interface IProps {
  text?: React.ReactNode;
}

export const Composite: React.SFC<IProps> = (props) =>
  <div><ChildComp text={props.text} /></div>;

Composite.displayName = 'Composite';
