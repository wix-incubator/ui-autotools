import * as React from 'react';
import style from './props-table.st.css';
import {renderTypeWithinSpace} from './render-type';

export interface IPropsTableProps {
  componentSchema: any;
}

export class PropsTable extends React.Component<IPropsTableProps> {
  public render() {
    const {componentSchema} = this.props;
    const propsInterface = (
      componentSchema.$ref === 'common/function' ?
        componentSchema.arguments[0] :
        componentSchema.properties.props
    );
    const required = new Set(propsInterface.required || []);
    const properties = Array.from(Object.entries(propsInterface.properties || {}));

    return (
      <table {...style('root', {}, this.props)}>
        <tbody>
          <tr>
            <th className={style.header}>Name</th>
            <th className={style.header}>Type</th>
            <th className={style.header}>Default</th>
            <th className={style.header}>Description</th>
          </tr>
          {properties.map(([name, type]: [string, any]) =>
            <tr key={name}>
              <td className={style.propName}>{name}</td>
              <td className={style.propType}>
                {renderTypeWithinSpace(type, 40, 2)}
              </td>
              <td className={style.propDefaultValue}>
                {required.has(name) ? 'Required' : ''}
              </td>
              <td className={style.propDescription}>
                {type.description ? type.description.trim() : ''}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}
