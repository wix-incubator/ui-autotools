import * as React from 'react';

export interface IState {
  label: string;
}

export class PostRenderHook extends React.Component<{}, IState> {
  public state: IState = {
    label: 'Label failed to change'
  };

  public componentDidMount() {
    this.setState({label: 'I mounted and changed my label'});
  }

  public render() {
    // tslint:disable-next-line:no-console
    console.log('tes');
    return <p>{this.state.label}</p>;
  }
}
