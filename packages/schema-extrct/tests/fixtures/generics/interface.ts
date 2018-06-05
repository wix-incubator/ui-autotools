export interface MyInterface<T extends number = 5>{
    amount:T;
};
export let param:MyInterface<7>;