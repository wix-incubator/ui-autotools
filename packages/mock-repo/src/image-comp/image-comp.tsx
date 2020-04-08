import React from 'react';

export interface IProps {
  src: string;
}

export default class ImageComp extends React.Component<IProps> {
  public static displayName = 'ImageComp';

  public render() {
    return (
      <div className="root">
        <img alt="image of a lonely chair in a lonely room, alone" src={this.props.src} className="image" />
      </div>
    );
  }
}
