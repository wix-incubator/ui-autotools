import * as React from 'react';

export class UnaccessibleButton extends React.Component<{}> {

  public render() {
    return (
      <button id="saveChanges" role="NOT AN ARIA ROLE">
        Save as
      </button>
    );
  }
}
