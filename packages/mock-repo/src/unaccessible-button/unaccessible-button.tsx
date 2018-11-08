import * as React from 'react';

interface IUnaccessibleButtonState {
  clicked: boolean;
}

export class UnaccessibleButton extends React.Component<{}, IUnaccessibleButtonState> {
  public state = { clicked: false };

  public render() {
    return (
      <button id="saveChanges" aria-label="" onClick={this.onClick}>
        Save as
      </button>
    );
  }

  private onClick = () => {
    this.setState({clicked: !this.state.clicked});
  }

}
