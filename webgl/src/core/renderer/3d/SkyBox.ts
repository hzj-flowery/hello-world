import { SY } from "../base/Sprite";
import Camera from "../camera/Camera";
import GameMainCamera from "../camera/GameMainCamera";
import PerspectiveCamera from "../camera/PerspectiveCamera";
import { CubeData } from "../data/CubeData";

var vertexshader3d =
     'attribute vec4 a_position;' +
     'varying vec4 v_position;' +
     'void main() {' +
     'v_position = a_position;' +
     'gl_Position = a_position;' +
     'gl_Position.z = 1.0;' +
     '}'
var fragmentshader3d =
     'precision mediump float;' +

     'uniform samplerCube u_skybox;' +
     'uniform mat4 u_PVM_Matrix_Inverse;' +

     'varying vec4 v_position;' +
     'void main() {' +
     'vec4 t = u_PVM_Matrix_Inverse * v_position;' +
     'vec3 pos = normalize(t.xyz / t.w);' +
     'vec4 color =  textureCube(u_skybox,pos);' +
     'gl_FragColor = color;' +
     '}'

export default class SkyBox extends SY.SpriteBase {
     constructor(gl) {
          super(gl);
     }
     protected onInit(): void {
          var rd = CubeData.getData();
          this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
          this.createIndexsBuffer(rd.indexs);
          this.setShader(vertexshader3d, fragmentshader3d);
          this._shader.USE_SKYBOX = true;
     }

     private defaultPath = [
          'res/skybox/2/right+x.png',
          'res/skybox/2/left-x.png',
          'res/skybox/2/up-y.png',
          'res/skybox/2/down+y.png',
          'res/skybox/2/back-z.png',
          'res/skybox/2/front+z.png'
     ]

     public setDefaultUrl(): void {
          this.url = this.defaultPath;
     }
     public updateCamera(time: number): any {
         return (GameMainCamera.instance.getCamera(this._cameraType) as PerspectiveCamera).updateLookAt(time);
     }


}