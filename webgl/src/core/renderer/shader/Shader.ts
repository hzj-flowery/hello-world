
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

var mapTree_a: Map<syGL.AttributeUniform, Array<any>> = new Map();
var mapTree_u: Map<syGL.AttributeUniform, Array<any>> = new Map();
mapTree_a.set(syGL.AttributeUniform.POSITION, ["a_position_loc", ShaderUseVariantType.Vertex]);
mapTree_a.set(syGL.AttributeUniform.NORMAL, ["a_normal_loc", ShaderUseVariantType.Normal]);
mapTree_a.set(syGL.AttributeUniform.UV, ["a_uv_loc", ShaderUseVariantType.UVs]);
mapTree_a.set(syGL.AttributeUniform.TANGENT, ["a_tangent_loc", ShaderUseVariantType.Tangent]);
mapTree_a.set(syGL.AttributeUniform.VERT_COLOR, ["a_vert_color_loc", ShaderUseVariantType.VertColor]);
mapTree_a.set(syGL.AttributeUniform.VERT_Matrix, ["a_vert_matrix_loc", ShaderUseVariantType.VertMatrix]);

mapTree_u.set(syGL.AttributeUniform.TIME, ["u_time_loc", ShaderUseVariantType.Time]);
mapTree_u.set(syGL.AttributeUniform.COLOR, ["u_color_loc", ShaderUseVariantType.Color]);
mapTree_u.set(syGL.AttributeUniform.ALPHA, ["u_alpha_loc", ShaderUseVariantType.Alpha]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_AMBIENT_COLOR, ["u_ambient_loc", ShaderUseVariantType.AmbientLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_POINT_COLOR, ["u_point_loc", ShaderUseVariantType.PointLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_COLOR, ["u_light_color_loc", ShaderUseVariantType.ParallelLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_COLOR_DIR, ["u_light_color_dir_loc", ShaderUseVariantType.ParallelLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPECULAR_COLOR, ["u_light_specular_color_loc", ShaderUseVariantType.SpecularLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPECULAR_SHININESS, ["u_light_specular_shininess_loc", ShaderUseVariantType.SpecularLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_DIRECTION, ["u_light_spotDirection_loc", ShaderUseVariantType.SpotLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_COLOR, ["u_light_spotColor_loc", ShaderUseVariantType.SpotLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_INNER_LIMIT, ["u_light_spotInnerLimit_loc", ShaderUseVariantType.SpotLight]);
mapTree_u.set(syGL.AttributeUniform.LIGHT_SPOT_OUTER_LIMIT, ["u_light_spotOuterLimit_loc", ShaderUseVariantType.SpotLight]);
mapTree_u.set(syGL.AttributeUniform.VMMatrix, ["u_VMMatrix_loc", ShaderUseVariantType.ViewModel]);
mapTree_u.set(syGL.AttributeUniform.PMatrix, ["u_PMatrix_loc", ShaderUseVariantType.Projection]);
mapTree_u.set(syGL.AttributeUniform.Matrix, ["u_Matrix_loc", ShaderUseVariantType.CustomMatrix]);
mapTree_u.set(syGL.AttributeUniform.FOG_COLOR, ["u_fog_loc", ShaderUseVariantType.Fog]);
mapTree_u.set(syGL.AttributeUniform.FOG_DENSITY, ["u_fogDensity_loc", ShaderUseVariantType.Fog]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD0, ["u_texCoord0_loc", ShaderUseVariantType.TEX_COORD]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD1, ["u_texCoord1_loc", ShaderUseVariantType.TEX_COORD1]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD2, ["u_texCoord2_loc", ShaderUseVariantType.TEX_COORD2]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD3, ["u_texCoord3_loc", ShaderUseVariantType.TEX_COORD3]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD4, ["u_texCoord4_loc", ShaderUseVariantType.TEX_COORD4]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD5, ["u_texCoord5_loc", ShaderUseVariantType.TEX_COORD5]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD6, ["u_texCoord6_loc", ShaderUseVariantType.TEX_COORD6]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD7, ["u_texCoord7_loc", ShaderUseVariantType.TEX_COORD7]);
mapTree_u.set(syGL.AttributeUniform.TEX_COORD8, ["u_texCoord8_loc", ShaderUseVariantType.TEX_COORD8]);
mapTree_u.set(syGL.AttributeUniform.CUBE_COORD, ["u_cubeCoord_loc", ShaderUseVariantType.CUBE_COORD]);
// mapTree_u.set(syGL.AttributeUniform.SKYBOX,["u_skybox_loc",ShaderUseVariantType.SKYBOX]);  --天空盒异常手动处理
//uniform
mapTree_u.set(syGL.AttributeUniform.TEX_GPosition, ["u_gPosition_loc", ShaderUseVariantType.GPosition]);
mapTree_u.set(syGL.AttributeUniform.TEX_GNormal, ["u_gNormal_loc", ShaderUseVariantType.GNormal]);
mapTree_u.set(syGL.AttributeUniform.TEX_GColor, ["u_gColor_loc", ShaderUseVariantType.GColor]);
mapTree_u.set(syGL.AttributeUniform.TEX_GUv, ["u_gUv_loc", ShaderUseVariantType.GUv]);
mapTree_u.set(syGL.AttributeUniform.TEX_GDepth, ["u_gDepth_loc", ShaderUseVariantType.GDepth]);

mapTree_u.set(syGL.AttributeUniform.SHADOW_MAP, ["u_shadowMap_loc", ShaderUseVariantType.Shadow]);
mapTree_u.set(syGL.AttributeUniform.SHADOW_INFOR, ["u_shadowInfor_loc", ShaderUseVariantType.Shadow]);
mapTree_u.set(syGL.AttributeUniform.PVM_MATRIX, ["u_PVMMatrix_loc", ShaderUseVariantType.ProjectionViewModel]);
mapTree_u.set(syGL.AttributeUniform.PVM_MATRIX_INVERSE, ["u_PVMMatrix_inverse_loc", ShaderUseVariantType.ProjectionViewModelInverse]);
mapTree_u.set(syGL.AttributeUniform.MMatrix, ["u_MMatrix_loc", ShaderUseVariantType.Model]);
mapTree_u.set(syGL.AttributeUniform.VMatrix, ["u_VMatrix_loc", ShaderUseVariantType.View]);
mapTree_u.set(syGL.AttributeUniform.MIMatrix, ["u_MIMatrix_loc", ShaderUseVariantType.ModelInverse]);
mapTree_u.set(syGL.AttributeUniform.MTMatrix, ["u_MTMatrix_loc", ShaderUseVariantType.ModelTransform]);
mapTree_u.set(syGL.AttributeUniform.MITMatrix, ["u_MITMatrix_loc", ShaderUseVariantType.ModelInverseTransform]);
mapTree_u.set(syGL.AttributeUniform.PVMatrix, ["u_PVMatrix_loc", ShaderUseVariantType.ProjectionView]);
mapTree_u.set(syGL.AttributeUniform.PVMatrix_INVERSE, ["u_PVMatrix_inverse_loc", ShaderUseVariantType.ProjectionViewInverse]);
mapTree_u.set(syGL.AttributeUniform.CameraWorldPosition, ["u_camera_world_position_loc", ShaderUseVariantType.CameraWorldPosition]);
mapTree_u.set(syGL.AttributeUniform.LightWorldPosition, ["u_light_world_position_loc", ShaderUseVariantType.LightWorldPosition]);


export class Shader {
    private a_position_loc;//顶点属性位置
    private a_normal_loc;//法线属性的位置
    private a_uv_loc;//uv属性位置
    private a_tangent_loc;//切线属性位置
    private a_vert_color_loc;//节点颜色的位置
    private a_vert_matrix_loc;//顶点自定义矩阵位置

    private u_time_loc;//时间
    private u_color_loc;//节点颜色（该变量针对节点下的所有顶点）
    private u_alpha_loc;//节点透明度
    private u_light_color_loc;//光照属性位置
    private u_light_color_dir_loc;//光照方向属性位置
    private u_point_loc;//点光的颜色
    private u_ambient_loc;//环境光属性位置
    private u_light_specular_color_loc;//高光属性的位置
    private u_light_specular_shininess_loc;//高光属性的位置
    private u_light_spotDirection_loc;//聚光灯的方向
    private u_light_spotColor_loc;//聚光灯颜色位置
    private u_light_spotOuterLimit_loc;//聚光灯的外部限制
    private u_light_spotInnerLimit_loc;//聚光灯的内部限制

    private u_fog_loc;//雾的颜色
    private u_fogDensity_loc;//雾的密度


    private u_texCoord0_loc;//纹理属性0号位置
    private u_texCoord1_loc;//纹理属性1号位置
    private u_texCoord2_loc;//纹理属性2号位置
    private u_texCoord3_loc;//纹理属性3号位置
    private u_texCoord4_loc;//纹理属性4号位置
    private u_texCoord5_loc;//纹理属性5号位置
    private u_texCoord6_loc;//纹理属性6号位置
    private u_texCoord7_loc;//纹理属性7号位置
    private u_texCoord8_loc;//纹理属性8号位置
    private u_cubeCoord_loc;//立方体属性位置
    private u_skybox_loc;//天空盒属性位置

    private u_gPosition_loc;//位置纹理信息
    private u_gNormal_loc;//法线纹理信息
    private u_gColor_loc;//颜色纹理信息
    private u_gUv_loc;//uv纹理
    private u_gDepth_loc;//深度纹理

    private u_shadowMap_loc;//阴影贴图
    private u_shadowInfor_loc;//阴影信息

    private u_Matrix_loc;//万能矩阵属性的位置
    private u_VMMatrix_loc;//模型视口矩阵属性位置
    private u_PMatrix_loc;//透视投影矩阵属性位置
    private u_MMatrix_loc;//模型矩阵属性位置
    private u_MIMatrix_loc;//模型矩阵的逆矩阵属性位置
    private u_MTMatrix_loc;//模型矩阵的转置矩阵属性位置u_
    private u_MITMatrix_loc;//模型矩阵的逆矩阵的转置矩阵属性位置
    private u_VMatrix_loc;//视口矩阵属性位置
    private u_PVMMatrix_loc;//投影视口模型矩阵
    private u_PVMatrix_loc;//投影视口矩阵的位置
    private u_PVMatrix_inverse_loc;//投影视口矩阵的逆矩阵的位置
    private u_PVMMatrix_inverse_loc;//模型视图投影的逆矩阵
    private u_light_world_position_loc;//光的世界位置
    private u_camera_world_position_loc;//相机的世界位置

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
            let value = mapTree_u.get(uniformInfo.name as any)
            if (value) {
                //合法
                let loc = value[0];
                let SUVType = value[1];
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
            let value = mapTree_a.get(attribInfo.name as any);
            if (value) {
                let loc = value[0];
                let SUVType = value[1];
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
     * 设置使用雾
     * @param color 
     * @param density 
     */
    public setUseFog(color: Array<number>, density: number): void {
        if (this.checklocValid(this.u_fog_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_fog_loc, color)
        }
        if (this.checklocValid(this.u_fogDensity_loc)) {
            G_DrawEngine.setUniform1f(this.u_fogDensity_loc, density)
        }
    }
    /**
     * 设置使用时间
     * @param time 
     */
    public setUseTime(time: number): void {
        if (this.checklocValid(this.u_time_loc)) {
            G_DrawEngine.setUniform1f(this.u_time_loc, time)
        }
    }
    /**
     * 设置使用高光的颜色
     * @param color 
     */
    public setUseSpecularLightColor(color: Array<number>, shininess: number): void {
        if (this.checklocValid(this.u_light_specular_color_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_specular_color_loc, color);
        }
        if (this.checklocValid(this.u_light_specular_shininess_loc)) {
            G_DrawEngine.setUniform1f(this.u_light_specular_shininess_loc, shininess)
        }
    }
    //设置使用平行光
    public setUseParallelLight(color: Array<number>, direction: Array<number>): void {
        if (this.checklocValid(this.u_light_color_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_color_loc, color);
        }
        if (this.checklocValid(this.u_light_color_dir_loc)) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_color_dir_loc, direction);
        }
    }

    /**
     * 设置使用聚光灯
     * @param color 
     * @param dir 
     * @param inner 
     * @param outer 
     */
    public setUseSpotLight(color: Array<number>, dir: Array<number>, inner: number, outer: number): void {
        if (this.checklocValid(this.u_light_spotColor_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_spotColor_loc, color);
        }
        if (this.checklocValid(this.u_light_spotDirection_loc)) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_spotDirection_loc, dir);
        }
        if (this.checklocValid(this.u_light_spotInnerLimit_loc)) {
            G_DrawEngine.setUniform1f(this.u_light_spotInnerLimit_loc, inner);
        }
        if (this.checklocValid(this.u_light_spotOuterLimit_loc)) {
            G_DrawEngine.setUniform1f(this.u_light_spotOuterLimit_loc, outer);
        }
    }


    /**
   * 设置使用节点自定义颜色
   * @param color 
   */
    public setUseNodeColor(color: Array<number>): void {
        if (this.checklocValid(this.u_color_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_color_loc, color);
        }
    }
    /**
     * 设置使用节点的透明度
     * @param alpha 
     */
    public setUseNodeAlpha(alpha: number): void {
        if (this.checklocValid(this.u_alpha_loc)) {
            G_DrawEngine.setUniform1f(this.u_alpha_loc, alpha);
        }
    }
    /**
     * 设置使用环境光的颜色
     * @param color 
     */
    public setUseAmbientLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_ambient_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_ambient_loc, color);
        }
    }

    /**
     * 设置使用点光的颜色
     * @param color 
     */
    public setUsePointLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_point_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_point_loc, color);
        }
    }

    /**
     * 设置使用自定义定点颜色
     * @param color 
     */
    public setUseNodeVertColor(glID, itemSize: number): void {
        if (this.checklocValid(this.a_vert_color_loc)) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_vert_color_loc, itemSize);
        }
    }
    /**
     * 设置使用顶点矩阵
     * @param glID 
     * @param itemSize 
     */
    public setUseVertMatrix(glID, itemSize: number): void {
        if (this.checklocValid(this.a_vert_matrix_loc)) {
            G_DrawEngine.activeMatrixVertexAttribArray(glID, this.a_vert_matrix_loc, itemSize)
        }
    }
    /**
     * 设置使用相机的世界位置
     * @param pos 
     */
    public setUseCameraWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_camera_world_position_loc)) {
            G_DrawEngine.setUniformFloatVec3(this.u_camera_world_position_loc, pos);
        }
    }
    /**
     * 设置使用光的世界位置
     * @param pos 
     */
    public setUseLightWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_light_world_position_loc)) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_world_position_loc, pos);
        }
    }
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    public setUseTexture(glID: WebGLTexture, pos = 0, is2D: boolean = true): void {
        if (is2D) {
            let loc: string = "u_texCoord" + pos + "_loc";
            if (this.checklocValid(this[loc])) {
                G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, glID, this[loc], pos)
            }
        }
        else {
            if (this.checklocValid(this.u_cubeCoord_loc)) {
                G_DrawEngine.activeTexture(this._gl.TEXTURE_CUBE_MAP, glID, this.u_cubeCoord_loc, pos)
            }
        }
    }
    /**
     * 设置延迟渲染的位置纹理
     * @param glID 
     * @param pos 
     * @param locType  a代表属性变量 u代表uniform变量
     */
    public setUseDeferredTexture(glID: WebGLTexture, pos: number, attibuteUniform: syGL.AttributeUniform): void {
        var value = mapTree_u.get(attibuteUniform)
        if (!value) {
            return
        }
        var loc = value[0];
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
     * 设置使用阴影
     * @param shaderMap 
     * @param mapInfor 
     * mapInfor[0]:shadowMin
     * mapInfor[1]:shadowMax
     * mapInfor[2]:shadowBias
     * MapInfor[3]:shadowSize
     */
    public setUseShadow(shaderMap: WebGLTexture, mapInfor: Array<number>, pos = 0): void {
        if (this.checklocValid(this.u_shadowMap_loc)) {
            G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, shaderMap, this.u_shadowMap_loc, pos)
        }
        if (this.checklocValid(this.u_shadowInfor_loc)) {
            G_DrawEngine.setUniformFloatVec4(this.u_shadowInfor_loc, mapInfor)
        }
    }
    /**
     * 
     * @param attrUni 
     * @param mat 
     */
    public bindMatrixToShader(attrUni: syGL.AttributeUniform, mat: Float32Array | any): void {
        var value = mapTree_u.get(attrUni);
        if (value) {
            var loc = value[0];
            if (this.checklocValid(this[loc])) {
                G_DrawEngine.setUniformMatrix(this[loc], mat);
            }
        }
    }
    //设置顶点值
    public setUseVertexAttribPointerForVertex(glID, itemSize: number): void {
        if (this.checklocValid(this.a_position_loc)) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_position_loc, itemSize);
        }
    }
    //设置法线值
    public setUseVertexAttriPointerForNormal(glID, itemSize: number): void {
        if (this.checklocValid(this.a_normal_loc)) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_normal_loc, itemSize);
        }
    }
    //设置uv值
    public setUseVertexAttribPointerForUV(glID, itemSize: number): void {
        if (this.checklocValid(this.a_uv_loc)) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_uv_loc, itemSize);
        }
    }

    public disableVertexAttribArray(): void {
        mapTree_a.forEach((value, key) => {
            var loc = value[0];
            var suvtype = value[1];
            var searchStr = key;
            if (this._useVariantType.indexOf(suvtype) >= 0 && this.checklocValid(this[loc])) {
                G_DrawEngine.disableVertexAttribArray(this[loc]);
            }
        })
    }
}