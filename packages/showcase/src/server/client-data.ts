import {getCompName} from '@ui-autotools/registry';
import {getProjectName} from '@ui-autotools/utils';
import {IMetadataAndSchemas, IExportSourceAndSchema} from './meta';

export interface IComponentData {
  name: string;
  schema: IExportSourceAndSchema;
  simulationTitles: string[];
  styleTitles: string[];
}

export interface IClientData {
  projectName: string;
  components: IComponentData[];
}

function formatComponentDataForClient(
  {metadata, schemasByComponent}: IMetadataAndSchemas
) {
  const result: IComponentData[] = [];

  for (const [Comp, compMeta] of metadata.components.entries()) {
    result.push({
      name: getCompName(Comp),
      schema: schemasByComponent.get(Comp)!,
      simulationTitles: compMeta.simulations.map((sim) => sim.title),
      styleTitles: Array.from(compMeta.styles.values()).map(({name}) => name)
    });
  }
  return result;
}

export function getClientData(
  projectPath: string,
  metadataAndSchemas: IMetadataAndSchemas
): IClientData {
  return {
    projectName: getProjectName(projectPath),
    components: formatComponentDataForClient(metadataAndSchemas)
  };
}
