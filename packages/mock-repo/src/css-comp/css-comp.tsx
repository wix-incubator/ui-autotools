import React from 'react';

export interface IProps {
    text: string;
}

export default class NoStyleComp extends React.Component<IProps> {
  public static displayName = 'CssComp';
  public render() {
    return <p className="root">{this.props.text}</p>;
  }
}
