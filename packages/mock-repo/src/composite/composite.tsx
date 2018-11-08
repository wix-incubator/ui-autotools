import React from 'react';
import {ChildComp} from './child';
import style from './composite.st.css';

export interface IProps {
  text?: React.ReactNode;
  className?: string;
}

export interface IState {
  text?: React.ReactNode;
}

export class Composite extends React.Component<IProps, IState> {
  public static displayName: string;
  public state: IState = {text: ''};
  public listener() { return; }

  public componentDidMount() {
    window.addEventListener('click', this.listener);
  }

  public componentWillUnmount() {
    window.removeEventListener('click', this.listener);
  }

  public render() {
    return <div {...style('root', {}, this.props)}><ChildComp text={this.state.text ? this.state.text : this.props.text} /></div>;
  }
}

Composite.displayName = 'Composite';
