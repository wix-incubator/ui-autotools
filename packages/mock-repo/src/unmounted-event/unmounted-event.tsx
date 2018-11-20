import React from 'react';

export class UnmountedEvent extends React.Component {
  public displayName: string = 'UnmountedEvent';
  public listener() { return; }

  public componentDidMount() {
    window.addEventListener('click', this.listener);
  }

  public render() {
    return <div />;
  }
}
