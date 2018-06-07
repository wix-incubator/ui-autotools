import {AType} from '../test-assets'

export let declared_union : string | number;

export let inferedUnion = Math.random()>0.5 ? 5 : "gaga";

export let specific_union : 'hello' | 'goodbye' | number;

export let type_union : AType | number;
