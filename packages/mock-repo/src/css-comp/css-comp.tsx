import React from 'react';

export interface IProps {
  text: string;
}

export default class CssComp extends React.Component<IProps> {
  public static displayName = 'CssComp';
  public render(): JSX.Element {
    return <p className="root">{this.props.text}</p>;
  }
}
