import { syRender } from "../data/RenderData";
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
        this._type=type;
        this.drawType = syRender.DrawType.Normal;
    }
    public code:Shader; //shader 代码
    public state:State; //渲染状态
    private _type:PassType;
    public order:number = 0;

    public offlineRender:boolean = false; //是否是离线渲染
    public drawInstanced:boolean = false; //是否是实例化绘制
    public drawType:syRender.DrawType;//绘制的类型
    public get type(){
        return this._type;
    } 
}