import React from 'react';
import ReactDOM from 'react-dom';

export interface IModalProps {
  children: React.ReactNode;
}

export interface IModalState {
  root: HTMLElement | null;
}

export class Modal extends React.Component<IModalProps, IModalState> {
  public static displayName = 'Modal';

  public state: IModalState = {
    root: null,
  };

  public componentDidMount() {
    this.setState({ root: document.body });
  }

  public render() {
    const { root } = this.state;

    return root ? ReactDOM.createPortal(this.props.children, root) : null;
  }
}
