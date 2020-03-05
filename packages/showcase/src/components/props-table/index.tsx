import React from 'react';
import { ICodeSchema, IFunctionSchema, SchemaTypes } from '@wix/typescript-schema-extract';
import style from './props-table.st.css';
import {TypeDefinition} from '../type-definition';

export interface IPropsTableProps {
  componentSchema: ICodeSchema;
}

export class PropsTable extends React.Component<IPropsTableProps> {
  public render() {
    const properties = getPropTypes(this.props.componentSchema);

    return (
      <table {...style('root', {}, this.props)}>
        <tbody>
          <tr>
            <th className={style.header}>Name</th>
            <th className={style.header}>Type</th>
            <th className={style.header}>Default</th>
            <th className={style.header}>Description</th>
          </tr>
          {properties.map(({name, description, schema, isRequired}) =>
            (
            <tr key={name}>
              <td className={style.propName}>{name}</td>
              <td className={style.propType}>
                <TypeDefinition schema={schema} />
              </td>
              <td className={style.propDefaultValue}>
                {isRequired ? 'Required' : ''}
              </td>
              <td className={style.propDescription}>
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

interface IProp {
  name: string;
  description: string;
  schema: SchemaTypes;
  isRequired: boolean;
}

function getPropTypes(componentSchema: ICodeSchema): IProp[] {
  const propsInterface = componentSchema.$ref === 'common/function' ?
      (componentSchema as IFunctionSchema).arguments[0] :
      componentSchema.properties && componentSchema.properties.props || {};

  const required = new Set(propsInterface.required || []);
  const props = Object.entries(propsInterface.properties || {});
  return Array.from(props).map(([name, schema]) => ({
      schema,
      name,
      description: schema.description ? schema.description.trim() : '',
      isRequired: required.has(name)
  }));
}
