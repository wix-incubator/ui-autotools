import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface PortalProps {
  children: any;
  root: any;
}

export class Portal extends React.Component<PortalProps> {
  private container: HTMLElement;

  constructor(props: PortalProps) {
    super(props);
    this.container = document.createElement('div');
  }

  public componentDidMount() {
    this.props.root.appendChild(this.container);
  }

  public componentWillUnmount() {
    this.props.root.removeChild(this.container);
  }

  public render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.container
    );
  }
}
