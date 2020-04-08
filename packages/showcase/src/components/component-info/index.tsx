import React from 'react';
import { IComponentData } from '../../server/client-data';
import { PropsTable } from '../props-table';
import { MethodTable } from '../method-table';

interface IComponentInfoProps {
  component: IComponentData;
}

export class ComponentInfo extends React.Component<IComponentInfoProps> {
  public render() {
    const { name, schema, simulationTitles, styleTitles } = this.props.component;

    return (
      <div>
        <h1>{name}</h1>

        <h2>Props</h2>
        <PropsTable componentSchema={schema.schema} />

        <h2>Methods</h2>
        <MethodTable componentSchema={schema.schema} />

        <h2>Schema</h2>
        <pre style={{ font: '11px/1.2 Menlo, Consolas, sans-serif' }}>{JSON.stringify(schema.schema, null, 4)}</pre>

        <h2>Simulations</h2>
        <Simulations componentName={name} simulationTitles={simulationTitles} styleTitles={styleTitles} />
      </div>
    );
  }
}

interface ISimulationsProps {
  componentName: string;
  simulationTitles: string[];
  styleTitles: string[];
}

interface ISimulationsState {
  selectedSimulation?: string;
  selectedStyle?: string;
}

class Simulations extends React.Component<ISimulationsProps, ISimulationsState> {
  public state = {
    selectedSimulation: this.props.simulationTitles[0],
    selectedStyle: this.props.styleTitles[0],
  };

  public render() {
    const { componentName, simulationTitles, styleTitles } = this.props;
    if (!simulationTitles.length) {
      return null;
    }

    const { selectedSimulation, selectedStyle } = this.state;
    const src =
      `/simulation.html?` +
      `component=${encodeURIComponent(componentName)}&` +
      `simulation=${encodeURIComponent(selectedSimulation || '')}&` +
      `style=${encodeURIComponent(selectedStyle || '')}`;

    return (
      <div>
        <div>
          {this.renderSimulationsDropdown(simulationTitles, selectedSimulation)}
          {' \u00A0 '}
          {styleTitles.length ? this.renderStylesDropdown(styleTitles, selectedStyle) : null}
        </div>
        <br />
        <div>
          <iframe width="100%" height={400} src={src} />
        </div>
      </div>
    );
  }

  private renderSimulationsDropdown(titles: string[], selectedTitle: string) {
    return (
      <label>
        Simulation{' '}
        <select value={selectedTitle} onChange={this.handleSimulationChange}>
          {titles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
    );
  }

  private renderStylesDropdown(titles: string[], selectedTitle: string) {
    return (
      <label>
        Style{' '}
        <select value={selectedTitle} onChange={this.handleStyleChange}>
          {titles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
    );
  }

  private handleSimulationChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    this.setState({ selectedSimulation: event.target.value });
  };

  private handleStyleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    this.setState({ selectedStyle: event.target.value });
  };
}
