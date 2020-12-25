import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../Matrix";
import { ShaderData } from "../shader/Shader";
import { G_ShaderFactory } from "../shader/ShaderFactory";

var shadervs = 
`
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoordinates;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoordinates;

void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoordinates = aTextureCoordinates;
}
`
var shaderfs = 
`
precision mediump float;

varying vec2 vTextureCoordinates;
uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoordinates);
}
`
var shaderfs2 = 
`
precision mediump float;

varying vec2 vTextureCoordinates;
uniform sampler2D uSampler;

void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`


var gl:WebGL2RenderingContext;

var pwgl:any = {};
pwgl.ongoingImageLoads = [];
pwgl.listOfPressedKeys = [];

function setupShaders() {
    let shaderProgram1 = G_ShaderFactory.createProgramInfo(shadervs,shaderfs).spGlID;
    // 使用着色器
    gl.useProgram(shaderProgram1);

    // 获取属性位置
    pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram1, "aVertexPosition");
    pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(shaderProgram1, "aTextureCoordinates");
    pwgl.uniformMVMatrixLoc_1 = gl.getUniformLocation(shaderProgram1, "uMVMatrix");
    pwgl.uniformProjMatrixLoc_1 = gl.getUniformLocation(shaderProgram1, "uPMatrix");
    pwgl.uniformSamplerLoc_1 = gl.getUniformLocation(shaderProgram1, "uSampler");

    // 设定为数组类型的变量数据
    gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
    gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc);

    gl.useProgram(null);

    // 正常渲染着色器程序
    pwgl.program_1 = shaderProgram1;


    let shaderProgram2 = G_ShaderFactory.createProgramInfo(shadervs,shaderfs2).spGlID

    // 使用着色器
    gl.useProgram(shaderProgram2);

    // 获取属性位置
    pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
    pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(shaderProgram2, "aTextureCoordinates");
    pwgl.uniformMVMatrixLoc_2 = gl.getUniformLocation(shaderProgram2, "uMVMatrix");
    pwgl.uniformProjMatrixLoc_2 = gl.getUniformLocation(shaderProgram2, "uPMatrix");
    pwgl.uniformSamplerLoc_2 = gl.getUniformLocation(shaderProgram2, "uSampler");

    // 设定为数组类型的变量数据
    gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
    gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc);

    gl.useProgram(null);

    // 纯绿色渲染着色器程序
    pwgl.program_2 = shaderProgram2;

    // 初始化矩阵
    pwgl.modelViewMatrix = glMatrix.mat4.create();
    pwgl.projectionMatrix = glMatrix.mat4.create();
    pwgl.modelViewMatrixStack = [];
}

function setupBuffers() {
    setupFloorBuffers();
    setupCubeBuffers();
}

function setupFloorBuffers() {
    // 顶点数据
    pwgl.floorVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer);
    var floorVertexPosition = [
        // Plane in y=0
        5.0, 0.0, 5.0,      //v0
        5.0, 0.0, -5.0,     //v1
        -5.0, 0.0, -5.0,    //v2
        -5.0, 0.0, 5.0];    //v3

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition), gl.STATIC_DRAW);

    pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE = 3;
    pwgl.FLOOR_VERTEX_POS_BUF_NUM_ITEMS = 4;

    // uv 数据
    pwgl.floorVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer);
    var floorVertexTextureCoordinates = [
        2.0, 0.0,
        2.0, 2.0,
        0.0, 2.0,
        0.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexTextureCoordinates), gl.STATIC_DRAW);

    pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
    pwgl.FLOOR_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 4;

    // 索引数据
    pwgl.floorVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer);
    var floorVertexIndices = [0, 1, 2, 3];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), gl.STATIC_DRAW);

    pwgl.FLOOR_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
    pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS = 4;
}

