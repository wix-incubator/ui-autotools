import Registry, {getCompName, IComponentMetadata} from '@ui-autotools/registry';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

function findComponent(compName: string) {
  const comps = Array.from(Registry.metadata.components.keys());
  return comps.find((c) => getCompName(c) === compName);
}

function findSimulation<T>(compMeta: IComponentMetadata<T>, simName: string) {
  return compMeta.simulations.find(({title}) => title === simName);
}

function findStyle<T>(compMeta: IComponentMetadata<T>, styleName: string) {
  for (const [style, styleMeta] of compMeta.styles) {
    if (styleMeta.name === styleName) {
      return style;
    }
  }
}

interface IStyledSimulationProps {
  componentName: string;
  simulationName: string;
  styleName: string;
}

const StyledSimulation: React.SFC<IStyledSimulationProps> = (props) => {
  const Comp = findComponent(props.componentName);
  if (!Comp) {
    return <div>Error: component not found "{props.componentName}"</div>;
  }

  const compMeta = Registry.getComponentMetadata(Comp);
  const sim = findSimulation(compMeta, props.simulationName);
  if (!sim) {
    return <div>Error: simulation not found "{props.simulationName}"</div>;
  }

  let styleRootClass = '';
  if (props.styleName) {
    const style = findStyle(compMeta, props.styleName);
    if (!style) {
      return <div>Error: style not found "{props.styleName}"</div>;
    }
    styleRootClass = style.root;
  }

  const className = sim.props.className ?
    sim.props.className + ' ' + styleRootClass :
    styleRootClass;

  return <Comp {...sim.props} className={className} />;
};

const url = new URL(document.location.href);
const root = document.createElement('div');
document.body.appendChild(root);

ReactDOM.render(
  <StyledSimulation
    componentName={url.searchParams.get('component') || ''}
    simulationName={url.searchParams.get('simulation') || ''}
    styleName={url.searchParams.get('style') || ''}
  />,
  root
);
