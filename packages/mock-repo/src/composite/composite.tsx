import React from 'react';
import { ChildComp } from './child';
import { style, classes } from './composite.st.css';

export interface IProps {
  text?: React.ReactNode;
  className?: string;
}

export interface IState {
  text?: React.ReactNode;
}

export class Composite extends React.Component<IProps, IState> {
  public static displayName: string;
  public state: IState = { text: '' };
  public listener = (): void => {
    /* */
  };

  public componentDidMount(): void {
    window.addEventListener('click', this.listener);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('click', this.listener);
  }

  public render(): JSX.Element {
    return (
      <div className={style(classes.root, this.props.className)}>
        <ChildComp text={this.state.text ? this.state.text : this.props.text} />
      </div>
    );
  }
}

Composite.displayName = 'Composite';
