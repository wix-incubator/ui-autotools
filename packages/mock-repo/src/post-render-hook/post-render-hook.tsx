import * as React from 'react';

export interface CompState {
  label: string;
}

export class PostRenderHook extends React.Component<{}, CompState> {
  constructor(props: any) {
    super(props);
    this.state = {
      label: 'Label failed to change'
    };
  }

  public componentDidMount() {
    this.setState({label: 'I mounted and changed my label'});
  }

  public render() {
    return <p>{this.state.label}</p>;
  }
}
