import React from 'react';
import style from './component-list.st.css';

interface IProps {
  components: string[];
  currentComponent?: string;
}

export const ComponentList: React.FunctionComponent<IProps>  = (props) => {
  const {components, currentComponent} = props;
  return (
    <div {...style('root', {}, props)}>
      <div className={style.header}>
        Components
      </div>
      {components.map((name) =>
        <a
          key={name}
          href={`/components/${name}/`}
          {...style('link', {selected: name === currentComponent})}
        >
          {name}
        </a>
      )}
    </div>
  );
};
