import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { Texture } from "../texture/Texture";
import { Texture2D } from "../texture/Texture2D";
import { Skeleton_Node } from "./Skeleton_Node";

export class Skeleton_Skin {
    public joints: Array<Skeleton_Node>;
    private inverseBindMatrices: Array<Float32Array>;
    private jointMatrices: Array<Float32Array>;
    private jointData: Float32Array;
    public jointTexture: WebGLTexture;
    public _texture: Texture;
    private gl: WebGL2RenderingContext;
    private _tempMatrix:Float32Array;
    constructor(joints, inverseBindMatrixData: Float32Array, gl) {
        this.gl = gl;
        this.joints = joints;
        this.inverseBindMatrices = [];
        this.jointMatrices = [];
        this.jointData = new Float32Array(joints.length * 16);
        // create views for each joint and inverseBindMatrix
        for (let i = 0; i < joints.length; ++i) {
            this.inverseBindMatrices.push(new Float32Array(
                inverseBindMatrixData.buffer,
                inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
            this.jointMatrices.push(new Float32Array(
                this.jointData.buffer,
                Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
        }
        // create a texture to hold the joint matrices
        this.jointTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.jointTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        if(Device.Instance.getContextType()=="webgl2")
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 4, this.joints.length, 0,
            this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
        else
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 4, this.joints.length, 0,
                this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }

        

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this._texture = new Texture2D();

        this.createTexture2DBuffer("res/wicker.jpg");

        this._tempMatrix = glMatrix.mat4.identity(null);
    }
    //创建一个纹理buffer
    private createTexture2DBuffer(url: string): Texture {
        (this._texture as Texture2D).url = url;
        return this._texture
    }
    update(node: Skeleton_Node) {
        glMatrix.mat4.invert(this._tempMatrix, node.worldMatrix);
        // go through each joint and get its current worldMatrix
        // apply the inverse bind matrices and store the
        // entire result in the texture
        for (let j = 0; j < this.joints.length; ++j) {
            const joint = this.joints[j];
            const dst = this.jointMatrices[j];
            glMatrix.mat4.multiply(dst, this._tempMatrix, joint.worldMatrix);
            glMatrix.mat4.multiply(dst, dst, this.inverseBindMatrices[j]);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.jointTexture);
        if(Device.Instance.getContextType()=="webgl2")
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 4, this.joints.length, 0,
            this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
        else
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 4, this.joints.length, 0,
                this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
    }
}