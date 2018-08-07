import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Website} from '../components/website';
import {IComponentData} from '../server/client-data';

(async () => {
  const components: IComponentData[] =
    await fetch('/components.json').then((data) => data.json());

  const path = (
    window.location.pathname +
    window.location.search +
    window.location.hash
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  ReactDOM.render(<Website components={components} path={path} />, root);
})();
