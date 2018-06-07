import { AClass} from '../test-assets'

export class MyClass extends AClass{
    static a:string;
    private static b:string;
    a:number = 0;
    constructor(public id:string){
        super();
    }
    setTitle(newtitle:string,prefix:string):void{

    }
};
export let param:MyClass;