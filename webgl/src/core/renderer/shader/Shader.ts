
import { G_DrawEngine } from "../base/DrawEngine";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { ShaderUseVariantType } from "./ShaderUseVariantType";


export class ShaderData {
    constructor(spGLID, index) {
        this._spGLID = spGLID;
        this._textureUnit = 0;
        this._index = index;
    }
    private _spGLID;
    private _textureUnit: number = 0;
    private _uniformSetters: { [index: string]: Function };
    private _attribSetters: { [index: string]: Function };
    private _index: number = -1;
    public get spGlID() {
        return this._spGLID;
    }
    public get textureUnit() {
        return this._textureUnit;
    }
    public addTextureUnit() {
        var before = this._textureUnit;
        this._textureUnit++;
        return before;
    }
    public get uniSetters() {
        return this._uniformSetters;
    }
    public get attrSetters() {
        return this._attribSetters;
    }
    public set uniSetters(set: { [index: string]: Function }) {
        this._uniformSetters = set;
    }
    public set attrSetters(set: { [index: string]: Function }) {
        this._attribSetters = set;
    }
    public get Index() {
        return this._index;
    }
}
export class BufferAttribsData {
    constructor(attribs, numElements, indices) {
        this.attribs = attribs;
        this.numElements = numElements;
        this.indices = indices;
    }
    public readonly indices: Array<number>;
    public readonly numElements: number;
    public readonly attribs: Object;
}

var mapTree_a: Map<syGL.AttributeUniform, ShaderUseVariantType> = new Map();
var mapTree_u: Map<syGL.AttributeUniform, ShaderUseVariantType> = new Map();
mapTree_a.set(syGL.AttributeUniform.POSITION,ShaderUseVariantType.Position);
mapTree_a.set(syGL.AttributeUniform.NORMAL,ShaderUseVariantType.Normal);
mapTree_a.set(syGL.AttributeUniform.UV,ShaderUseVariantType.UVs);
mapTree_a.set(syGL.AttributeUniform.TANGENT,ShaderUseVariantType.Tangent);
mapTree_a.set(syGL.AttributeUniform.VERT_COLOR,ShaderUseVariantType.VertColor);
mapTree_a.set(syGL.AttributeUniform.VERT_Matrix,ShaderUseVariantType.VertMatrix);

mapTree_u.set(syGL.AttributeUniform.TIME,ShaderUseVariantType.Time);
mapTree_u.set(syGL.AttributeUniform.COLOR,ShaderUseVariantType.Color);
mapTree_u.set(syGL.AttributeUniform.ALPHA,ShaderUseVariantType.Alpha);
mapTree_u.set(syGL.AttributeUniform.LIGHT_AMBIENT,ShaderUseVariantType.AmbientLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_POINT,ShaderUseVariantType.PointLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_PARALLEL,ShaderUseVariantType.ParallelLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_PARALLEL_DIR,ShaderUseVariantType.ParallelLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPECULAR,ShaderUseVariantType.SpecularLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPECULAR_SHININESS,ShaderUseVariantType.SpecularLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_DIRECTION,ShaderUseVariantType.SpotLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT,ShaderUseVariantType.SpotLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_INNER_LIMIT,ShaderUseVariantType.SpotLight);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_OUTER_LIMIT,ShaderUseVariantType.SpotLight);
mapTree_u.set(syGL.AttributeUniform.VMMatrix,ShaderUseVariantType.ViewModel);
mapTree_u.set(syGL.AttributeUniform.PMatrix,ShaderUseVariantType.Projection);
mapTree_u.set(syGL.AttributeUniform.Matrix,ShaderUseVariantType.CustomMatrix);
mapTree_u.set(syGL.AttributeUniform.FOG_COLOR,ShaderUseVariantType.Fog);
mapTree_u.set(syGL.AttributeUniform.FOG_DENSITY,ShaderUseVariantType.Fog);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD0,ShaderUseVariantType.TEX_COORD);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD1,ShaderUseVariantType.TEX_COORD1);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD2,ShaderUseVariantType.TEX_COORD2);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD3,ShaderUseVariantType.TEX_COORD3);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD4,ShaderUseVariantType.TEX_COORD4);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD5,ShaderUseVariantType.TEX_COORD5);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD6,ShaderUseVariantType.TEX_COORD6);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD7,ShaderUseVariantType.TEX_COORD7);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD8,ShaderUseVariantType.TEX_COORD8);
mapTree_u.set(syGL.AttributeUniform.CUBE_COORD,ShaderUseVariantType.CUBE_COORD);
// mapTree_u.set(syGL.AttributeUniform.SKYBOX,ShaderUseVariantType.SKYBOX);  --天空盒异常手动处理
//uniform
mapTree_u.set(syGL.AttributeUniform.TEX_GPosition,ShaderUseVariantType.GPosition);
mapTree_u.set(syGL.AttributeUniform.TEX_GNormal,ShaderUseVariantType.GNormal);
mapTree_u.set(syGL.AttributeUniform.TEX_GColor,ShaderUseVariantType.GColor);
mapTree_u.set(syGL.AttributeUniform.TEX_GUv,ShaderUseVariantType.GUv);
mapTree_u.set(syGL.AttributeUniform.TEX_GDepth,ShaderUseVariantType.GDepth);

