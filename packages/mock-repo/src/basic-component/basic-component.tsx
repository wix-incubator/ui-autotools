import React from 'react';
import { style, classes } from './basic-component.st.css';

export interface IProps {
  text?: React.ReactNode;
  className?: string;
}

export class BasicComponent extends React.Component<IProps> {
  public static displayName: string;
  public listener = (): void => {
    /**/
  };

  public componentDidMount(): void {
    window.addEventListener('click', this.listener);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('click', this.listener);
  }

  public render(): JSX.Element {
    return <div className={style(classes.root, this.props.className)}>{this.props.text}</div>;
  }
}

BasicComponent.displayName = 'BasicComponent';
