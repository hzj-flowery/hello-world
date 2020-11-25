import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { G_ShaderFactory } from "../shader/Shader";


export class PointLight extends SY.Sprite{
       constructor(){
           super();
       }
       protected onInit():void{
        this._uniformsData = {
            u_worldViewProjection: {},
            u_worldInverseTranspose: {},
            u_color: {},
            u_shininess: {},
            u_lightWorldPosition: {},
            u_viewWorldPosition: {},
            u_world: {}
          }
       }
       
       //加载数据完成
       protected onLoadFinish(datas):void{
        let cubeDatas:any = {};
        cubeDatas.position = new Float32Array(datas.position);
        cubeDatas.normal = new Float32Array(datas.normal);

        var matrix = glMatrix.mat4.identity(null);
        glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
        glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);
      
        for (var ii = 0; ii < cubeDatas.position.length; ii += 3) {
          var vector = glMatrix.mat4.transformPoint(null, matrix, [cubeDatas.position[ii + 0], cubeDatas.position[ii + 1], cubeDatas.position[ii + 2], 1]);
          cubeDatas.position[ii + 0] = vector[0];
          cubeDatas.position[ii + 1] = vector[1];
          cubeDatas.position[ii + 2] = vector[2];
        }
      
        this._attrData = G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);
       }
}