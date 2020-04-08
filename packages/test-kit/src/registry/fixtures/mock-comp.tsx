import React from 'react';
import style from './base-style.st.css';

export interface IProps {
  propsLabel: string;
}

export interface IState {
  stateLabel: string;
}

export class MockComp extends React.Component<IProps, IState> {
  public static displayName = 'MockComp';

  public state: IState = {
    stateLabel: 'initial state',
  };

  public render() {
    return (
      <div {...style('root', {}, this.props)}>
        Props: {this.props.propsLabel}, State: {this.state.stateLabel}
      </div>
    );
  }
}
