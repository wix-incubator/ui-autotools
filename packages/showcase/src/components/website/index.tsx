import * as React from 'react';
import {IComponentData} from '../../server/client-data';
import {ComponentList} from '../component-list';
import {ComponentInfo} from '../component-info';
import './global.st.css';
import style from './website.st.css';

interface IWebsiteProps {
  path: string;
  components: IComponentData[];
}

export class Website extends React.Component<IWebsiteProps> {
  public render() {
    const {components, path} = this.props;

    const componentNames = components.map((comp) => comp.name);
    const match = path.match(/\/components\/(\w+)/);
    const currentComponentName = match ? match[1] : undefined;
    const currentComponent =
      components.find((comp) => comp.name === currentComponentName);

    return (
      <div {...style('root', {}, this.props)}>
        <nav className={style.sidebar}>
          <ComponentList
            components={componentNames}
            currentComponent={currentComponentName}
          />
        </nav>
        <main className={style.main}>
          {currentComponent && <ComponentInfo component={currentComponent} />}
        </main>
      </div>
    );
  }
}
