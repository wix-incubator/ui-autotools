import React from 'react';

export class NonAccessibleComponent extends React.Component {
  public render(): JSX.Element {
    return <button role="NOT AN ARIA ROLE" />;
  }
}
