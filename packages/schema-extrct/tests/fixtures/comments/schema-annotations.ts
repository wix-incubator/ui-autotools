import { AGenericClass } from "../test-assets";

/********
 * @title My string
 * 
 * My string 
 * multi line
 * description
 * 
 * @minLength 1
 * @maxLength 100
 * @pattern /a*b*c/
 * ********/
export let str:string;



/********
 * @minimum 1
 * @maximum 100
 * @stepValue 1
 * ********/
export let num:number;

/********
 * @minItems 1
 * @maxItems 100
 * ********/
export let arr:Array</*  @maxLength 1 */string>;

/********
 * @title My Object
 * ********/
export let obj:{
    /********
     * @title My Field
     * ********/
    a:string
};

/********
 * @title generics use
 * ********/
export let gen:AGenericClass</*@minLength 1*/string,number>


/********
 * @title generics definition
 * ********/
export type GenDef</*@title generic param title*/T> = AGenericClass<string,T>