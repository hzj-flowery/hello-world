
import { glvert_attr_semantic, glTEXTURE_UNIT_VALID } from "../gfx/GLEnums";
import { G_ShaderFactory } from "./ShaderFactory";


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
    private a_node_color_loc;//节点颜色的位置
    private a_node_matrix_loc;//节点自定义矩阵位置
    private u_light_color_loc;//光照属性位置
    private u_light_color_dir_loc;//光照方向属性位置
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

    public isShowDebugLog: boolean;//是否显示报错日志

    protected _gl: WebGLRenderingContext;
    protected _spGLID;
    constructor(gl, glID) {
        this._gl = gl;
        this._spGLID = glID;
        this.onCreateShader();
    }
    /**
     * 创建一个shader
     * @param vert 
     * @param frag 
     */
    static create(vert, frag): Shader {
        var glID = G_ShaderFactory.createShader(vert, frag);
        return new Shader(G_ShaderFactory._gl, glID)
    }
    private _locSafeArr: Map<string, boolean> = new Map();
    private _initLockSafeCheck(): void {
        this._locSafeArr.clear();
        this._locSafeArr.set("a_position_loc", this.a_position_loc >= 0);
        this._locSafeArr.set("a_normal_loc", this.a_normal_loc >= 0);
        this._locSafeArr.set("a_uv_loc", this.a_uv_loc >= 0);
        this._locSafeArr.set("a_tangent_loc", this.a_tangent_loc >= 0);
        this._locSafeArr.set("a_node_color_loc", this.a_node_color_loc);
        this._locSafeArr.set("a_node_matrix_loc", this.a_node_matrix_loc);

        this._locSafeArr.set("u_light_color_loc", this.u_light_color_loc >= 0);
        this._locSafeArr.set("u_light_color_dir_loc", this.u_light_color_dir_loc >= 0);
        this._locSafeArr.set("u_MVMatrix_loc", this.u_MVMatrix_loc >= 0);
        this._locSafeArr.set("u_PMatrix_loc", this.u_PMatrix_loc >= 0);

        this._locSafeArr.set("u_texCoord_loc", this.u_texCoord_loc >= 0);
        this._locSafeArr.set("u_texCoord1_loc", this.u_texCoord1_loc >= 0);
        this._locSafeArr.set("u_texCoord2_loc", this.u_texCoord2_loc >= 0);
        this._locSafeArr.set("u_texCoord3_loc", this.u_texCoord3_loc >= 0);
        this._locSafeArr.set("u_texCoord4_loc", this.u_texCoord4_loc >= 0);
        this._locSafeArr.set("u_texCoord5_loc", this.u_texCoord5_loc >= 0);
        this._locSafeArr.set("u_texCoord6_loc", this.u_texCoord6_loc >= 0);
        this._locSafeArr.set("u_texCoord7_loc", this.u_texCoord7_loc >= 0);
        this._locSafeArr.set("u_texCoord8_loc", this.u_texCoord8_loc >= 0);

        this._locSafeArr.set("u_skybox_loc", this.u_skybox_loc >= 0);
        this._locSafeArr.set("u_pvm_matrix_loc", this.u_pvm_matrix_loc >= 0);
        this._locSafeArr.set("u_pvm_matrix_inverse_loc", this.u_pvm_matrix_inverse_loc >= 0);
        this._locSafeArr.set("u_MMatrix_loc", this.u_MMatrix_loc >= 0);
        this._locSafeArr.set("u_VMatrix_loc", this.u_VMatrix_loc >= 0);
        this._locSafeArr.set("u_MIMatrix_loc", this.u_MIMatrix_loc >= 0);
        this._locSafeArr.set("u_MTMatrix_loc", this.u_MTMatrix_loc >= 0);

        this._locSafeArr.set("u_pv_matrix_loc", this.u_pv_matrix_loc >= 0);
        this._locSafeArr.set("u_pv_matrix_inverse_loc", this.u_pv_matrix_inverse_loc >= 0);

        this._locSafeArr.set("u_MITMatrix_loc", this.u_MITMatrix_loc >= 0);
        this._locSafeArr.set("u_camera_world_position_loc", this.u_camera_world_position_loc >= 0);
        this._locSafeArr.set("u_light_world_position_loc", this.u_light_world_position_loc >= 0);
    }
    protected onCreateShader(): void {
        var _glID = this._spGLID;
        var gl = this._gl;
        this.a_position_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.POSITION);
        this.a_normal_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NORMAL);
        this.a_uv_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.UV);
        this.a_tangent_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.TANGENT);
        this.a_node_color_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NODE_COLOR);
        this.a_node_matrix_loc = gl.getAttribLocation(_glID, glvert_attr_semantic.NODE_Matrix);

        this.u_light_color_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR);
        this.u_light_color_dir_loc = gl.getUniformLocation(_glID, glvert_attr_semantic.LIGHT_COLOR_DIR);
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

        this._initLockSafeCheck();
    }
    public getCustomAttributeLocation(varName: string) {
        return this._gl.getAttribLocation(this._spGLID, varName)
    }

    public getGLID() {
        return this._spGLID;
    }
    /**
     * 检查shader中变量的位置是否有效
     * @param loc 
     */
    private checklocValid(loc, tagName): boolean {
        return !(loc == null || loc < 0);
    }
    //启用属性从缓冲区中获取数据的功能
    private enableVertexAttribute() {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {// 设定为数组类型的变量数据
            this._gl.enableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.enableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.enableVertexAttribArray(this.a_normal_loc);
        }
        if (this.checklocValid(this.a_tangent_loc, "a_tangent_loc")) {
            this._gl.enableVertexAttribArray(this.a_tangent_loc);
        }
        if (this.checklocValid(this.a_node_matrix_loc, "a_node_matrix_loc")) {
            this._gl.enableVertexAttribArray(this.a_node_matrix_loc);
        }
        if (this.checklocValid(this.a_node_color_loc, "a_node_color_loc")) {
            this._gl.enableVertexAttribArray(this.a_node_color_loc);
        }
    }
    
   /**
    * 此函数的作用是要告诉GPU做下面三件事
    * 1：当前要操作的数据缓冲是那个，这个缓冲其实就是一个数组
    * 2：把这个数据缓冲复制给顶点着色器的那个变量
    * 3：在赋值的时候，取多少个数据为一个单元
    * 此处关于每个数据的类型默认设置为float,即一个数据有4个字节组成
    * @param glID    显存的地址
    * @param loc     shader中变量的位置
    * @param itemSize 一个单元的数据数目
    */
    private activeVertexAttribArray(glID:number,loc:number,itemSize:number):void{
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
        this.enableVertexAttribArray(loc, itemSize, this._gl.FLOAT, false, 0, 0);
    }
    /**
     * 
     * @param loc 
     * @param itemSize 
     * @param type 
     * @param normalized 是否归一化
     * @param stride 管道字节数 默认为0表示数据是紧密存放的
     * @param offset 单元偏移，注意这个不是以字节为单位的，它是以单元为单位的
     */
    private enableVertexAttribArray(loc,itemSize,type,normalized:boolean=false,stride:number=0,offset:number=0):void{
        this._gl.enableVertexAttribArray(loc);
        this._gl.vertexAttribPointer(loc, itemSize,type,normalized,stride,offset);
    }
    //激活shader
    public active(): void {
        this.disableVertexAttribArray();
        this.enableVertexAttribute();
        this._gl.useProgram(this._spGLID);
    }
    /**
     * 
     * @param color 设置使用光的颜色
     */
    public setUseLightColor(color: Array<number>): void {
        if (this.checklocValid(this.u_light_color_loc, "u_light_color_loc")) {
            this._gl.uniform4fv(this.u_light_color_loc, color); // green
        }
    }
    /**
     * 设置光照的方向
     * @param direction 
     */
    public setUseLightDirection(direction: Array<number>): void {
        if (this.checklocValid(this.u_light_color_dir_loc, "u_light_color_dir_loc")) {
            this._gl.uniform3fv(this.u_light_color_dir_loc, direction);
        }
    }
    /**
     * 设置使用节点自定义颜色
     * @param color 
     */
    public setUseNodeCustomColor(glID, itemSize: number): void {
        if (this.checklocValid(this.a_node_color_loc, "a_node_color_loc")) {
            this.activeVertexAttribArray(glID,this.a_node_color_loc,itemSize);
        }
    }
    /**
     * 设置使用节点自定义矩阵
     * @param glID 
     * @param itemSize 
     */
    public setUseNodeCustomMatrix(glID, itemSize: number): void {
        if (this.checklocValid(this.a_node_matrix_loc, "a_node_matrix_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            let gl = this._gl as WebGL2RenderingContext;
            // set all 4 attributes for matrix
            // 解析 
            // 每一个矩阵的大小是四行四列，矩阵中元素的类型是gl.FLOAT,即元素占用四个字节
            // 所以一个矩阵的占用字节数为4*4*4
            // 关于矩阵在shader中的位置计算，可以把矩阵想象成一个一维数组，元素类型是vec4
            // matrixLoc:表示矩阵的第1行在shader中的位置
            // matrixLoc+1:表示矩阵的第2行在shader中的位置
            // matrixLoc+2:表示矩阵的第3行在shader中的位置
            // matrixLoc+3:表示矩阵的第4行在shader中的位置    
            const bytesPerMatrix = 4 * 16;
            for (let i = 0; i < 4; ++i) {
                const loc = this.a_node_matrix_loc + i;
                // note the stride and offset
                const offset = i * 16;  // 4 floats per row, 4 bytes per float
                this.enableVertexAttribArray(loc,itemSize,gl.FLOAT,false,bytesPerMatrix,offset)
            }
        }
    }
    /**
     * 设置使用相机的世界位置
     * @param pos 
     */
    public setUseCameraWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_camera_world_position_loc, "u_camera_world_position_loc")) {
            this._gl.uniform3fv(this.u_camera_world_position_loc, pos);
        }
    }
    /**
     * 设置使用光的世界位置
     * @param pos 
     */
    public setUseLightWorldPosition(pos: Array<number>): void {
        if (this.checklocValid(this.u_light_world_position_loc, "u_light_world_position_loc")) {
            this._gl.uniform3fv(this.u_light_world_position_loc, pos);
        }
    }
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    public setUseTexture(glID: WebGLTexture, pos = 0): void {
        /**
          * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
        */
        let loc: string = (pos == 0) ? "u_texCoord_loc" : "u_texCoord" + pos + "_loc"
        if (this.checklocValid(this[loc], loc)) {
            // 激活 指定 号纹理单元
            this._gl.activeTexture(this._gl[glTEXTURE_UNIT_VALID[pos]]);
            // 指定当前操作的贴图
            this._gl.bindTexture(this._gl.TEXTURE_2D, glID);
            this._gl.uniform1i(this[loc], pos);
        }
    }
    public setUseSkyBox(): void {
        if (this.checklocValid(this.u_skybox_loc, "u_skybox_loc")) {
            var gl = this._gl;
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            // Tell the shader to use texture unit 0 for u_skybox
            gl.uniform1i(this.u_skybox_loc, 0);
            // let our quad pass the depth test at 1.0
            gl.depthFunc(gl.LEQUAL);
        }
    }
    public setUseCubeTexture(): void {
        var gl = this._gl;
        if (this.checklocValid(this.u_cubeCoord_loc, "u_cubeCoord_loc")) {
            gl.uniform1i(this.u_cubeCoord_loc, 0);
        }
    }
    //设置使用投影视口模型矩阵
    public setUseProjectViewModelMatrix(pvmMatrix): void {
        if (this.checklocValid(this.u_pvm_matrix_loc, "u_pvm_matrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_pvm_matrix_loc, false, pvmMatrix);
        }
    }
    public setUseProjectionViewMatrix(mat): void {
        if (this.checklocValid(this.u_pv_matrix_loc, "u_pv_matrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_pv_matrix_loc, false, mat);
        }
    }
    public setUseProjectionViewInverseMatrix(mat): void {
        if (this.checklocValid(this.u_pv_matrix_inverse_loc, "u_pv_matrix_inverse_loc")) {
            this._gl.uniformMatrix4fv(this.u_pv_matrix_inverse_loc, false, mat);
        }
    }
    //设置使用投影视口模型矩阵的逆矩阵
    public setUseProjectViewModelInverseMatrix(matrix): void {
        if (this.checklocValid(this.u_pvm_matrix_inverse_loc, "u_pvm_matrix_inverse_loc")) {
            this._gl.uniformMatrix4fv(this.u_pvm_matrix_inverse_loc, false, matrix);
        }
    }
    //设置视口矩阵
    public setUseViewMatrix(vMatrix): void {
        if (this.checklocValid(this.u_VMatrix_loc, "u_VMatrix_loc")) {
            this._gl.uniform4fv(this.u_VMatrix_loc, vMatrix);
        }
    }
    //设置模型视口矩阵
    public setUseModelViewMatrix(mvMatrix): void {
        if (this.checklocValid(this.u_MVMatrix_loc, "u_MVMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MVMatrix_loc, false, mvMatrix);
        }
    }
    //设置透视投影矩阵
    public setUseProjectionMatrix(projMatrix): void {
        if (this.checklocValid(this.u_PMatrix_loc, "u_PMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_PMatrix_loc, false, projMatrix);
        }
    }
    //设置模型世界矩阵
    public setUseModelWorldMatrix(wMatrix): void {
        if (this.checklocValid(this.u_MMatrix_loc, "u_MMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MMatrix_loc, false, wMatrix);
        }
    }
    //设置模型世界矩阵的逆矩阵
    public setUseModelWorldInverseMatrix(wiMatrix): void {
        if (this.checklocValid(this.u_MIMatrix_loc, "u_MIMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MIMatrix_loc, false, wiMatrix);
        }
    }
    //设置模型世界矩阵的转置矩阵
    public setUseModelTransformWorldMatrix(wtMatrix): void {
        if (this.checklocValid(this.u_MTMatrix_loc, "u_MTMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MTMatrix_loc, false, wtMatrix);
        }
    }
    //设置模型世界矩阵的逆矩阵的转置矩阵
    public setUseModelInverseTransformWorldMatrix(witMatrix): void {
        if (this.checklocValid(this.u_MITMatrix_loc, "u_MITMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MITMatrix_loc, false, witMatrix);
        }
    }
    //设置顶点值
    public setUseVertexAttribPointerForVertex(glID, itemSize: number): void {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {
            this.activeVertexAttribArray(glID,this.a_position_loc,itemSize);
        }
    }
    //设置法线值
    public setUseVertexAttriPointerForNormal(glID, itemSize: number): void {
        /**
         * localtion:shader中attribute声明变量的位置
         * size:每次迭代使用的单位数据
         * type:单位数据类型
         * normallize:单位化（【0-255】--》【0-1】）
         * stride:每次迭代跳多少个数据到下一个数据
         * offset:从绑定缓冲区的偏移位置
         */
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this.activeVertexAttribArray(glID,this.a_normal_loc,itemSize);
        }
    }
    //设置uv值
    public setUseVertexAttribPointerForUV(glID, itemSize: number): void {
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this.activeVertexAttribArray(glID,this.a_uv_loc,itemSize);
        }
    }

    public disableVertexAttribArray(): void {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {// 设定为数组类型的变量数据
            this._gl.disableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.disableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.disableVertexAttribArray(this.a_normal_loc);
        }
        if (this.checklocValid(this.a_tangent_loc, "a_tangent_loc")) {
            this._gl.disableVertexAttribArray(this.a_tangent_loc);
        }
        if (this.checklocValid(this.a_node_matrix_loc, "a_node_matrix_loc")) {
            this._gl.disableVertexAttribArray(this.a_node_matrix_loc);
        }
        if (this.checklocValid(this.a_node_color_loc, "a_node_color_loc")) {
            this._gl.disableVertexAttribArray(this.a_node_color_loc);
        }
    }



}