import React from 'react';
import ReactDOM from 'react-dom';
import {Composite} from './composite/composite';
import {Modal} from './modal/modal';
import {PostRenderHook} from './post-render-hook/post-render-hook';
import {UnsafeLifecycle} from './unsafe-lifecycle/unsafe-lifecycle';

const App: React.SFC = () => {
  return (
    <div>
      <div>
        Hey cool person
        <Modal>
          <span>Hey, I'm in a portal</span>
        </Modal>
      </div>
      <div>
        Other Div
      </div>
      <Composite />
      <PostRenderHook />
      <UnsafeLifecycle />
    </div>
  );
};

const rootContainer = document.createElement('div');
rootContainer.id = 'app-root';
document.body.appendChild(rootContainer);
ReactDOM.render(<App />, rootContainer);
