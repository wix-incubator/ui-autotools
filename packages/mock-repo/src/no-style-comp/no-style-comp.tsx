import React from 'react';

export interface IProps {
    text: string;
}

export default class NoStyleComp extends React.Component<IProps> {
  public static displayName = 'NoStyleComp';
  public render() {
    return <p>{this.props.text}</p>;
  }
}
