import React from 'react';

export class NonAccessibleComponent extends React.Component {
  public render() {
    return <button role="NOT AN ARIA ROLE" />;
  }
}
