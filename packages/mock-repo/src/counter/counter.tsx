import * as React from 'react';

interface IState {
  count: number;
}

export class Counter extends React.Component<{}, IState> {
  public static displayName: string = 'Counter';
  public state = { count: 0 };

  public render() {
    const myOnClick = this.onClick.bind(this);
    return (
      <button onClick={myOnClick}>
        Click me: {this.state.count}
      </button>
    );
  }

  private onClick() {
    this.setState({count: this.state.count + 1});
  }
}
