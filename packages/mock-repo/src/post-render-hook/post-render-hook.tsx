import * as React from 'react';

export interface IState {
  label: string;
}

export class PostRenderHook extends React.Component<{}, IState> {
  public state: IState = {
    label: 'Label failed to change'
  };

  public componentDidMount() {
    this.setState({label: 'I mOUnTeD ANd chANgED mY lABeL'});
  }

  public render() {
  return (<div><p>{this.state.label}</p><p>{this.state.label}</p></div>);
  }
}
