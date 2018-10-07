import * as React from 'react';
import style from './child.st.css';
export interface IProps {
  text: React.ReactNode;
  className?: string;
}

export const ChildComp: React.SFC<IProps> = (props) =>
  <p {...style('root', {}, props)}>❦ {props.text} ❦</p>;