function setupCubeBuffers() {
    // 顶点数据
    pwgl.cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexPositionBuffer);

    var cubeVertexPosition = [
        // Front face
        1.0, 1.0, 1.0,      //v0
        -1.0, 1.0, 1.0,     //v1
        -1.0, -1.0, 1.0,    //v2
        1.0, -1.0, 1.0,     //v3

        // Back face
        1.0, 1.0, -1.0,     //v4
        -1.0, 1.0, -1.0,    //v5
        -1.0, -1.0, -1.0,   //v6
        1.0, -1.0, -1.0,    //v7

        // Left face
        -1.0, 1.0, 1.0,     //v8
        -1.0, 1.0, -1.0,    //v9
        -1.0, -1.0, -1.0,   //v10
        -1.0, -1.0, 1.0,    //v11

        // Right face
        1.0, 1.0, 1.0,      //12
        1.0, -1.0, 1.0,     //13
        1.0, -1.0, -1.0,    //14
        1.0, 1.0, -1.0,     //15

        // Top face
        1.0, 1.0, 1.0,      //v16
        1.0, 1.0, -1.0,     //v17
        -1.0, 1.0, -1.0,    //v18
        -1.0, 1.0, 1.0,     //v19

        // Bottom face
        1.0, -1.0, 1.0,     //v20
        1.0, -1.0, -1.0,    //v21
        -1.0, -1.0, -1.0,   //v22
        -1.0, -1.0, 1.0,    //v23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition), gl.STATIC_DRAW);

    pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE = 3;
    pwgl.CUBE_VERTEX_POS_BUF_NUM_ITEMS = 24;

    // uv 数据
    pwgl.cubeVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexTextureCoordinateBuffer);

    var textureCoordinates = [
        //Front face
        0.0, 0.0, //v0
        1.0, 0.0, //v1
        1.0, 1.0, //v2
        0.0, 1.0, //v3

        // Back face
        0.0, 1.0, //v4
        1.0, 1.0, //v5
        1.0, 0.0, //v6
        0.0, 0.0, //v7

        // Left face
        0.0, 1.0, //v8
        1.0, 1.0, //v9
        1.0, 0.0, //v10
        0.0, 0.0, //v11

        // Right face
        0.0, 1.0, //v12
        1.0, 1.0, //v13
        1.0, 0.0, //v14
        0.0, 0.0, //v15

        // Top face
        0.0, 1.0, //v16
        1.0, 1.0, //v17
        1.0, 0.0, //v18
        0.0, 0.0, //v19

        // Bottom face
        0.0, 1.0, //v20
        1.0, 1.0, //v21
        1.0, 0.0, //v22
        0.0, 0.0, //v23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
    pwgl.CUBE_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 24;

    // 索引数据
    pwgl.cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.cubeVertexIndexBuffer);

    var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,       // Front face
        4, 6, 5, 4, 7, 6,       // Back face
        8, 9, 10, 8, 10, 11,    // Left face
        12, 13, 14, 12, 14, 15, // Right face
        16, 17, 18, 16, 18, 19, // Top face
        20, 22, 21, 20, 23, 22  // Bottom face
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

    pwgl.CUBE_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
    pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS = 36;
}

function setupTextures() {
    pwgl.groundTexture = gl.createTexture();
    let img1 = LoaderManager.instance.getRes("res/wood.jpg");
    textureFinishedLoading(img1,pwgl.groundTexture);

    pwgl.boxTexture = gl.createTexture();
    let img2 = LoaderManager.instance.getRes("res/wicker.jpg");
    textureFinishedLoading(img2,pwgl.boxTexture);
}

