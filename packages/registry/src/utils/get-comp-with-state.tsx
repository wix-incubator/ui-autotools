import React from 'react';
import type { ISimulation } from '../registry';

export function getCompWithState(Comp: React.ComponentClass<any>, simulation: ISimulation<any, any>): JSX.Element {
  // Override the requested component's setState
  const getOverrideState = (state: any) => {
    return {
      ...state,
      ...simulation.state,
    };
  };

  class Wrapped extends Comp {
    public static getDerivedStateFromProps(nextProps: any, prevState: any) {
      if (super.getDerivedStateFromProps) {
        return getOverrideState(super.getDerivedStateFromProps(nextProps, prevState));
      } else {
        return null;
      }
    }

    constructor(props: any) {
      super(props);
      this.state = getOverrideState(this.state);
    }

    public setState(o: (args?: any[]) => any, callback?: (() => void) | undefined) {
      if (typeof o === 'function') {
        super.setState((...args: any[]) => getOverrideState(o(...args)), callback);
      } else {
        super.setState(getOverrideState(o), callback);
      }
    }
  }

  return <Wrapped {...simulation.props} />;
}
