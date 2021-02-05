import { SY } from "../base/Sprite";
import { syGL } from "../gfx/syGLEnums";
import GameMainCamera from "./GameMainCamera";

/**
 * var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +

    'varying vec3 v_normal;' +
    'varying vec2 v_uv;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'v_uv = a_uv;' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 v_uv;' +
    'uniform samplerCube u_skybox;'+
    'uniform sampler2D u_texture;' +
    'uniform mat4 u_PVMInverseMatrix;'+
    'uniform vec4 u_color;' +
    'uniform vec4 u_color_dir;' +
    
    'void main() {' +
    'gl_FragColor = texture2D(u_texture, v_uv);' +
    '}'

 */
var solidcolorvertexshader =
    'attribute vec4 a_position;' +
    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'uniform mat4 u_PVMMatrix;' +
    'void main() {' +
    'gl_Position = u_PMatrix*u_VMatrix*u_MMatrix*a_position;' +
    '}'

var solidcolorfragmentshader =
    'precision mediump float;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = u_color;' +
    '}'

export default class CameraView extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit(): void {
        var result = this.createCameraBufferInfo(0.2);
        this.createVertexsBuffer(result.pos, 3);
        this.createIndexsBuffer(result.index);
        this._vertStr = solidcolorvertexshader;
        this._fragStr = solidcolorfragmentshader;

        this._glPrimitiveType = syGL.PrimitiveType.LINES;
    }
    private degToRad(d) {
        return d * Math.PI / 180;
      }

    // create geometry for a camera
    private createCameraBufferInfo(scale = 1) {
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0.
        // We'll put a cone in front of this cube opening
        // toward -Z
        var positions = [];
        var indices = [];

        //add back后座
        var backPos = [
            -1, -1, 1,  // cube vertices
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 3,
            1, -1, 3,
            -1, 1, 3,
            1, 1, 3,
            0, 0, 1,  // cone tip
        ];
        var backIndex = [
            0, 1, 1, 3, 3, 2, 2, 0, // cube indices
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        backPos.forEach(function(v,index){
            positions.push(v);
        });
        backIndex.forEach(function(v,index){
            indices.push(v);
        });
        positions.concat(backPos);
        indices.concat(backIndex);

        // add cone segments锥形
        const numSegments = 6;
        const coneBaseIndex = positions.length / 3;
        const coneTipIndex = coneBaseIndex - 1;
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments;
            const angle = u * Math.PI * 2;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            positions.push(x, y, 0);
            // line from tip to edge
            indices.push(coneTipIndex, coneBaseIndex + i);
            // line from point on edge to next point on edge
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }

        //48
        
        //add rayZ
        positions.push(0,0,-50);
        indices.push(coneTipIndex,positions.length/3-1);
        //add rayY
        positions.push(0,25,0);
        indices.push(coneTipIndex,positions.length/3-1);
        //add rayX
        positions.push(25,0,0);
        indices.push(coneTipIndex,positions.length/3-1);
         
        //add clip
        var far:number = -50;
        var near:number = -1;
        var nearWidth:number = 2;
        var nearHeight:number = 2;
        var farHeight:number = 10;
        var farWidth:number = 10;
        var clipPos = [
            -(nearWidth / 2), -(nearHeight / 2), near,  //左下
            (nearWidth / 2), -(nearHeight / 2), near,  //右下
            -(nearWidth / 2), (nearHeight / 2), near,  //左上
            (nearWidth / 2), (nearHeight / 2), near,  //右上

            -(farWidth / 2), -(farHeight / 2), far,  //左下
            (farWidth / 2), -(farHeight / 2), far,  //右下
            -(farWidth / 2), (farHeight / 2), far,  //左上
            (farWidth / 2), (farHeight / 2), far,  //右上
        ];
        var clipIndices = [
            0, 1, 1, 3, 3, 2, 2, 0, // cube indices
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        var lastMaxIndex = positions.length/3;
        clipIndices.forEach(function(v,index){
            clipIndices[index] = clipIndices[index] + lastMaxIndex;
        })
        clipPos.forEach(function(v,index){
            positions.push(v);
        });
        clipIndices.forEach(function(v,index){
            indices.push(v);
        })

        positions.forEach((v, ndx) => {
            positions[ndx] *= scale;
        });


        return { pos: positions, index: indices }
    }

    /**
         * 
         * @param texture 纹理的GLID
         */
    protected collectRenderData(time: number): void {
        //激活shader 并且给shader中的变量赋值
        this._shader.active();
        var newMV = this._glMatrix.mat4.create();
        var v = GameMainCamera.instance.getCamera(this._cameraType).modelMatrix;
        var m = this.modelMatrix;
        this._glMatrix.mat4.mul(newMV,v,m)
        this._shader.setUseModelViewMatrix(newMV);
        this._shader.setUseProjectionMatrix(GameMainCamera.instance.getCamera(this._cameraType).getProjectionMatrix());
        this._shader.setUseParallelLight([1, 0, 0, 1],[]);
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));
        
        //绑定操作的索引缓冲
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.getGLID(SY.GLID_TYPE.INDEX));

        // var buffer = this.getBuffer(SY.GLID_TYPE.INDEX)
        var body = 24;
        var head = 24;
        var ray = 2*3;
        var clip = 24;
        this._shader.setUseParallelLight([0, 0, 0, 1],[]);
        this.gl.drawElements(this._glPrimitiveType,body, this.gl.UNSIGNED_SHORT, 0);

        this._shader.setUseParallelLight([0, 1, 0, 1],[]);
        this.gl.drawElements(this._glPrimitiveType,head, this.gl.UNSIGNED_SHORT,body*2);

        this._shader.setUseParallelLight([1, 0, 0, 1],[]);
        this.gl.drawElements(this._glPrimitiveType,ray, this.gl.UNSIGNED_SHORT,(body+head)*2);

        this._shader.setUseParallelLight([1, 1, 0, 1],[]);
        this.gl.drawElements(this._glPrimitiveType,clip, this.gl.UNSIGNED_SHORT,(body+head+ray)*2);

        //解除缓冲区绑定
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }


}