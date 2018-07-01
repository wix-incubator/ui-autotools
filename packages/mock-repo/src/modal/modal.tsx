import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IModalProps {
  children: React.ReactNode;
}

interface IModalState {
  root: HTMLElement | null;
}

export class Modal extends React.Component<IModalProps, IModalState> {
  public state: IModalState = {
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
