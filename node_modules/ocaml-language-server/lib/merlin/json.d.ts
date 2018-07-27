export interface IArray extends Array<Value> {
}
export interface IObject {
    [key: string]: Value;
}
export declare type Value = boolean | IArray | IObject | number | string;
