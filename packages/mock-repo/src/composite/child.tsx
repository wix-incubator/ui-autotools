import React from 'react';
export interface IProps {
  text: React.ReactNode;
  className?: string;
}

export const ChildComp: React.SFC<IProps> = (props) =>
  <p>❦ {props.text} ❦</p>;
