import React from 'react';

export interface IState {
  label: string;
}

export class PostRenderHook extends React.Component<{}, IState> {
  public static displayName = 'PostRenderHook';

  public state: IState = {
    label: 'Label failed to change',
  };

  public componentDidMount(): void {
    this.setState({ label: 'I mounted and changed my label' });
  }

  public render(): JSX.Element {
    return <p>{this.state.label}</p>;
  }
}
