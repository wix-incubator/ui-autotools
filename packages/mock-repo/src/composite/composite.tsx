import * as React from 'react';
import {ChildComp} from './child';
import style from './child.st.css';

export interface IProps {
  text?: React.ReactNode;
  className?: string;
}

export const Composite: React.SFC<IProps> = (props) =>
  <div  {...style('root', {}, props)}><ChildComp text={props.text} /></div>;

Composite.displayName = 'Composite';
