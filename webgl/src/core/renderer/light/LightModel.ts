import Device from "../../Device";
import { glMatrix } from "../../math/Matrix";
import { G_UISetting } from "../../ui/UiSetting";
import { Line } from "../3d/Line";
import { Node } from "../base/Node";
import { SY } from "../base/Sprite";
import { G_Stage } from "../base/Stage";
import enums from "../camera/enums";
import { GameMainCamera} from "../camera/GameMainCamera";
import { syRender } from "../data/RenderData";
import { syPrimitives } from "../shader/Primitives";
import { BufferAttribsData, ShaderData } from "../shader/Shader";
import { G_ShaderFactory } from "../shader/ShaderFactory";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";
import { G_LightCenter } from "./LightCenter";
import { LineFrumstum } from "./LineFrumstum";


let vertBase =
    `attribute vec4 a_position;
    uniform mat4 u_Pmat;
    uniform mat4 u_Vmat;
    uniform mat4 u_Mmat;
void main() {
gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;
}`
let fragBase =
    `precision mediump float;
void main() {
gl_FragColor = vec4(1.0,0.0,0.0,1.0); 
}`



class LightModel {
    constructor() {

    }
    private _colorProgramInfo: ShaderData;
    private _cubeLinesBufferInfo: BufferAttribsData;
    private _lightViewMatrix: Float32Array;
    private _lightWorldMatrix: Float32Array;
    private _lightProjectInverseMatrix: Float32Array;
    private gl: WebGLRenderingContext;
    private _sunSprite: SY.sySprite;
    private _cameraLight:LineFrumstum;//相机光
    private _lightLine: Line;
    private _lightNode: Node;
    public init() {
        this._lightWorldMatrix = glMatrix.mat4.identity(null);
        this._lightProjectInverseMatrix = glMatrix.mat4.identity(null);
        this._lightViewMatrix = glMatrix.mat4.identity(null);
        this._lightNode = new Node();
        G_Stage.addChild(this._lightNode);
        this._colorProgramInfo = G_ShaderFactory.createProgramInfo(vertBase, fragBase);
        this.gl = Device.Instance.gl;
        this.createSun();
        this._cubeLinesBufferInfo = G_ShaderFactory.createBufferInfoFromArrays({
            position: [
                -1, -1, -1,
                1, -1, -1,
                -1, 1, -1,
                1, 1, -1,
                -1, -1, 1,
                1, -1, 1,
                -1, 1, 1,
                1, 1, 1,
            ],
            indices: [
                0, 1,
                1, 3,
                3, 2,
                2, 0,

                4, 5,
                5, 7,
                7, 6,
                6, 4,

                0, 4,
                1, 5,
                3, 7,
                2, 6,
            ],
        });
        G_UISetting.pushRenderCallBack(this.render.bind(this))
    }
    private createSun(): void {
        this._sunSprite = new SY.sySprite();
        let vertexData = syPrimitives.createSphereVertices(1, 24, 24);
        this._sunSprite.createIndexsBuffer(vertexData.indices);
        this._sunSprite.createNormalsBuffer(vertexData.normal, 3);
        this._sunSprite.createUVsBuffer(vertexData.texcoord, 2);
        this._sunSprite.createVertexsBuffer(vertexData.position, 3);
        this._sunSprite.setScale(0.3,0.3,0.3);
        this._sunSprite.spriteFrame = "res/light.jpg";
        this._lightNode.addChild(this._sunSprite);
        setTimeout(this.autoRotateSun.bind(this), 17);

        this._lightLine = new Line();
        this._lightLine.updateLinePos(this._coordPos.concat([0, 0, 0, 1, 1, 1]));
        this._lightNode.addChild(this._lightLine);

        this._cameraLight = new LineFrumstum();
        this._lightNode.addChild(this._cameraLight);

        
    }
    private autoRotateSun(): void {
        this._sunSprite.rotate(1, 1, 1);
        setTimeout(this.autoRotateSun.bind(this), 17);
    }

    private _coordPos: Array<number> = [
        0, 0, 0, 20, 0, 0,   //x轴
        0, 0, 0, 0, 20, 0,   //y轴
        0, 0, 0, 0, 0, 20    //z轴
    ];//坐标轴
    private render(setting): void {
        this._lightNode.x = setting.lightPosX;
        this._lightNode.y = setting.lightPosY;
        this._lightNode.z = setting.lightPosZ;
        this._lightLine.updateLinePos(this._coordPos.concat([0, 0, 0, setting.lightDirX, setting.lightDirY, setting.lightDirZ]));
        this._lightLine.color = [setting.lightColorR, setting.lightColorG, setting.lightColorB, setting.lightColorA];
    }


    /**
     * 
     * @param projectionMatrix 
     * @param cameraMatrix 
     * @param worldMatrix 
     */
    public drawFrustum(projectionMatrix, cameraMatrix) {

        if (!projectionMatrix || !cameraMatrix) {
            var cameraData = GameMainCamera.instance.getCameraIndex(syRender.CameraUUid.base3D).getCameraData();
            projectionMatrix = cameraData.projectMat;
            cameraMatrix = cameraData.modelMat
        }

        let lightData = G_LightCenter.updateLightCameraData();
        glMatrix.mat4.invert(this._lightProjectInverseMatrix, lightData.project)
        glMatrix.mat4.multiply(this._lightWorldMatrix, lightData.mat, this._lightProjectInverseMatrix);
        var gl = this.gl;
        glMatrix.mat4.invert(this._lightViewMatrix, cameraMatrix);
        gl.useProgram(this._colorProgramInfo.spGlID);
        // Setup all the needed attributes.
        G_ShaderFactory.setBuffersAndAttributes(this._colorProgramInfo.attrSetters, this._cubeLinesBufferInfo);
        // scale the cube in Z so it's really long
        // to represent the texture is being projected to
        // infinity
        // Set the uniforms we just computed
        G_ShaderFactory.setUniforms(this._colorProgramInfo.uniSetters, {
            u_Vmat: this._lightViewMatrix,
            u_Pmat: projectionMatrix,
            u_Mmat: this._lightWorldMatrix,
        });
        // calls gl.drawArrays or gl.drawElements
        G_ShaderFactory.drawBufferInfo(this._cubeLinesBufferInfo, gl.LINES);

    }

}

export var G_LightModel = new LightModel();