export interface MyInterface{
    title:string;
};
export let param:MyInterface;

export interface Extendz extends MyInterface {
    desc: string;
}