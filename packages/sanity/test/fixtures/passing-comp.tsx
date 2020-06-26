import React from 'react';

export interface PassingCompProps {
  text?: string;
}

export const PassingComp: React.FC<PassingCompProps> = ({ text = '' }) => {
  return <h1>Hey {text} person</h1>;
};

PassingComp.displayName = 'PassingComp';
