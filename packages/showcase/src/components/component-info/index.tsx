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
        <Simulations componentName={name} simulationTitles={simulationTitles} />
      </div>
    );
  }
}

interface ISimulationsProps {
  componentName: string;
  simulationTitles: string[];
}

interface ISimulationsState {
  selectedSimulation?: string;
}

class Simulations extends React.Component<ISimulationsProps, ISimulationsState> {
  public state = {
    selectedSimulation: this.props.simulationTitles[0]
  };

  public render() {
    const {componentName, simulationTitles} = this.props;
    if (!simulationTitles.length) {
      return null;
    }

    const {selectedSimulation} = this.state;
    const src = (
      `/simulation.html?` +
      `component=${componentName}&` +
      `simulation=${selectedSimulation}`
    );

    return (
      <div>
        <div>
          <select onChange={this.handleChange}>
            {simulationTitles.map((title) =>
              <option key={title} selected={title === selectedSimulation}>
                {title}
              </option>
            )}
          </select>
        </div>
        <br />
        <div>
          <iframe width={400} height={200} src={src} />
        </div>
      </div>
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    this.setState({selectedSimulation: event.target.value});
  }
}
