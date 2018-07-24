import React from 'react';
import style from './component-list.st.css';

interface IProps {
  components: string[];
  currentComponent?: string;
}

export const ComponentList: React.SFC<IProps>  = (props) => {
  const {components, currentComponent} = props;
  return (
    <ul {...style('root', {}, props)}>
      {components.map((name) => (
        <li key={name}>
          {
            name === currentComponent ?
            <strong>{name}</strong> :
            <a href={`/components/${name}/`}>{name}</a>
          }
        </li>
      ))}
    </ul>
  );
};
