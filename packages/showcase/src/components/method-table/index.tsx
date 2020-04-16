import React from 'react';
import { style, classes } from './method-table.st.css';
import { TypeDefinition } from '../type-definition';

export interface IMethodTableProps {
  componentSchema: any;
  className?: string;
}

export class MethodTable extends React.Component<IMethodTableProps> {
  public render() {
    const methods = getMethods(this.props.componentSchema);

    return (
      <table className={style(classes.root, this.props.className)}>
        <tbody>
          <tr>
            <th className={classes.header}>Name</th>
            <th className={classes.header}>Type</th>
            <th className={classes.header}>Description</th>
          </tr>
          {methods.map(({ name, description, schema }) => (
            <tr key={name}>
              <td className={classes.methodName}>{name}</td>
              <td className={classes.methodType}>
                <TypeDefinition schema={schema} />
              </td>
              <td className={classes.methodDescription}>{description}</td>
            </tr>
          ))}
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

  const properties: Array<[string, any]> = Object.entries(componentSchema.properties || {});

  return properties
    .filter(([name, schema]) => schema.$ref === 'common/function' && !reactComponentMethods.has(name))
    .map(([name, schema]) => ({
      name,
      description: schema.description ? schema.description.trim() : '',
      schema,
    }));
}