mapTree_u.set(syGL.AttributeUniform.SHADOW_INFO,ShaderUseVariantType.ShadowInfo);
mapTree_u.set(syGL.AttributeUniform.PVM_MATRIX,ShaderUseVariantType.ProjectionViewModel);
mapTree_u.set(syGL.AttributeUniform.PVM_MATRIX_INVERSE,ShaderUseVariantType.ProjectionViewModelInverse);
mapTree_u.set(syGL.AttributeUniform.MMatrix,ShaderUseVariantType.Model);
mapTree_u.set(syGL.AttributeUniform.VMatrix,ShaderUseVariantType.View);
mapTree_u.set(syGL.AttributeUniform.MIMatrix,ShaderUseVariantType.ModelInverse);
mapTree_u.set(syGL.AttributeUniform.MTMatrix,ShaderUseVariantType.ModelTransform);
mapTree_u.set(syGL.AttributeUniform.MITMatrix,ShaderUseVariantType.ModelInverseTransform);
mapTree_u.set(syGL.AttributeUniform.PVMatrix,ShaderUseVariantType.ProjectionView);
mapTree_u.set(syGL.AttributeUniform.PVMatrix_INVERSE,ShaderUseVariantType.ProjectionViewInverse);
mapTree_u.set(syGL.AttributeUniform.CameraWorldPosition,ShaderUseVariantType.CameraWorldPosition);
mapTree_u.set(syGL.AttributeUniform.LightWorldPosition,ShaderUseVariantType.LightWorldPosition);

mapTree_u.set(syGL.AttributeUniform.MOUSE,ShaderUseVariantType.Mouse);
mapTree_u.set(syGL.AttributeUniform.RESOLUTION,ShaderUseVariantType.Resolution)

/**
 * 获取当前对象记载显存地址的key
 * @param pName 
 */
function getLocName(pName:syGL.AttributeUniform,isUniform:boolean) {
    if(isUniform) 
    return "u_"+pName+"_loc";
    return "a_"+pName+"_loc";
}
var texture2DConstBridge:Array<syGL.AttributeUniform> = [];
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD0);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD1);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD2);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD3);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD4);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD5);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD6);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD7);
texture2DConstBridge.push(syGL.AttributeUniform.TEX_COORD8);

