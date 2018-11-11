import * as React from 'react';

export class NonA11yComponent extends React.Component<{}> {

  public render() {
    return (
      <button id="saveChanges" role="NOT AN ARIA ROLE">
        Save as
      </button>
    );
  }
}
