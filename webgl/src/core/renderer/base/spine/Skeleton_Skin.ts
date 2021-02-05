import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { syGL } from "../../gfx/syGLEnums";
import { Texture, TextureOpts } from "../texture/Texture";
import { Texture2D } from "../texture/Texture2D";
import TextureCustom from "../texture/TextureCustom";
import { Skeleton_Node } from "./Skeleton_Node";
/**
 * 
    RGBA RGBA RGBA RGBA  --矩阵1  16
    RGBA RGBA RGBA RGBA  --矩阵2  16
    RGBA RGBA RGBA RGBA  --矩阵3  16
    RGBA RGBA RGBA RGBA  --矩阵4  16
    RGBA RGBA RGBA RGBA  --矩阵5  16
    RGBA RGBA RGBA RGBA  --矩阵6  16
 * 
 * this.jointData 16*6，它的数据变化受到this.jointMatrices这个数组的影响
 * this.jointMatrices这个数组的每一个值都是this.jointData的一段buffer
 * 所以我们在外界只要撬动这个this.jointMatrices这个数组里的值，就能撬动this.jointData它的值，进而影响纹理的值，因为this.jointData是骨骼纹理数据
 * 
 * 下面这个类就是要去造一张骨骼纹理
 */
export class Skeleton_Skin {
    public jointNodes: Array<Skeleton_Node>;//骨骼节点
    /**
     * 绑定姿势的逆矩阵
     */
    private inverseBindMatrices: Array<Float32Array>;
    private jointMatrices: Array<Float32Array>;
    private jointData: Float32Array;
    public jointTexture: TextureCustom;
    public _texture: Texture;
    private gl: WebGL2RenderingContext;
    private _skinWidth:number;//皮肤纹理的宽度(宽有多少个像素点)
    private _skinHeight:number;//皮肤纹理的高度（高有多少个像素点）
    constructor(jointNodes:Array<Skeleton_Node>, inverseBindMatrixData: Float32Array, gl) {
        this.gl = gl;
        this.jointNodes = jointNodes;
        this.inverseBindMatrices = [];
        this.jointMatrices = [];
        this.jointData = new Float32Array(jointNodes.length * 16);//有多少个节点就要创建多少个4x4矩阵
        // create views for each joint and inverseBindMatrix
        for (let i = 0; i < jointNodes.length; ++i) {
            this.inverseBindMatrices.push(new Float32Array(
                inverseBindMatrixData.buffer,
                inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
            this.jointMatrices.push(new Float32Array(
                this.jointData.buffer,
                Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
        }
        this._skinWidth = 4;
        this._skinHeight = this.jointNodes.length;

        this.jointTexture = new TextureCustom();
        let opts = new TextureOpts();
        opts.data = this.jointData;
        opts.width = this._skinWidth;
        opts.height = this._skinHeight;
        opts.magFilter = this.gl.NEAREST;
        opts.minFilter = this.gl.NEAREST;
        opts.wrapS = this.gl.CLAMP_TO_EDGE;
        opts.wrapT = this.gl.CLAMP_TO_EDGE;
        opts.unpackFlipY = false;
        if(Device.Instance.getContextType()=="webgl2")
        opts.configFormat = syGL.TextureFormat.RGBA32F_2;
        else 
        opts.configFormat = syGL.TextureFormat.RGBA32F;
        this.jointTexture.url = opts;

        this._texture = new Texture2D();
        (this._texture as Texture2D).url = ("res/bindu.jpg");
    }
    update() {
        /**
         * 此处传来一个node 并且取了它的逆矩阵，其实是想将顶点转换到该节点的空间坐标系
         * 但我在最后计算世界坐标系的时候，又去乘了这个节点的世界坐标系，又重新从这个节点坐标系转到了世界空间坐标系下
         * 所以我觉得这个过程有点多余，转来又转去
         */
        for (let j = 0; j < this.jointNodes.length; ++j) {
            const jointNode = this.jointNodes[j];
            glMatrix.mat4.copy(this.jointMatrices[j],jointNode.worldMatrix)
            /**
             * 为啥要乘以这个绑定矩阵的逆矩阵？
             */
            glMatrix.mat4.multiply(this.jointMatrices[j], this.jointMatrices[j], this.inverseBindMatrices[j]);
        }
        this.jointTexture.reUpload(this.jointData);
    }
}