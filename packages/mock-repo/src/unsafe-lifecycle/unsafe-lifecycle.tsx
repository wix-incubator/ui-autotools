import React from 'react';

export interface IFood {
  calories: number;
  isVegan: boolean;
  expiryDate: Date;
}

export type RPS = 'rock' | 'paper' | 'scissors';

export interface IProps {
  /** How unsafe the lifecycle is on a scale from 1 to 10 */
  severity?: number;
  disabled?: boolean;
  title?: string;
  alwaysNull?: null;
  /**
   * 1. Multi
   * 2. Line
   * 3. Description
   */
  alwaysUndefined?: undefined;
  numberArray?: number[];
  mixedArray?: Array<number | string>;
  sillyArray?: Array<3>;
  object?: { str: string; num?: number; food: IFood; array: Array<1 | 2> };
  category?: 'aaa' | 'bbb' | 'ccc' | string[] | 12 | Array<1 | 2> | false;
  children?: React.ReactNode;
  food?: IFood;
  rps?: RPS;
  promise?: () => Promise<number>;
  hof?: (f: (x: number) => number) => () => void;
  onClick?: (event: React.SyntheticEvent, day?: number, ...tail: string[]) => void;
}

export class UnsafeLifecycle extends React.Component<IProps> {
  public static displayName = 'UnsafeLifecycle';

  public componentWillMount() {
    return null;
  }

  public render() {
    return <div>Unsafe lifecycle</div>;
  }
}
