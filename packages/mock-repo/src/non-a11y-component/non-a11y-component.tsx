import React from 'react';

export class NonA11yComponent extends React.Component {

  public render() {
    return (
      <button role="NOT AN ARIA ROLE" />
    );
  }
}
