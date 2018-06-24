import { ComponentType } from 'react'

export interface IRegistry {
  metadata: Map<ComponentType<any>, IComponentMetadata<any>>
  describe: <Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>
  clean: () => void
}

export interface IComponentMetadata<Props> {
  simulations: Array<ISimulation<Props>>
  addSim: (sim: ISimulation<Props>) => void
}

export interface ISimulation<Props> {
  props: Props
}
