import React from 'react';

export const FailingComp: React.FC = () => {
  document.createElement('div');
  return null;
};

FailingComp.displayName = 'FailingComp';
