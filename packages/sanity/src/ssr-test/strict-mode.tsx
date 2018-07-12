// import * as React from 'react';
// import ReactDOM from 'react-dom';
// import Registry from 'metadata-tools';
// import {hydrate} from 'react-dom';
// import chai, {expect} from 'chai';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';
// // import {hydrateTests} from './hydrate';

// chai.use(sinonChai);
// const root = document.getElementById('root');

// let index = 0;
// const componentStrings = (window as any).components;
// Registry.metadata.components.forEach((metadata, Comp) => {
//     if (Comp.name !== 'Modal') {
//         root!.innerHTML = componentStrings[index];
//         hydrate(<Comp />, root);
//         ReactDOM.unmountComponentAtNode(root as Element);
//         index++;
//     }
// });

// export const strictModeTests = (): void => {
//     describe('Strict mode tests', () => {
//       let consoleSpy: sinon.SinonSpy;
//       let errorSpy: sinon.SinonSpy;
//       const root = document.getElementById('root');

//       beforeEach(() => {
//           consoleSpy = sinon.spy(console, 'log');
//           errorSpy = sinon.spy(console, 'error');
//       });

//       afterEach(() => {
//           consoleSpy.restore();
//           errorSpy.restore();
//       });

//       Registry.metadata.components.forEach((metadata, Comp) => {
//         describe(Comp.name, () => {
//           it(`should render ${Comp.name} in strict mode without errors`, () => {
//               ReactDOM.render(<React.StrictMode><Comp /></React.StrictMode>, root);
//               // tslint:disable-next-line:no-unused-expression
//               expect(consoleSpy).to.not.be.called;
//               // tslint:disable-next-line:no-unused-expression
//               expect(errorSpy).to.not.be.called;
//               ReactDOM.unmountComponentAtNode(root as Element);
//           });

//           metadata.simulations.forEach(((simulation) => {
//               it(`should render ${Comp.name} in strict mode with props ${JSON.stringify(simulation)} without errors`, () => {
//                 ReactDOM.render(<React.StrictMode><Comp {...simulation.props} /></React.StrictMode>, root);
//                 // tslint:disable-next-line:no-unused-expression
//                 expect(consoleSpy).to.not.be.called;
//                 // tslint:disable-next-line:no-unused-expression
//                 expect(errorSpy).to.not.be.called;
//                 ReactDOM.unmountComponentAtNode(root as Element);
//               });
//           }));
//         });
//       });
//     });
// };

// strictModeTests();
// // hydrateTests();
