import { AGenericClass} from '../test-assets'

export class MyClass<T> extends AGenericClass<string,T>{
    a:T;
    constructor(public id:T){
        super();
    }
    setTitle(newtitle:T):void{

    }
};
export let param:MyClass<number>;