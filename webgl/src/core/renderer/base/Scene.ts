
import { Node } from "./Node";
import { SY } from "./Sprite";

/**
 * 场景的根节点
 */
export default class Scene extends Node{
    constructor(){
        super();
        this.name = "scene";
    }
}