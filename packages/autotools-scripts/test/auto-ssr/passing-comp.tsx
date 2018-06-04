import * as React from 'react';

export interface Props {
  text?: string;
}

const TestComp: React.SFC<Props> = (props: Props) => {
  return <h1>Hey {props.text} person</h1>;
};

export {TestComp};