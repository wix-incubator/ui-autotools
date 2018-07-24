import {IMetadataAndSchemas, IExportSourceAndSchema} from './meta';

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
      name: Comp.name! || Comp.displayName!,
      schema: schemasByComponent.get(Comp)!,
      simulationTitles: compMeta.simulations.map((sim) => sim.title)
    });
  }
  return result;
}
