import React from 'react';

interface ITestProps {
  text: string;
}

export const TestComp: React.FunctionComponent<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

TestComp.displayName = 'TestComp';

export const CopyCatTestComp: React.FunctionComponent<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

CopyCatTestComp.displayName = 'TestComp';

export const InvalidNameComp: React.FunctionComponent = () => {
  return <h1>Heyperson</h1>;
};

InvalidNameComp.displayName = '$$$JQuery Yeah$$$';

export function DefaultNameComp() {
  return <h1>I'm just going with my default name, not trying to be special or nothin'</h1>;
}
