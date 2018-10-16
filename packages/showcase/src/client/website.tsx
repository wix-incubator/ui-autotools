import React from 'react';
import ReactDOM from 'react-dom';
import {Website} from '../components/website';
import {IClientData} from '../server/client-data';

(async () => {
  const {projectName, components}: IClientData =
    await fetch('/components.json').then((data) => data.json());

  const route = (
    window.location.pathname +
    window.location.search +
    window.location.hash
  );

  const root = document.createElement('div');
  root.id = 'react-root';
  document.body.appendChild(root);
  ReactDOM.render(
    <Website
      projectName={projectName}
      components={components}
      route={route}
    />,
    root
  );
})();