function textureFinishedLoading(image, texture) {
    // 指定当前操作的贴图
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Y 轴取反
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // 创建贴图, 绑定对应的图像并设置数据格式
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // 生成 MipMap 映射
    gl.generateMipmap(gl.TEXTURE_2D);

    // 设定参数, 放大滤镜和缩小滤镜的采样方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // 设定参数, x 轴和 y 轴为镜面重复绘制
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    // 清除当前操作的贴图
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function draw() {

    // handlePressedDownKeys();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 设置为正交矩阵
    // glMatrix.mat4.ortho(pwgl.projectionMatrix, -8, 8, -8, 8, 0.1, 100);
    // 设置为透视矩阵
    glMatrix.mat4.perspective(pwgl.projectionMatrix, 60 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 100);
    // 初始化模型视图矩阵
    glMatrix.mat4.identity(pwgl.modelViewMatrix);
    glMatrix.mat4.lookAt(pwgl.modelViewMatrix, [8, 5, -10], [0, 0, 0], [0, 1, 0]);

    gl.useProgram(pwgl.program_1);
    gl.uniform1i(pwgl.uniformSamplerLoc_1, 0);
    gl.useProgram(pwgl.program_2);
    gl.uniform1i(pwgl.uniformSamplerLoc_2, 0);

    // 使用正常渲染着色器
    gl.useProgram(pwgl.program_1);
    pwgl.useProgramNum = 1;

    uploadModelViewMatrixToShader();
    uploadProjectionMatrixToShader();
    gl.uniform1i(pwgl.uniformSamplerLoc, 0);
    // 绘制地板
    drawFloor();

    // ----- 模板方法 begin -----
     Device.Instance.writeStencil(1,1,false);
    // ----- 模板方法 end -----

    // 绘制小盒子 1
    pushModelViewMatrix();
    glMatrix.mat4.translate(pwgl.modelViewMatrix, pwgl.modelViewMatrix, [0, 2.5, 0]);
    glMatrix.mat4.scale(pwgl.modelViewMatrix, pwgl.modelViewMatrix, [1.5, 1.5, 1.5]);
    uploadModelViewMatrixToShader();
    uploadProjectionMatrixToShader();
    drawCube(pwgl.boxTexture);
    popModelViewMatrix();


    // 使用纯绿色渲染着色器
    gl.useProgram(pwgl.program_2);
    pwgl.useProgramNum = 2;

    // ----- 模板方法 begin -----
   Device.Instance.compareStencil(1,1);
    // ----- 模板方法 end -----
    // 绘制小盒子 2
    pushModelViewMatrix();
    uploadProjectionMatrixToShader();

    pwgl.angle = (1000 / 60) / 2000 * 2 * Math.PI % (2 * Math.PI);
    pwgl.x = Math.cos(pwgl.angle) * pwgl.circleRadius;
    pwgl.z = Math.sin(pwgl.angle) * pwgl.circleRadius;

    glMatrix.mat4.translate(pwgl.modelViewMatrix, pwgl.modelViewMatrix, [pwgl.x, pwgl.y, pwgl.z]);
    glMatrix.mat4.scale(pwgl.modelViewMatrix, pwgl.modelViewMatrix, [1, 1, 1]);
    uploadModelViewMatrixToShader();
    drawCube(pwgl.boxTexture);
    popModelViewMatrix();

    // ----- 模板方法 begin -----
    Device.Instance.closeStencil();
    // ----- 模板方法 end -----

    // 开启动画帧循环
    requestAnimationFrame(draw);
}

function uploadModelViewMatrixToShader() {
    if (pwgl.useProgramNum == 1) {
        gl.uniformMatrix4fv(pwgl.uniformMVMatrixLoc_1, false, pwgl.modelViewMatrix);
    } else if (pwgl.useProgramNum == 2) {
        gl.uniformMatrix4fv(pwgl.uniformMVMatrixLoc_2, false, pwgl.modelViewMatrix);
    }
}

function uploadProjectionMatrixToShader() {
    if (pwgl.useProgramNum == 1) {
        gl.uniformMatrix4fv(pwgl.uniformProjMatrixLoc_1, false, pwgl.projectionMatrix);
    } else if (pwgl.useProgramNum == 2) {
        gl.uniformMatrix4fv(pwgl.uniformProjMatrixLoc_2, false, pwgl.projectionMatrix);
    }
}

// 将 modelViewMatrix 矩阵压入堆栈
function pushModelViewMatrix() {
    var copyToPush = glMatrix.mat4.clone(pwgl.modelViewMatrix);
    pwgl.modelViewMatrixStack.push(copyToPush);
}

// 从矩阵堆栈中取出矩阵并设定为当前的 modelViewMatrix 矩阵
function popModelViewMatrix() {
    if (pwgl.modelViewMatrixStack.length == 0) {
        throw "Error popModelViewMatrix() - Stack was empty ";
    }
    pwgl.modelViewMatrix = pwgl.modelViewMatrixStack.pop();
}

function drawFloor() {
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer);
    gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc, pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer);
    gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc, pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0);

    // 激活 0 号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 指定当前操作的贴图
    gl.bindTexture(gl.TEXTURE_2D, pwgl.groundTexture);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLE_FAN, pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS, gl.UNSIGNED_SHORT, 0);
}

function drawCube(texture) {
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexPositionBuffer);
    gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc, pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexTextureCoordinateBuffer);
    gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc, pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0);

    // 激活 0 号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 指定当前操作的贴图
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.cubeVertexIndexBuffer);

    gl.drawElements(gl.TRIANGLES, pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS, gl.UNSIGNED_SHORT, 0);
}

function startup() {
    pwgl.x = 0.0;
    pwgl.y = 2.7;
    pwgl.z = 0.0;
    pwgl.circleRadius = 2.0;
    pwgl.angle = 0;

    gl = Device.Instance.gl;
    setupShaders();
    setupBuffers();
    setupTextures();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    draw();
}
export class StencilTest{
    static run(){
        startup();
    }
}