export class Shader {
    private u_skybox_loc;//天空盒属性位置
    protected _gl: WebGLRenderingContext;
    protected _spGLID: WebGLProgram;
    public readonly name: string;
    private _useVariantType: Array<ShaderUseVariantType> = [];
    constructor(gl: WebGLRenderingContext, glID: WebGLProgram, name: string) {
        this._gl = gl;
        this._spGLID = glID;
        this.name = name;
        this._useVariantType = [];
        this.pushShaderVariant(ShaderUseVariantType.Projection);
        this.pushShaderVariant(ShaderUseVariantType.Model);
        this.pushShaderVariant(ShaderUseVariantType.View);
        this.onCreateShader();
    }
    protected onCreateShader(): void {
        var gl = this._gl;
        //-----------------------------------------------
        const numUniforms = G_DrawEngine.getProgramParameter(this._spGLID, gl.ACTIVE_UNIFORMS);
        for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = G_DrawEngine.getActiveUniform(this._spGLID, ii);
            if (!uniformInfo) {
                break;
            }
            // let name  = uniformInfo.name;
            // // remove the array suffix.
            // if (name.substr(-3) === '[0]') {
            //     name = name.substr(0, name.length - 3);
            // }
            let SUVType = mapTree_u.get(uniformInfo.name as any)
            if (SUVType) {
                //合法
                let loc = getLocName(uniformInfo.name,true);
                let searchStr = uniformInfo.name;
                //uniform变量
                this[loc] = G_DrawEngine.getUniformLocation(this._spGLID, searchStr);
                this[loc] != null ? this.pushShaderVariant(SUVType) : null;
            }
            else if (uniformInfo.name == syGL.AttributeUniform.SKYBOX) {
                //天空盒特殊处理
                this.u_skybox_loc = G_DrawEngine.getUniformLocation(this._spGLID, syGL.AttributeUniform.SKYBOX);
                if (this.u_skybox_loc) {
                    setTimeout(() => {
                        this.pushShaderVariant(ShaderUseVariantType.SKYBOX)
                    }, 10);
                }
            }
        }
        //-----------------------------------------------
        const numAttribs = G_DrawEngine.getProgramParameter(this._spGLID, gl.ACTIVE_ATTRIBUTES);
        for (let ii = 0; ii < numAttribs; ++ii) {
            const attribInfo = G_DrawEngine.getActiveAttrib(this._spGLID, ii);
            if (!attribInfo) {
                break;
            }
            let SUVType = mapTree_a.get(attribInfo.name as any);
            if (SUVType) {
                let loc = getLocName(attribInfo.name,false);
                let searchStr = attribInfo.name;
                //attribute变量
                this[loc] = G_DrawEngine.getAttribLocation(this._spGLID, searchStr);
                this[loc] >= 0 ? this.pushShaderVariant(SUVType) : null;
            }
        }

    }
    private pushShaderVariant(type: ShaderUseVariantType): void {
        if (type >= ShaderUseVariantType.UndefinedMax || type <= ShaderUseVariantType.UndefinedMin) {
            // console.log("这个类型的矩阵是不合法的！！！！", type);
            return;
        }
        if (this._useVariantType.indexOf(type) >= 0) {
            // console.log("这个类型的矩阵已经有了！！！！", type);
            return;
        }
        this._useVariantType.push(type);
    }
    public get useVariantType(): Array<ShaderUseVariantType> {
        return this._useVariantType;
    }
    public getCustomAttributeLocation(varName: string): number {
        return G_DrawEngine.getAttribLocation(this._spGLID, varName)
    }

    public getGLID(): WebGLProgram {
        return this._spGLID;
    }
    /**
     * 检查shader中变量的位置是否有效
     * attribute变量的类型是number 如果有效 则大于等于0
     * uniform变量的类型是一个object 如果有效 则不为空
     * @param loc 
     */
    private checklocValid(loc: number): boolean {
        let result = !(loc == null || loc < 0);
        if (!result) {
            return false;
        }
        return true;
    }
    //激活shader
    public active(): void {
        G_DrawEngine.useProgram(this._spGLID);
    }
    /**
     * 设置自定义使用的统一变量
     * @param uniforName shader代码中变量的名字
     * @param data 数组中包含四个元素 shader那边是一个vec4
     */
    public setCustomUniformFloatVec4(uniforName:syGL.AttributeUniform,data:Array<number>):void{
        var loc = getLocName(uniforName,true);
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.setUniformFloatVec4(this[loc], data);
        }
    }

    /**
     * 设置自定义使用的统一变量
     * @param uniforName shader代码中变量的名字
     * @param data 数组中包含三个元素 shader那边是一个vec3
     */
     public setCustomUniformFloatVec3(uniforName:syGL.AttributeUniform,data:Array<number>):void{
        var loc = getLocName(uniforName,true);
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.setUniformFloatVec3(this[loc], data);
        }
    }
    /**
     * 设置自定义使用的统一变量
     * @param uniforName shader代码中变量的名字
     * @param data  shader那边是一个float
     */
     public setCustomUniformFloat(uniforName:syGL.AttributeUniform,data:number):void{
        var loc = getLocName(uniforName,true);
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.setUniform1f(this[loc], data);
        }
    }


    /**
     * 设置使用顶点矩阵
     * @param glID 
     * @param itemSize 
     */
    public setUseVertMatrix(uniforName:syGL.AttributeUniform,glID, itemSize: number): void {
        var loc = getLocName(uniforName,true);
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.activeMatrixVertexAttribArray(glID, this[loc], itemSize)
        }
    }
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    public setUseTexture(glID: WebGLTexture, pos = 0, is2D: boolean = true): void {
        if (is2D) {
            // let loc: string = "u_texCoord" + pos + "_loc";
            let loc = getLocName(texture2DConstBridge[pos],true)
            if (this.checklocValid(this[loc])) {
                G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, glID, this[loc], pos)
            }
        }
        else {
            var loc = getLocName(syGL.AttributeUniform.CUBE_COORD,true)
            if (this.checklocValid(this[loc])) {
                G_DrawEngine.activeTexture(this._gl.TEXTURE_CUBE_MAP, glID, this[loc], pos)
            }
        }
    }
    /**
     * 设置延迟渲染的位置纹理
     * @param glID 
     * @param pos 
     * @param locType  a代表属性变量 u代表uniform变量
     */
    public setUseDeferredTexture(glID: WebGLTexture, pos: number, uniforName: syGL.AttributeUniform): void {
        var loc = getLocName(uniforName,true);
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, glID, this[loc], pos)
        }
    }
    public setUseSkyBox(glID: WebGLTexture, pos = 0): void {
        if (this.checklocValid(this.u_skybox_loc)) {
            var gl = this._gl;
            G_DrawEngine.activeTexture(gl.TEXTURE_CUBE_MAP, glID, this.u_skybox_loc, pos)
        }
    }
    /**
     * 
     * @param attrUni 
     * @param mat 
     */
    public bindMatrixToShader(uniforName: syGL.AttributeUniform, mat: Float32Array | any): void {
        var loc = getLocName(uniforName,true)
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.setUniformMatrix(this[loc], mat);
        }
    }
    //设置顶点值
    public setUseVertexAttribPointer(attributeName: syGL.AttributeUniform,glID, itemSize: number): void {
        var loc = getLocName(attributeName,false)
        if (this.checklocValid(this[loc])) {
            G_DrawEngine.activeVertexAttribArray(glID, this[loc], itemSize);
        }
    }
    public disableVertexAttribArray(): void {
        mapTree_a.forEach((value, key) => {
            var loc = getLocName(key,false);
            var suvtype = value;
            if (this._useVariantType.indexOf(suvtype) >= 0 && this.checklocValid(this[loc])) {
                G_DrawEngine.disableVertexAttribArray(this[loc]);
            }
        })
    }
}