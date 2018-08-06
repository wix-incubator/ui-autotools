import {IMetadataAndSchemas, IExportSourceAndSchema} from './meta';
import {getCompName} from '@ui-autotools/registry';

export interface IComponentData {
  name: string;
  schema: IExportSourceAndSchema;
  simulationTitles: string[];
}

export function formatComponentDataForClient(
  {metadata, schemasByComponent}: IMetadataAndSchemas
) {
  const result: IComponentData[] = [];

  for (const [Comp, compMeta] of metadata.components.entries()) {
    result.push({
      name: getCompName(Comp),
      schema: schemasByComponent.get(Comp)!,
      simulationTitles: compMeta.simulations.map((sim) => sim.title)
    });
  }
  return result;
}
