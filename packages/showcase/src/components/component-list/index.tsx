import React from 'react';
import { style, classes } from './component-list.st.css';

export interface IComponentListProps {
  components: string[];
  currentComponent?: string;
  className?: string;
}

export const ComponentList: React.FunctionComponent<IComponentListProps> = (props) => {
  const { components, currentComponent } = props;
  return (
    <div className={style(classes.root, props.className)}>
      <div className={classes.header}>Components</div>
      {components.map((name) => (
        <a
          key={name}
          href={`/components/${name}/`}
          className={style(classes.link, { selected: name === currentComponent })}
        >
          {name}
        </a>
      ))}
    </div>
  );
};
