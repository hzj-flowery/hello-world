
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

var mapTree:Map<syGL.AttributeUniform,Array<any>> = new Map();
mapTree.set(syGL.AttributeUniform.POSITION,[0,"a_position_loc",ShaderUseVariantType.Vertex]);
mapTree.set(syGL.AttributeUniform.NORMAL,[0,"a_normal_loc",ShaderUseVariantType.Normal]);
mapTree.set(syGL.AttributeUniform.UV,[0,"a_uv_loc",ShaderUseVariantType.UVs]);
mapTree.set(syGL.AttributeUniform.TANGENT,[0,"a_tangent_loc",ShaderUseVariantType.Tangent]);
mapTree.set(syGL.AttributeUniform.VERT_COLOR,[0,"a_vert_color_loc",ShaderUseVariantType.VertColor]);
mapTree.set(syGL.AttributeUniform.VERT_Matrix,[0,"a_vert_matrix_loc",ShaderUseVariantType.VertMatrix]);
mapTree.set(syGL.AttributeUniform.TIME,[1,"u_time_loc",ShaderUseVariantType.Time]);
mapTree.set(syGL.AttributeUniform.COLOR,[1,"u_color_loc",ShaderUseVariantType.Color]);
mapTree.set(syGL.AttributeUniform.ALPHA,[1,"u_alpha_loc",ShaderUseVariantType.Alpha]);
mapTree.set(syGL.AttributeUniform.LIGHT_AMBIENT_COLOR,[1,"u_ambientColor_loc",ShaderUseVariantType.AmbientLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_POINT_COLOR,[1,"u_pointColor_loc",ShaderUseVariantType.PointLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_COLOR,[1,"u_light_color_loc",ShaderUseVariantType.ParallelLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_COLOR_DIR,[1,"u_light_color_dir_loc",ShaderUseVariantType.ParallelLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPECULAR_COLOR,[1,"u_light_specular_color_loc",ShaderUseVariantType.SpecularLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPECULAR_SHININESS,[1,"u_light_specular_shininess_loc",ShaderUseVariantType.SpecularLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPOT_DIRECTION,[1,"u_light_spotDirection_loc",ShaderUseVariantType.SpotLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPOT_COLOR,[1,"u_light_spotColor_loc",ShaderUseVariantType.SpotLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPOT_INNER_LIMIT,[1,"u_light_spotInnerLimit_loc",ShaderUseVariantType.SpotLight]);
mapTree.set(syGL.AttributeUniform.LIGHT_SPOT_OUTER_LIMIT,[1,"u_light_spotOuterLimit_loc",ShaderUseVariantType.SpotLight]);
mapTree.set(syGL.AttributeUniform.VMMatrix,[1,"u_VMMatrix_loc",ShaderUseVariantType.ViewModel]);
mapTree.set(syGL.AttributeUniform.PMatrix,[1,"u_PMatrix_loc",ShaderUseVariantType.Projection]);
mapTree.set(syGL.AttributeUniform.Matrix,[1,"u_Matrix_loc",ShaderUseVariantType.CustomMatrix]);
mapTree.set(syGL.AttributeUniform.FOG_COLOR,[1,"u_fogColor_loc",ShaderUseVariantType.Fog]);
mapTree.set(syGL.AttributeUniform.FOG_DENSITY,[1,"u_fogDensity_loc",ShaderUseVariantType.Fog]);
mapTree.set(syGL.AttributeUniform.TEX_COORD0,[1,"u_texCoord0_loc",ShaderUseVariantType.TEX_COORD]);
mapTree.set(syGL.AttributeUniform.TEX_COORD1,[1,"u_texCoord1_loc",ShaderUseVariantType.TEX_COORD1]);
mapTree.set(syGL.AttributeUniform.TEX_COORD2,[1,"u_texCoord2_loc",ShaderUseVariantType.TEX_COORD2]);
mapTree.set(syGL.AttributeUniform.TEX_COORD3,[1,"u_texCoord3_loc",ShaderUseVariantType.TEX_COORD3]);
mapTree.set(syGL.AttributeUniform.TEX_COORD4,[1,"u_texCoord4_loc",ShaderUseVariantType.TEX_COORD4]);
mapTree.set(syGL.AttributeUniform.TEX_COORD5,[1,"u_texCoord5_loc",ShaderUseVariantType.TEX_COORD5]);
mapTree.set(syGL.AttributeUniform.TEX_COORD6,[1,"u_texCoord6_loc",ShaderUseVariantType.TEX_COORD6]);
mapTree.set(syGL.AttributeUniform.TEX_COORD7,[1,"u_texCoord7_loc",ShaderUseVariantType.TEX_COORD7]);
mapTree.set(syGL.AttributeUniform.TEX_COORD8,[1,"u_texCoord8_loc",ShaderUseVariantType.TEX_COORD8]);
mapTree.set(syGL.AttributeUniform.CUBE_COORD,[1,"u_cubeCoord_loc",ShaderUseVariantType.CUBE_COORD]);
// mapTree.set(syGL.AttributeUniform.SKYBOX,[1,"u_skybox_loc",ShaderUseVariantType.SKYBOX]);  --天空盒异常手动处理
//uniform
mapTree.set(syGL.AttributeUniform.TEX_GPosition,[1,"u_gPosition_loc",ShaderUseVariantType.GPosition]);
mapTree.set(syGL.AttributeUniform.TEX_GNormal,[1,"u_gNormal_loc",ShaderUseVariantType.GNormal]);
mapTree.set(syGL.AttributeUniform.TEX_GColor,[1,"u_gColor_loc",ShaderUseVariantType.GColor]);
mapTree.set(syGL.AttributeUniform.SHADOW_MAP,[1,"u_shadowMap_loc",ShaderUseVariantType.Shadow]);
mapTree.set(syGL.AttributeUniform.SHADOW_INFOR,[1,"u_shadowInfor_loc",ShaderUseVariantType.Shadow]);
mapTree.set(syGL.AttributeUniform.PVM_MATRIX,[1,"u_PVMMatrix_loc",ShaderUseVariantType.ProjectionViewModel]);
mapTree.set(syGL.AttributeUniform.PVM_MATRIX_INVERSE,[1,"u_PVMMatrix_inverse_loc",ShaderUseVariantType.ProjectionViewModelInverse]);
mapTree.set(syGL.AttributeUniform.MMatrix,[1,"u_MMatrix_loc",ShaderUseVariantType.Model]);
mapTree.set(syGL.AttributeUniform.VMatrix,[1,"u_VMatrix_loc",ShaderUseVariantType.View]);
mapTree.set(syGL.AttributeUniform.MIMatrix,[1,"u_MIMatrix_loc",ShaderUseVariantType.ModelInverse]);
mapTree.set(syGL.AttributeUniform.MTMatrix,[1,"u_MTMatrix_loc",ShaderUseVariantType.ModelTransform]);
mapTree.set(syGL.AttributeUniform.MITMatrix,[1,"u_MITMatrix_loc",ShaderUseVariantType.ModelInverseTransform]);
mapTree.set(syGL.AttributeUniform.PVMatrix,[1,"u_PVMatrix_loc",ShaderUseVariantType.ProjectionView]);
mapTree.set(syGL.AttributeUniform.PVMatrix_INVERSE,[1,"u_PVMatrix_inverse_loc",ShaderUseVariantType.ProjectionViewInverse]);
mapTree.set(syGL.AttributeUniform.CameraWorldPosition,[1,"u_camera_world_position_loc",ShaderUseVariantType.CameraWorldPosition]);
mapTree.set(syGL.AttributeUniform.LightWorldPosition,[1,"u_light_world_position_loc",ShaderUseVariantType.LightWorldPosition]);


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
    private u_pointColor_loc;//点光的颜色
    private u_ambientColor_loc;//环境光属性位置
    private u_light_specular_color_loc;//高光属性的位置
    private u_light_specular_shininess_loc;//高光属性的位置
    private u_light_spotDirection_loc;//聚光灯的方向
    private u_light_spotColor_loc;//聚光灯颜色位置
    private u_light_spotOuterLimit_loc;//聚光灯的外部限制
    private u_light_spotInnerLimit_loc;//聚光灯的内部限制

    private u_fogColor_loc;//雾的颜色
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
    protected _mapTree:Map<syGL.AttributeUniform,Array<any>> = new Map();
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
        var glID = this._spGLID;
        var gl = this._gl;
        mapTree.forEach((value,key)=>{
            var tag = value[0];
            var loc = value[1];
            var SUVType = value[2];
            var searchStr = key;
            if(tag==0)
            {
                //attribute变量
                this[loc]=gl.getAttribLocation(glID, searchStr);
                this[loc] >= 0 ? this.pushShaderVariant(SUVType) : null;
            }
            else if(tag==1)
            {
                //uniform变量
                this[loc]=gl.getUniformLocation(glID, searchStr);
                this[loc]!=null? this.pushShaderVariant(SUVType) : null;
            }
        })
        this.u_skybox_loc = gl.getUniformLocation(glID, syGL.AttributeUniform.SKYBOX);
        if (this.u_skybox_loc) {
            setTimeout(() => {
                this.pushShaderVariant(ShaderUseVariantType.SKYBOX)
            }, 1000);
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
    private checklocValid(loc: number, tagName: string): boolean {
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
        if (this.checklocValid(this.u_fogColor_loc, "u_fogColor_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_fogColor_loc, color)
        }
        if (this.checklocValid(this.u_fogDensity_loc, "u_fogDensity_loc")) {
            G_DrawEngine.setUniform1f(this.u_fogDensity_loc, density)
        }
    }
    /**
     * 设置使用时间
     * @param time 
     */
    public setUseTime(time: number): void {
        if (this.checklocValid(this.u_time_loc, "u_time_loc")) {
            G_DrawEngine.setUniform1f(this.u_time_loc, time)
        }
    }
    /**
     * 设置使用高光的颜色
     * @param color 
     */
    public setUseSpecularLightColor(color: Array<number>, shininess: number): void {
        if (this.checklocValid(this.u_light_specular_color_loc, "u_light_specular_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_specular_color_loc, color);
        }
        if (this.checklocValid(this.u_light_specular_shininess_loc, "u_light_specular_shininess_loc")) {
            G_DrawEngine.setUniform1f(this.u_light_specular_shininess_loc, shininess)
        }
    }
    //设置使用平行光
    public setUseParallelLight(color: Array<number>, direction: Array<number>): void {
        if (this.checklocValid(this.u_light_color_loc, "u_light_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_color_loc, color);
        }
        if (this.checklocValid(this.u_light_color_dir_loc, "u_light_color_dir_loc")) {
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
        if (this.checklocValid(this.u_light_spotColor_loc, "u_light_spotColor_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_spotColor_loc, color);
        }
        if (this.checklocValid(this.u_light_spotDirection_loc, "u_light_spotDirection_loc")) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_spotDirection_loc, dir);
        }
        if (this.checklocValid(this.u_light_spotInnerLimit_loc, "u_light_spotInnerLimit_loc")) {
            G_DrawEngine.setUniform1f(this.u_light_spotInnerLimit_loc, inner);
        }
        if (this.checklocValid(this.u_light_spotOuterLimit_loc, "u_light_spotOuterLimit_loc")) {
            G_DrawEngine.setUniform1f(this.u_light_spotOuterLimit_loc, outer);
        }
    }


    /**
   * 设置使用节点自定义颜色
   * @param color 
   */
    public setUseNodeColor(color: Array<number>): void {
        if (this.checklocValid(this.u_color_loc, "u_node_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_color_loc, color);
        }
    }
    /**
     * 设置使用节点的透明度
     * @param alpha 
     */
    public setUseNodeAlpha(alpha:number):void{
        if (this.checklocValid(this.u_alpha_loc, "u_alpha_loc")) {
            G_DrawEngine.setUniform1f(this.u_alpha_loc, alpha);
        }
    }
    /**
     * 设置使用环境光的颜色
     * @param color 
     */
    public setUseAmbientLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_ambientColor_loc, "u_ambientColor_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_ambientColor_loc, color);
        }
    }

    /**
     * 设置使用点光的颜色
     * @param color 
     */
    public setUsePointLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_pointColor_loc, "u_pointColor_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_pointColor_loc, color);
        }
    }

    /**
     * 设置使用自定义定点颜色
     * @param color 
     */
    public setUseNodeVertColor(glID, itemSize: number): void {
        if (this.checklocValid(this.a_vert_color_loc, "a_vert_color_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_vert_color_loc, itemSize);
        }
    }
    /**
     * 设置使用顶点矩阵
     * @param glID 
     * @param itemSize 
     */
    public setUseVertMatrix(glID, itemSize: number): void {
        if (this.checklocValid(this.a_vert_matrix_loc, "a_vert_matrix_loc")) {
            G_DrawEngine.activeMatrixVertexAttribArray(glID, this.a_vert_matrix_loc, itemSize)
        }
    }
    /**
     * 设置使用相机的世界位置
     * @param pos 
     */
    public setUseCameraWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_camera_world_position_loc, "u_camera_world_position_loc")) {
            G_DrawEngine.setUniformFloatVec3(this.u_camera_world_position_loc, pos);
        }
    }
    /**
     * 设置使用光的世界位置
     * @param pos 
     */
    public setUseLightWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_light_world_position_loc, "u_light_world_position_loc")) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_world_position_loc, pos);
        }
    }
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    public setUseTexture(glID: WebGLTexture, pos = 0, is2D: boolean = true): void {
        if (is2D) {
            let loc: string = "u_texCoord" + pos + "_loc";
            if (this.checklocValid(this[loc], loc)) {
                G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, glID, this[loc], pos)
            }
        }
        else {
            if (this.checklocValid(this.u_cubeCoord_loc, "u_cubeCoord_loc")) {
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
    public setUseDeferredTexture(glID: WebGLTexture, pos: number, texType: syRender.DeferredTexture): void {
        var loc = ""
        if (texType == syRender.DeferredTexture.Position) {
            loc ="u_gPosition_loc";
        }
        else if (texType == syRender.DeferredTexture.Normal) {
            loc ="u_gNormal_loc"; //设置延迟渲染的法线纹理
        }
        else if (texType == syRender.DeferredTexture.Color) {
            loc ="u_gColor_loc"; //设置延迟渲染的颜色纹理
        }
        if (this.checklocValid(this[loc], loc)) {
            G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, glID, this[loc], pos)
        }
    }
    public setUseSkyBox(glID: WebGLTexture, pos = 0): void {
        if (this.checklocValid(this.u_skybox_loc, "u_skybox_loc")) {
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
        if (this.checklocValid(this.u_shadowMap_loc, "u_shadowMap_loc")) {
            G_DrawEngine.activeTexture(this._gl.TEXTURE_2D, shaderMap, this.u_shadowMap_loc, pos)
        }
        if (this.checklocValid(this.u_shadowInfor_loc, "u_shadowInfor_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_shadowInfor_loc, mapInfor)
        }
    }
    //设置使用投影视口模型矩阵
    public setUseProjectViewModelMatrix(pvmMatrix): void {
        if (this.checklocValid(this.u_PVMMatrix_loc, "u_PVMMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_PVMMatrix_loc, pvmMatrix);
        }
    }
    public setUseProjectionViewMatrix(mat): void {
        if (this.checklocValid(this.u_PVMatrix_loc, "u_PVMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_PVMatrix_loc, mat)
        }
    }
    //设置使用万能矩阵
    public setUseMatrix(mat): void {
        if (this.checklocValid(this.u_Matrix_loc, "u_Matrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_Matrix_loc, mat)
        }
    }
    public setUseProjectionViewInverseMatrix(mat): void {
        if (this.checklocValid(this.u_PVMatrix_inverse_loc, "u_PVMatrix_inverse_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_PVMatrix_inverse_loc, mat);
        }
    }
    //设置使用投影视口模型矩阵的逆矩阵
    public setUseProjectViewModelInverseMatrix(matrix): void {
        if (this.checklocValid(this.u_PVMMatrix_inverse_loc, "u_PVMMatrix_inverse_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_PVMMatrix_inverse_loc, matrix)
        }
    }
    //设置视口矩阵
    public setUseViewMatrix(vMatrix): void {
        if (this.checklocValid(this.u_VMatrix_loc, "u_VMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_VMatrix_loc, vMatrix);
        }
    }
    //设置模型视口矩阵
    public setUseModelViewMatrix(mvMatrix): void {
        if (this.checklocValid(this.u_VMMatrix_loc, "u_VMMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_VMMatrix_loc, mvMatrix);
        }
    }
    //设置透视投影矩阵
    public setUseProjectionMatrix(projMatrix): void {
        if (this.checklocValid(this.u_PMatrix_loc, "u_PMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_PMatrix_loc, projMatrix);
        }
    }
    //设置模型世界矩阵
    public setUseModelWorldMatrix(wMatrix): void {
        if (this.checklocValid(this.u_MMatrix_loc, "u_MMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_MMatrix_loc, wMatrix)
        }
    }
    //设置模型世界矩阵的逆矩阵
    public setUseModelWorldInverseMatrix(wiMatrix): void {
        if (this.checklocValid(this.u_MIMatrix_loc, "u_MIMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_MIMatrix_loc, wiMatrix)
        }
    }
    //设置模型世界矩阵的转置矩阵
    public setUseModelTransformWorldMatrix(wtMatrix): void {
        if (this.checklocValid(this.u_MTMatrix_loc, "u_MTMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_MTMatrix_loc, wtMatrix);
        }
    }
    //设置模型世界矩阵的逆矩阵的转置矩阵
    public setUseModelInverseTransformWorldMatrix(witMatrix): void {
        if (this.checklocValid(this.u_MITMatrix_loc, "u_MITMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_MITMatrix_loc, witMatrix);
        }
    }
    //设置顶点值
    public setUseVertexAttribPointerForVertex(glID, itemSize: number): void {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_position_loc, itemSize);
        }
    }
    //设置法线值
    public setUseVertexAttriPointerForNormal(glID, itemSize: number): void {
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_normal_loc, itemSize);
        }
    }
    //设置uv值
    public setUseVertexAttribPointerForUV(glID, itemSize: number): void {
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID, this.a_uv_loc, itemSize);
        }
    }

    public disableVertexAttribArray(): void {
        if (this._useVariantType.indexOf(ShaderUseVariantType.Vertex) >= 0 && this.checklocValid(this.a_position_loc, "a_position_loc")) {// 设定为数组类型的变量数据
            G_DrawEngine.disableVertexAttribArray(this.a_position_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.UVs) >= 0 && this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_uv_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.Normal) >= 0 && this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_normal_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.Tangent) >= 0 && this.checklocValid(this.a_tangent_loc, "a_tangent_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_tangent_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.VertMatrix) >= 0 && this.checklocValid(this.a_vert_matrix_loc, "a_vert_matrix_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_vert_matrix_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.VertColor) >= 0 && this.checklocValid(this.a_vert_color_loc, "a_vert_color_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_vert_color_loc);
        }
    }
}