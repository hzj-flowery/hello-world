import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../Matrix";
import { G_ShaderFactory } from "../shader/Shader";

var vertexshader3d =
    'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_worldInverseTranspose;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
    '}'

var fragmentshader3d =
    'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec3 u_reverseLightDirection;' +
    'uniform vec4 u_color;' +
    'uniform sampler2D u_ramp;' +
    'uniform vec2 u_rampSize;' +
    'uniform float u_linearAdjust;'+ // 1.0 if linear, 0.0 if nearest
    'void main() {' +
    'vec3 normal = normalize(v_normal);' +
    'float cosAngle = dot(normal, u_reverseLightDirection);' +
    'float u = cosAngle * 0.5 + 0.5;' +
    'vec2 uv = vec2(u, 0.5);' +
    'vec2 texelRange = uv * (u_rampSize - u_linearAdjust);' +
    'vec2 rampUV = (texelRange + u_linearAdjust * 0.5) / u_rampSize;' +
    'vec4 rampColor = texture2D(u_ramp, rampUV);' +
    'gl_FragColor = u_color * rampColor;' +
    '}'

"use strict";

/* globals webglLessonsUI */

function main() {
    var gl = Device.Instance.gl;
    if (!gl) {
        return;
    }

    var HeadData = LoaderManager.instance.getRes("res/models/HeadData/head.json");
    // setup GLSL program
    var programShader = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);

    var cubeDatas = {
        position: HeadData.positions,
        normal: HeadData.normals
    }
    var cubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);

    var uniforms = {
        u_worldViewProjection: {},
        u_worldInverseTranspose: {},
        u_color: {},
        u_ramp: {},
        u_rampSize: {},
        u_linearAdjust: {},
        u_reverseLightDirection: {}
    }

    // make a 256 array where elements 0 to 127
    // go from 64 to 191 and elements 128 to 255
    // are all 255.
    const smoothSolid = new Array(256).fill(255);
    for (let i = 0; i < 128; ++i) {
        smoothSolid[i] = 64 + i;
    }

    const ramps = [
        {
            name: 'dark-white', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 255]
        },
        {
            name: 'dark-white-skewed', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 80, 80, 255, 255]
        },
        {
            name: 'normal', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: true,
            data: [0, 255]
        },
        {
            name: '3-step', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 160, 255]
        },
        {
            name: '4-step', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 140, 200, 255]
        },
        {
            name: '4-step skewed', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 80, 80, 80, 140, 200, 255]
        },
        {
            name: 'black-white-black', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 255, 80]
        },
        {
            name: 'stripes', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255, 80, 255]
        },
        {
            name: 'stripe', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
        },
        {
            name: 'smooth-solid', color: [0.2, 1, 0.2, 1], format: gl.LUMINANCE, filter: false,
            data: smoothSolid
        },
        {
            name: 'rgb', color: [1, 1, 1, 1], format: gl.RGB, filter: true,
            data: [255, 0, 0, 0, 255, 0, 0, 0, 255]
        },
    ];

    var elementsForFormat = {};
    elementsForFormat[gl.LUMINANCE] = 1;
    elementsForFormat[gl.RGB] = 3;

    ramps.forEach((ramp: any) => {
        const { name, format, filter, data } = ramp;
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        const width = data.length / elementsForFormat[format];
        gl.texImage2D(
            gl.TEXTURE_2D,     // target
            0,                 // mip level
            format,            // internal format
            width,
            1,                 // height
            0,                 // border
            format,            // format
            gl.UNSIGNED_BYTE,  // type
            new Uint8Array(data));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter ? gl.LINEAR : gl.NEAREST);
        ramp.texture = tex;
        ramp.size = [width, 1];
    });

    var data = {
        ramp: 0,
    };
    var webglLessonsUI = window["webglLessonsUI"];
    webglLessonsUI.setupUI(document.querySelector("#ui"), data, [
        { type: "option", key: "ramp", change: drawScene, options: ramps.map(r => r.name), },
    ]);

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);
    var fRotationRadians = 0;

    drawScene();

    // Setup a ui.
    webglLessonsUI.setupSlider("#fRotation", { value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });

    function updateRotation(event, ui) {
        fRotationRadians = degToRad(ui.value);
        drawScene();
    }

    // Draw the scene.
    function drawScene() {
        Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(programShader.spGlID);



        G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, cubeBufferInfo);

        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var zNear = 1;
        var zFar = 50;
        var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);

        // Compute the camera's matrix
        var camera = [0, 0, 20];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = glMatrix.mat4.lookAt2(null, camera, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
        // Compute a view projection matrix
        var viewProjectionMatrix = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
        // Draw a F at the origin
        var worldMatrix = glMatrix.mat4.rotateY(null, glMatrix.mat4.identity(null), fRotationRadians);

        // Multiply the matrices.
        var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, viewProjectionMatrix, worldMatrix);
        var worldInverseMatrix = glMatrix.mat4.invert(null, worldMatrix);
        var worldInverseTransposeMatrix = glMatrix.mat4.transpose(null, worldInverseMatrix);

        const { texture, color, size, filter }: any = ramps[data.ramp];
        uniforms.u_color = color;
        uniforms.u_reverseLightDirection = glMatrix.vec3.normalize(null, [-1.75, 0.7, 1]);
        uniforms.u_ramp = texture;
        uniforms.u_rampSize = size;
        uniforms.u_linearAdjust = filter ? 1 : 0;
        uniforms.u_worldViewProjection = worldViewProjectionMatrix;
        uniforms.u_worldInverseTranspose = worldInverseTransposeMatrix;
        // bind the texture to active texture unit 0
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        G_ShaderFactory.setUniforms(programShader.uniSetters, uniforms)

        G_ShaderFactory.drawBufferInfo(cubeBufferInfo, gl.TRIANGLES);
    }
}

export default class RampTextureTest{
    static run()
    {
        main();
    }
}
