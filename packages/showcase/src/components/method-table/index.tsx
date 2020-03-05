import React from 'react';
import style from './method-table.st.css';
import {TypeDefinition} from '../type-definition';

export interface IMethodTableProps {
  componentSchema: any;
}

export class MethodTable extends React.Component<IMethodTableProps> {
  public render() {
    const methods = getMethods(this.props.componentSchema);

    return (
      <table {...style('root', {}, this.props)}>
        <tbody>
          <tr>
            <th className={style.header}>Name</th>
            <th className={style.header}>Type</th>
            <th className={style.header}>Description</th>
          </tr>
          {methods.map(({name, description, schema}) =>
            (
            <tr key={name}>
              <td className={style.methodName}>{name}</td>
              <td className={style.methodType}>
                <TypeDefinition schema={schema} />
              </td>
              <td className={style.methodDescription}>
                {description}
              </td>
            </tr>
            )
          )}
        </tbody>
      </table>
    );
  }
}

interface IMethod {
  name: string;
  description: string;
  schema: any;
}

const reactComponentMethods: Set<string> = new Set([
  'componentDidCatch',
  'componentDidMount',
  'componentDidUpdate',
  'componentWillMount',
  'componentWillReceiveProps',
  'componentWillUnmount',
  'componentWillUpdate',
  'forceUpdate',
  'getSnapshotBeforeUpdate',
  'render',
  'setState',
  'shouldComponentUpdate',
  'UNSAFE_componentWillMount',
  'UNSAFE_componentWillReceiveProps',
  'UNSAFE_componentWillUpdate',
]);

function getMethods(componentSchema: any): IMethod[] {
  if (componentSchema.$ref === 'common/function') {
    return [];
  }

  const properties: [string, any][] =
    Object.entries(componentSchema.properties || {});

  return properties
    .filter(([name, schema]) =>
      schema.$ref === 'common/function' && !reactComponentMethods.has(name)
    )
    .map(([name, schema]) => ({
      name,
      description: schema.description ? schema.description.trim() : '',
      schema
    }));
}
