import React from 'react';
import ReactDOM from 'react-dom';
import { Website } from '../components/website';
import type { IClientData } from '../server/client-data';

void (async () => {
  const { projectName, components } = (await (await fetch('/components.json')).json()) as IClientData;

  const route = window.location.pathname + window.location.search + window.location.hash;

  const root = document.createElement('div');
  root.id = 'react-root';
  document.body.appendChild(root);
  ReactDOM.render(<Website projectName={projectName} components={components} route={route} />, root);
})();
