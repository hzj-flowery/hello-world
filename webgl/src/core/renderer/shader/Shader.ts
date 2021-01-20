
import { G_DrawEngine } from "../base/DrawEngine";
import { glvert_attr_semantic, glTEXTURE_UNIT_VALID } from "../gfx/GLEnums";
import { G_ShaderFactory } from "./ShaderFactory";
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
    private a_node_matrix_loc;//节点自定义矩阵位置
    private u_node_color_loc;//节点颜色（该变量针对节点下的所有顶点）
    private u_light_color_loc;//光照属性位置
    private u_light_color_dir_loc;//光照方向属性位置
    private u_pointColor_loc;//点光的颜色
    private u_ambientColor_loc;//环境光属性位置
    private u_light_specular_color_loc;//高光属性的位置
    private u_light_specular_shininess_loc;//高光属性的位置
    private u_MVMatrix_loc;//模型视口矩阵属性位置
    private u_PMatrix_loc;//透视投影矩阵属性位置
    private u_MMatrix_loc;//模型矩阵属性位置
    private u_MIMatrix_loc;//模型矩阵的逆矩阵属性位置
    private u_MTMatrix_loc;//模型矩阵的转置矩阵属性位置
    private u_MITMatrix_loc;//模型矩阵的逆矩阵的转置矩阵属性位置
    private u_VMatrix_loc;//视口矩阵属性位置

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

    private u_pvm_matrix_loc;//投影视口模型矩阵
    private u_pv_matrix_loc;//投影视口矩阵的位置
    private u_pv_matrix_inverse_loc;//投影视口矩阵的逆矩阵的位置
    private u_pvm_matrix_inverse_loc;//模型视图投影的逆矩阵
    private u_light_world_position_loc;//光的世界位置
    private u_camera_world_position_loc;//相机的世界位置

    protected _gl: WebGLRenderingContext;
    protected _spGLID;
    public readonly name:string;
    private _useVariantType: Array<ShaderUseVariantType> = [];
    constructor(gl,glID,name) {
        this._gl = gl;
        this._spGLID = glID;
        this.name = name;
        this._useVariantType = [];
        this._useVariantType.push(ShaderUseVariantType.Projection);
        this._useVariantType.push(ShaderUseVariantType.Model);
        this._useVariantType.push(ShaderUseVariantType.View);
        this.onCreateShader();
    }
    protected onCreateShader(): void {
        var _glID = this._spGLID;
        var gl = this._gl;
        this.a_position_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.POSITION);
        this.a_normal_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NORMAL);
        this.a_uv_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.UV);
        this.a_tangent_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.TANGENT);
        this.a_vert_color_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.COLOR);
        this.a_node_matrix_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NODE_Matrix);

        
        this.u_node_color_loc = gl.getUniformLocation(_glID,glvert_attr_semantic.NODE_COLOR);
        this.u_ambientColor_loc = gl.getUniformLocation(_glID,glvert_attr_semantic.LIGHT_AMBIENT_COLOR);
        this.u_pointColor_loc = gl.getUniformLocation(_glID,glvert_attr_semantic.LIGHT_POINT_COLOR);
        this.u_light_color_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR);
        this.u_light_color_dir_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR_DIR);
        this.u_light_specular_color_loc = gl.getUniformLocation(_glID,glvert_attr_semantic.LIGHT_SPECULAR_COLOR);
        this.u_light_specular_shininess_loc = gl.getUniformLocation(_glID,glvert_attr_semantic.LIGHT_SPECULAR_SHININESS);     
        this.u_MVMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MVMatrix);
        this.u_PMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PMatrix);

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

        this.u_pvm_matrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVM_MATRIX);
        this.u_pvm_matrix_inverse_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVM_MATRIX_INVERSE);
        this.u_MMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MMatrix);
        this.u_VMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.VMatrix);
        this.u_MIMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MIMatrix);
        this.u_MTMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MTMatrix);
        this.u_MITMatrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.MITMatrix);
        this.u_pv_matrix_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVMatrix);
        this.u_pv_matrix_inverse_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.PVMatrix_INVERSE);
        this.u_camera_world_position_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.CameraWorldPosition);
        this.u_light_world_position_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LightWorldPosition);

    }
    public pushShaderVariant(type: ShaderUseVariantType): void {
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
    public get useVariantType():Array<ShaderUseVariantType>{
       return this._useVariantType;
    }
    public getCustomAttributeLocation(varName: string):number {
        return G_DrawEngine.getAttribLocation(this._spGLID, varName)
    }

    public getGLID() {
        return this._spGLID;
    }
    /**
     * 检查shader中变量的位置是否有效
     * @param loc 
     */
    private checklocValid(loc:number, tagName:string): boolean {
        let result = !(loc == null || loc < 0);
        if(!result)
        {
            // debugger;
            return false;
        }
        return true;
    }
    //激活shader
    public active(): void {
        G_DrawEngine.useProgram(this._spGLID);
    }

    
    /**
     * 设置使用高光的颜色
     * @param color 
     */
    public setUseSpecularLightColor(color: Array<number>,shininess:number): void {
        if (this.checklocValid(this.u_light_specular_color_loc, "u_light_specular_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_specular_color_loc, color);
        }
        if(this.checklocValid(this.u_light_specular_shininess_loc,"u_light_specular_shininess_loc"))
        {
            G_DrawEngine.setUniform1f(this.u_light_specular_shininess_loc,shininess)
        }
    }
    
    /**
     * 
     * @param color 设置使用光的颜色
     */
    public setUseLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_light_color_loc, "u_light_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_light_color_loc, color);
        }
    }
    /**
     * 设置光照的方向
     * @param direction 
     */
    public setUseLightDirection(direction: Array<number>): void {
        if (this.checklocValid(this.u_light_color_dir_loc, "u_light_color_dir_loc")) {
            G_DrawEngine.setUniformFloatVec3(this.u_light_color_dir_loc, direction);
        }
    }

      /**
     * 设置使用节点自定义颜色
     * @param color 
     */
    public setUseNodeColor(color: Array<number>): void {
        if (this.checklocValid(this.u_node_color_loc, "u_node_color_loc")) {
            G_DrawEngine.setUniformFloatVec4(this.u_node_color_loc, color);
        }
    }
    /**
     * 设置使用环境光的颜色
     * @param color 
     */
    public setUseAmbientLightColor(color: Array<number>):void{
        if(this.checklocValid(this.u_ambientColor_loc,"u_ambientColor_loc"))
        {
            G_DrawEngine.setUniformFloatVec4(this.u_ambientColor_loc,color);
        }
    }
    
    /**
     * 设置使用点光的颜色
     * @param color 
     */
    public setUsePointLightColor(color:Array<number>):void{
       if(this.checklocValid(this.u_pointColor_loc,"u_pointColor_loc"))
       {
           G_DrawEngine.setUniformFloatVec4(this.u_pointColor_loc,color);
       }
    }

    /**
     * 设置使用自定义定点颜色
     * @param color 
     */
    public setUseNodeVertColor(glID, itemSize: number): void {
        if (this.checklocValid(this.a_vert_color_loc, "a_vert_color_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID,this.a_vert_color_loc,itemSize);
        }
    }
    /**
     * 设置使用节点自定义矩阵
     * @param glID 
     * @param itemSize 
     */
    public setUseNodeCustomMatrix(glID, itemSize: number): void {
        if (this.checklocValid(this.a_node_matrix_loc, "a_node_matrix_loc")) {
            G_DrawEngine.activeMatrixVertexAttribArray(glID,this.a_node_matrix_loc,itemSize)
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
        let loc: string = (pos == 0) ? "u_texCoord_loc" : "u_texCoord" + pos + "_loc"
        if (this.checklocValid(this[loc], loc)) {
            G_DrawEngine.active2DTexture(glID,this[loc],pos)
        }
    }
    public setUseSkyBox(glID:WebGLTexture): void {
        if (this.checklocValid(this.u_skybox_loc, "u_skybox_loc")) {
            var gl = this._gl;
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            G_DrawEngine.activeCubeTexture(glID,this.u_skybox_loc,0)
        }
    }
    public setUseCubeTexture(glID:WebGLTexture): void {
        if (this.checklocValid(this.u_cubeCoord_loc, "u_cubeCoord_loc")) {
            G_DrawEngine.activeCubeTexture(glID,this.u_cubeCoord_loc, 0)
        }
    }
    //设置使用投影视口模型矩阵
    public setUseProjectViewModelMatrix(pvmMatrix): void {
        if (this.checklocValid(this.u_pvm_matrix_loc, "u_pvm_matrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_pvm_matrix_loc,pvmMatrix);
        }
    }
    public setUseProjectionViewMatrix(mat): void {
        if (this.checklocValid(this.u_pv_matrix_loc, "u_pv_matrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_pv_matrix_loc, mat)
        }
    }
    public setUseProjectionViewInverseMatrix(mat): void {
        if (this.checklocValid(this.u_pv_matrix_inverse_loc, "u_pv_matrix_inverse_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_pv_matrix_inverse_loc, mat);
        }
    }
    //设置使用投影视口模型矩阵的逆矩阵
    public setUseProjectViewModelInverseMatrix(matrix): void {
        if (this.checklocValid(this.u_pvm_matrix_inverse_loc, "u_pvm_matrix_inverse_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_pvm_matrix_inverse_loc, matrix)
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
        if (this.checklocValid(this.u_MVMatrix_loc, "u_MVMatrix_loc")) {
            G_DrawEngine.setUniformMatrix(this.u_MVMatrix_loc, mvMatrix);
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
            G_DrawEngine.activeVertexAttribArray(glID,this.a_position_loc,itemSize);
        }
    }
    //设置法线值
    public setUseVertexAttriPointerForNormal(glID, itemSize: number): void {
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID,this.a_normal_loc,itemSize);
        }
    }
    //设置uv值
    public setUseVertexAttribPointerForUV(glID, itemSize: number): void {
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            G_DrawEngine.activeVertexAttribArray(glID,this.a_uv_loc,itemSize);
        }
    }

    public disableVertexAttribArray(): void {
        if (this._useVariantType.indexOf(ShaderUseVariantType.Vertex)>=0&&this.checklocValid(this.a_position_loc, "a_position_loc")) {// 设定为数组类型的变量数据
            G_DrawEngine.disableVertexAttribArray(this.a_position_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.UVs)>=0&&this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_uv_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.Normal)>=0&&this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_normal_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.Tangent)>=0&&this.checklocValid(this.a_tangent_loc, "a_tangent_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_tangent_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.NodeCustomMatrix)>=0&&this.checklocValid(this.a_node_matrix_loc, "a_node_matrix_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_node_matrix_loc);
        }
        if (this._useVariantType.indexOf(ShaderUseVariantType.VertColor)>=0&&this.checklocValid(this.a_vert_color_loc, "a_vert_color_loc")) {
            G_DrawEngine.disableVertexAttribArray(this.a_vert_color_loc);
        }
    }
}