import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { CameraData } from "../data/CameraData";
import { LightData } from "../data/LightData";
import { G_ShaderFactory } from "../shader/ShaderFactory";


//三维光源
var vertexshader3d =
    'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_worldInverseTranspose;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_normal = mat3(u_worldInverseTranspose) * a_normal;' + //法线*世界矩阵的逆矩阵的转置矩阵 将法线转换到世界坐标系下
    '}'


var fragmentshader3d =
    'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec3 u_reverseLightDirection;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'vec3 normal = normalize(v_normal);' +                 //归一化法线
    'float light = dot(normal, u_reverseLightDirection);' + //法线*光的方向 算出光的强度
    'gl_FragColor = u_color;' +
    'gl_FragColor.rgb *= light;' +                          //
    '}'

export class ThreeDLight extends SY.Sprite {
    protected onInit(): void {
        this._uniformData = {
            u_worldViewProjection: {},
            u_worldInverseTranspose: {},
            u_color: [0.2, 1, 0.2, 1],
            u_reverseLightDirection: glMatrix.vec3.normalize(null, [0.5, 0.7, 1])
        }
        this.setShader(vertexshader3d, fragmentshader3d);
    }
    //加载数据完成
    protected onLoadFinish(datas): void {
        let cubeDatas: any = {};
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
    //更新unifoms变量
    public updateUniformsData(cameraData: CameraData,lightData:LightData): any {

        var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cameraData.viewProjectionMat, this.modelMatrix);//pvm
        var worldInverseMatrix = glMatrix.mat4.invert(null, this.modelMatrix);
        var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
        glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
        this._uniformData = {
            u_worldViewProjection: worldViewProjectionMatrix,
            u_worldInverseTranspose: worldInverseTransposeMatrix,
            u_color: [0.2, 1, 0.2, 1],
            u_reverseLightDirection: glMatrix.vec3.normalize(null, [0.5, 0.7, 1])
        }

        super.updateRenderData();
    }
}