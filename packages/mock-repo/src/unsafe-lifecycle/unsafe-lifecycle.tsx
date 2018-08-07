import * as React from 'react';

export class UnsafeLifecycle extends React.Component {
  public static displayName = 'UnsafeLifecycle';

  public componentWillMount() {
    return null;
  }

  public render() {
  return (<p>unsafe-lifecycle</p>);
  }
}
