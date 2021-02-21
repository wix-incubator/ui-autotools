import React from 'react';
import type { IComponentData } from '../../server/client-data';
import { ComponentList } from '../component-list';
import { ComponentInfo } from '../component-info';
import './global.st.css';
import { style, classes } from './website.st.css';

export interface IWebsiteProps {
  route: string;
  projectName: string;
  components: IComponentData[];
  className?: string;
}

export class Website extends React.Component<IWebsiteProps> {
  public render(): JSX.Element {
    const { projectName, components, route } = this.props;

    const componentNames = components.map((comp) => comp.name);
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const match = route.match(/\/components\/(\w+)/);
    const currentComponentName = match ? match[1] : undefined;
    const currentComponent = components.find((comp) => comp.name === currentComponentName);

    return (
      <div className={style(classes.root, this.props.className)}>
        <nav className={classes.sidebar}>
          <div className={classes.projectName}>{projectName}</div>
          <ComponentList components={componentNames} currentComponent={currentComponentName} />
        </nav>
        <main className={classes.main}>{currentComponent && <ComponentInfo component={currentComponent} />}</main>
      </div>
    );
  }
}
