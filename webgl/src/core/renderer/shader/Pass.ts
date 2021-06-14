import State from "../gfx/State";
import { Shader } from "./Shader";


/**
 * 渲染通道类型
 * 普通
 * 中级
 * 高级
 */
export enum PassType{
    Normal,
    Middle,
    High
}
//渲染通道
//每一次渲染都需要一个渲染通道
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