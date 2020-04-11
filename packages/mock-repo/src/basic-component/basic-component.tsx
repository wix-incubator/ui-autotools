import React from 'react';
import { style, classes } from './basic-component.st.css';

export interface IProps {
  text?: React.ReactNode;
  className?: string;
}

export class BasicComponent extends React.Component<IProps> {
  public static displayName: string;
  public listener() {
    return;
  }

  public componentDidMount() {
    window.addEventListener('click', this.listener);
  }

  public componentWillUnmount() {
    window.removeEventListener('click', this.listener);
  }

  public render() {
    return <div className={style(classes.root, {}, this.props.className)}>{this.props.text}</div>;
  }
}

BasicComponent.displayName = 'BasicComponent';
