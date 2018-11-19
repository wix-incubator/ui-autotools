import React from 'react';

export class UnmountedEvent extends React.Component {
  public listener() { return; }

  public componentDidMount() {
    window.addEventListener('click', this.listener);
  }

  public render() {
    return <div />;
  }
}
