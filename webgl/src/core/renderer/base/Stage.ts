import { Node } from "./Node";
/**
 * 舞台
 */
class Stage extends Node{
       constructor(){
           super();
           this.name = "stage";
       }
}
export var G_Stage = new Stage();