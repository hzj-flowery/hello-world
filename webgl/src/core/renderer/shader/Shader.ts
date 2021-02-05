
import { G_DrawEngine } from "../base/DrawEngine";
import { glvert_attr_semantic} from "../gfx/GLEnums";
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

export class Shader {
    private a_position_loc;//顶点属性位置
    private a_normal_loc;//法线属性的位置
    private a_uv_loc;//uv属性位置
    private a_tangent_loc;//切线属性位置
    private a_vert_color_loc;//节点颜色的位置
    private a_vert_matrix_loc;//顶点自定义矩阵位置
    private u_color_loc;//节点颜色（该变量针对节点下的所有顶点）
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


    private u_texCoord_loc;//纹理属性0号位置
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
    protected _spGLID;
    public readonly name: string;
    private _useVariantType: Array<ShaderUseVariantType> = [];
    constructor(gl, glID, name) {
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
        var _glID = this._spGLID;
        var gl = this._gl;
        this.a_position_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.POSITION);
        this.a_normal_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NORMAL);
        this.a_uv_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.UV);
        this.a_tangent_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.TANGENT);
        this.a_vert_color_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.VERT_COLOR);
        this.a_vert_matrix_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.VERT_Matrix);

        this.u_color_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.COLOR);
        this.u_ambientColor_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_AMBIENT_COLOR);
        this.u_pointColor_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_POINT_COLOR);
        this.u_light_color_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR);
        this.u_light_color_dir_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR_DIR);
        this.u_light_specular_color_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPECULAR_COLOR);
        this.u_light_specular_shininess_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPECULAR_SHININESS);
        this.u_light_spotDirection_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPOT_DIRECTION);
        this.u_light_spotColor_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPOT_COLOR);
        this.u_light_spotInnerLimit_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPOT_INNER_LIMIT);
        this.u_light_spotOuterLimit_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_SPOT_OUTER_LIMIT);

        this.u_VMMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.VMMatrix);
        this.u_PMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PMatrix);
        this.u_Matrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.Matrix);

        this.u_fogColor_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.FOG_COLOR);
        this.u_fogDensity_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.FOG_DENSITY);

        this.u_texCoord_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD);
        this.u_texCoord1_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD1);
        this.u_texCoord2_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD2);
        this.u_texCoord3_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD3);
        this.u_texCoord4_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD4);
        this.u_texCoord5_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD5);
        this.u_texCoord6_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD6);
        this.u_texCoord7_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD7);
        this.u_texCoord8_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.TEX_COORD8);
        this.u_cubeCoord_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.CUBE_COORD);
        this.u_skybox_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.SKYBOX);

        this.u_shadowMap_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.SHADOW_MAP);
        this.u_shadowInfor_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.SHADOW_INFOR);

        this.u_PVMMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVM_MATRIX);
        this.u_PVMMatrix_inverse_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVM_MATRIX_INVERSE);
        this.u_MMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MMatrix);
        this.u_VMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.VMatrix);
        this.u_MIMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MIMatrix);
        this.u_MTMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MTMatrix);
        this.u_MITMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MITMatrix);
        this.u_PVMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVMatrix);
        this.u_PVMatrix_inverse_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVMatrix_INVERSE);
        this.u_camera_world_position_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.CameraWorldPosition);
        this.u_light_world_position_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LightWorldPosition);

        this.searchUseVariant()
    }
    /**
     * 查找使用到的变量
     */
    private searchUseVariant(): void {
        this.a_position_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.Vertex) : null;
        this.a_normal_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.Normal) : null;
        this.a_uv_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.UVs) : null;
        this.a_tangent_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.Tangent) : null;
        this.a_vert_color_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.VertColor) : null;
        this.a_vert_matrix_loc >= 0 ? this.pushShaderVariant(ShaderUseVariantType.VertMatrix) : null;

        this.u_color_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.Color) : null;
        this.u_ambientColor_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.AmbientLight) : null;
        this.u_pointColor_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.PointLight) : null;
        this.u_light_color_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ParallelLight) : null;
        // this.u_light_color_dir_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ParallelLight) : null;
        this.u_light_specular_color_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpecularLight) : null;
        // this.u_light_specular_shininess_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpecularLight) : null;
        this.u_light_spotColor_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpotLight) : null;
        // this.u_light_spotDirection_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpotLight) : null;
        // this.u_light_spotInnerLimit_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpotLight) : null;
        // this.u_light_spotOuterLimit_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.SpotLight) : null;

        this.u_shadowMap_loc !=null? this.pushShaderVariant(ShaderUseVariantType.Shadow) : null;

        this.u_VMMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ViewModel) : null;
        this.u_PMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.Projection) : null;
        this.u_Matrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.CustomMatrix) : null;

        this.u_fogColor_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.Fog) : null;
        this.u_fogDensity_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.Fog) : null;

        this.u_texCoord_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD) : null;
        this.u_texCoord1_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD1) : null;
        this.u_texCoord2_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD2) : null;
        this.u_texCoord3_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD3) : null;
        this.u_texCoord4_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD4) : null;
        this.u_texCoord5_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD5) : null;
        this.u_texCoord6_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD6) : null;
        this.u_texCoord7_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD7) : null;
        this.u_texCoord8_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.TEX_COORD8) : null;
        this.u_cubeCoord_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.CUBE_COORD) : null;
        if(this.u_skybox_loc)
        {
            setTimeout(()=>{
                this.pushShaderVariant(ShaderUseVariantType.SKYBOX)
            },1000);
        }
        this.u_PVMMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ProjectionViewModel) : null;
        this.u_PVMMatrix_inverse_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ProjectionViewModelInverse) : null;
        this.u_MMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.Model) : null;
        this.u_VMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.View) : null;
        this.u_MIMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ModelInverse) : null;
        this.u_MTMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ModelTransform) : null;
        this.u_MITMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ModelInverseTransform) : null;
        this.u_PVMatrix_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ProjectionView) : null;
        this.u_PVMatrix_inverse_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.ProjectionViewInverse) : null;
        this.u_camera_world_position_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.CameraWorldPosition) : null;
        this.u_light_world_position_loc !=null ? this.pushShaderVariant(ShaderUseVariantType.LightWorldPosition) : null;
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

    public getGLID() {
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
    public setUseTexture(glID: WebGLTexture, pos = 0): void {
        let loc: string = (pos == 0) ? "u_texCoord_loc" : "u_texture" + pos + "_loc"
        if (this.checklocValid(this[loc], loc)) {
            G_DrawEngine.active2DTexture(glID, this[loc], pos)
        }
    }
    public setUseSkyBox(glID: WebGLTexture): void {
        if (this.checklocValid(this.u_skybox_loc, "u_skybox_loc")) {
            var gl = this._gl;
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            G_DrawEngine.activeCubeTexture(glID, this.u_skybox_loc, 0)
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
    public setUseShadow(shaderMap:WebGLTexture,mapInfor:Array<number>):void{
        if (this.checklocValid(this.u_shadowMap_loc, "u_shadowMap_loc")) {
            G_DrawEngine.active2DTexture(shaderMap, this.u_shadowMap_loc, 1)
        }
        if(this.checklocValid(this.u_shadowInfor_loc,"u_shadowInfor_loc"))
        {
            G_DrawEngine.setUniformFloatVec4(this.u_shadowInfor_loc,mapInfor)
        }
    }
    public setUseCubeTexture(glID: WebGLTexture): void {
        if (this.checklocValid(this.u_cubeCoord_loc, "u_cubeCoord_loc")) {
            G_DrawEngine.activeCubeTexture(glID, this.u_cubeCoord_loc, 0)
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