import React from 'react';
import { classes, style } from './base-style.st.css';

export interface IProps {
  className?: string;
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
      <div className={style(classes.root, this.props.className)}>
        Props: {this.props.propsLabel}, State: {this.state.stateLabel}
      </div>
    );
  }
}
