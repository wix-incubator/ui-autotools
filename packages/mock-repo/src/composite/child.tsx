import * as React from 'react';

export interface Props {
  text: string;
}

export const ChildComp: React.SFC<Props> = (props: Props) => {
  return <h1>{props.text}</h1>;
};
