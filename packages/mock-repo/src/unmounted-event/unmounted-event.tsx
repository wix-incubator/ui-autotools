import React from 'react';

export class UnmountedEvent extends React.Component {
  public displayName = 'UnmountedEvent';

  public componentDidMount(): void {
    window.addEventListener('click', () => {
      /**/
    });
  }

  public render(): JSX.Element {
    return <div />;
  }
}
