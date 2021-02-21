import React from 'react';

interface IState {
  count: number;
}

export class Counter extends React.Component<{}, IState> {
  public static displayName = 'Counter';
  public state = { count: 0 };

  public render(): JSX.Element {
    return <button onClick={this.onClick}>Click me: {this.state.count}</button>;
  }

  private onClick = () => {
    this.setState({ count: this.state.count + 1 });
  };
}
