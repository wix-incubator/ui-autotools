import * as React from 'react';
import {IComponentData} from '../../server/client-data';
import {PropsTable} from '../props-table';

interface IComponentInfoProps {
  component: IComponentData;
}

export class ComponentInfo extends React.Component<IComponentInfoProps> {
  public render() {
    const {name, schema, simulationTitles} = this.props.component;

    return (
      <div>
        <h1>{name}</h1>

        <h2>Props</h2>
        <PropsTable componentSchema={schema.schema} />

        <h2>Schema</h2>
        <pre style={{font: '11px/1.2 Menlo, Consolas, sans-serif'}}>
          {JSON.stringify(schema.schema, null, 4)}
        </pre>

        <h2>Simulations</h2>
        {simulationTitles.map((sim) => {
          const src = `/simulation.html?component=${name}&simulation=${sim}`;
          return (
            <div key={sim}>
              <h3>{sim}</h3>
              <iframe width={400} height={200} src={src} />
            </div>
          );
        })}
      </div>
    );
  }
}
