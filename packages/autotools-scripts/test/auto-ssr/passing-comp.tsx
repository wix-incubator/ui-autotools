import * as React from 'react';

export interface IProps {
  text?: string;
}

const TestComp: React.SFC<IProps> = (props: IProps) => {
  return <h1>Hey {props.text} person</h1>;
};

export {TestComp};
