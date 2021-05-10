import State from "../gfx/State";
import { Shader } from "./Shader";


/**
 * 
 */
export enum PassType{
    Normal,
    Middle,
    High
}
export class Pass {
    constructor(type:PassType){
        this._type=type
    }
    public code:Shader;
    public state:State;
    private _type:PassType;
    public order:number = 0;
    public get type(){
        return this._type;
    }
}