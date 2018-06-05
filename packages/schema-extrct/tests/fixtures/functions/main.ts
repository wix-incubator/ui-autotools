export function inferedFunction(str:string){
    return str+'a'
};

export const declaredFunction:(str:string)=>string = (str:string)=>{
    return str+'a'
};

export function inferedDeconstruct ({x=1, y="text"}) { return x + y; }