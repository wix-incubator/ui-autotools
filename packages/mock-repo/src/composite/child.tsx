import * as React from 'react';

export interface IProps {
  text: string;
}

export const ChildComp: React.SFC<IProps> = (props) => <h1>{props.text}</h1>;
