import React from 'react';
import type { ICodeSchema, IFunctionSchema, SchemaTypes } from '@wix/typescript-schema-extract';
import { style, classes } from './props-table.st.css';
import { TypeDefinition } from '../type-definition';

export interface IPropsTableProps {
  componentSchema: ICodeSchema;
  className?: string;
}

export class PropsTable extends React.Component<IPropsTableProps> {
  public render() {
    const properties = getPropTypes(this.props.componentSchema);

    return (
      <table className={style(classes.root, this.props.className)}>
        <tbody>
          <tr>
            <th className={classes.header}>Name</th>
            <th className={classes.header}>Type</th>
            <th className={classes.header}>Default</th>
            <th className={classes.header}>Description</th>
          </tr>
          {properties.map(({ name, description, schema, isRequired }) => (
            <tr key={name}>
              <td className={classes.propName}>{name}</td>
              <td className={classes.propType}>
                <TypeDefinition schema={schema} />
              </td>
              <td className={classes.propDefaultValue}>{isRequired ? 'Required' : ''}</td>
              <td className={classes.propDescription}>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

interface IProp {
  name: string;
  description: string;
  schema: SchemaTypes;
  isRequired: boolean;
}

function getPropTypes(componentSchema: ICodeSchema): IProp[] {
  const propsInterface =
    componentSchema.$ref === 'common/function'
      ? (componentSchema as IFunctionSchema).arguments[0]
      : (componentSchema.properties && componentSchema.properties.props) || {};

  const required = new Set(propsInterface.required || []);
  const props = Object.entries(propsInterface.properties || {});
  return Array.from(props).map(([name, schema]) => ({
    schema,
    name,
    description: schema.description ? schema.description.trim() : '',
    isRequired: required.has(name),
  }));
}
