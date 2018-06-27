import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
}

interface ModalState {
  root: HTMLElement | null;
}

export class Modal extends React.Component<ModalProps, ModalState> {
  public state: ModalState = {
    root: null
  };

  public componentDidMount() {
    this.setState({root: document.body});
  }

  public render() {
    const {root} = this.state;

    return root ?
      ReactDOM.createPortal(this.props.children, root) :
      null;
  }
}
