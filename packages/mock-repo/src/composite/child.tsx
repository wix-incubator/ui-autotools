import React from 'react';
export interface IProps {
  text: React.ReactNode;
  className?: string;
}

export const ChildComp: React.FunctionComponent<IProps> = (props) => <p>❦ {props.text} ❦</p>;
