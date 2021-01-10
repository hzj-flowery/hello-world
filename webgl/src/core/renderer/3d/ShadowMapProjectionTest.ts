'use strict';

import { cc } from "../../../CCDebug";
import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../Matrix";
import TextureCustom from "../base/texture/TextureCustom";
import CustomTextureData from "../data/CustomTextureData";
import { syPrimitives } from "../shader/Primitives";
import { G_ShaderFactory } from "../shader/ShaderFactory";


let vertexshader3d =
    `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat4 u_textureMatrix;

varying vec2 v_texcoord;
varying vec4 v_projectedTexcoord;

void main() {
  // Multiply the position by the matrix.
  vec4 worldPosition = u_world * a_position;

  gl_Position = u_projection * u_view * worldPosition;

  // Pass the texture coord to the fragment shader.
  v_texcoord = a_texcoord;

  v_projectedTexcoord = u_textureMatrix * worldPosition;
}
`
let fragmentshader3d =
    `
precision mediump float;

// Passed in from the vertex shader.
varying vec2 v_texcoord;
varying vec4 v_projectedTexcoord;

uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform sampler2D u_projectedTexture;

void main() {
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  projectedTexcoord.xyz = projectedTexcoord.xyz/2.0+0.5;
  bool inRange = 
      projectedTexcoord.x >= 0.0 &&
      projectedTexcoord.x <= 1.0 &&
      projectedTexcoord.y >= 0.0 &&
      projectedTexcoord.y <= 1.0;
  vec4 projectedTexColor = texture2D(u_projectedTexture, projectedTexcoord.xy);
  vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;
  float projectedAmount = inRange ? 1.0 : 0.0;
  gl_FragColor = mix(texColor, projectedTexColor, projectedAmount);
}
`
let colorvertexshader =
    `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_projection * u_view * u_world * a_position;
}
`
let colorfragmentshader =
    `
precision mediump float;

uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`
function main() {
    const gl = Device.Instance.gl;
    const m4 = glMatrix.mat4;
    if (!gl) {
        return;
    }

    // setup GLSL programs
    const textureProgramInfo = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    const colorProgramInfo = G_ShaderFactory.createProgramInfo(colorvertexshader, colorfragmentshader);

    const sphereBufferInfo = syPrimitives.createSphereBufferInfo(
        1,  // radius
        12, // subdivisions around
        6,  // subdivisions down
    );
    const planeBufferInfo = syPrimitives.createPlaneBufferInfo(
        20,  // width
        20,  // height
        1,   // subdivisions across
        1,   // subdivisions down
    );
    const cubeLinesBufferInfo = G_ShaderFactory.createBufferInfoFromArrays({
        position: [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
        ],
        indices: [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ],
    });

    // make a 8x8 checkerboard texture
    const checkerboardTexture = new TextureCustom();
    checkerboardTexture.url = CustomTextureData.getBoardData(8,8);

    function loadImageTexture() {
        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        LoaderManager.instance.load('res/f-texture.png', null, (img) => {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            // assumes this texture is a power of 2
            gl.generateMipmap(gl.TEXTURE_2D);
            // render();
        })
        return texture;
    }

    const imageTexture = loadImageTexture();

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const settings = {
        cameraX: 2.75,
        cameraY: 5,
        posX: 2.5,
        posY: 4.8,
        posZ: 4.3,
        targetX: 2.5,
        targetY: 0,
        targetZ: 3.5,
        projWidth: 1,
        projHeight: 1,
        perspective: true,
        fieldOfView: 45,
    };
    window["webglLessonsUI"].setupUI(document.querySelector('#ui'), settings, [
        { type: 'slider', key: 'cameraX', min: -10, max: 10, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'cameraY', min: 1, max: 20, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'posX', min: -10, max: 10, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'posY', min: 1, max: 20, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'posZ', min: 1, max: 20, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'targetX', min: -10, max: 10, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'targetY', min: 0, max: 20, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'targetZ', min: -10, max: 20, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'projWidth', min: 0, max: 2, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'projHeight', min: 0, max: 2, change: render, precision: 2, step: 0.001, },
        { type: 'checkbox', key: 'perspective', change: render, },
        { type: 'slider', key: 'fieldOfView', min: 1, max: 179, change: render, },
    ]);

    const fieldOfViewRadians = degToRad(60);

    // Uniforms for each object.
    const planeUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],  // lightblue
        u_texture: checkerboardTexture._glID,
        u_world: m4.translation(null, 0, 0, 0),
    };
    const sphereUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],  // pink
        u_texture: checkerboardTexture._glID,
        u_world: m4.translation(null, 2, 3, 4),
    };

    function drawScene(projectionMatrix, cameraMatrix) {
        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.invert(null, cameraMatrix);

        const textureWorldMatrix = m4.lookAt2(null,
            [settings.posX, settings.posY, settings.posZ],          // position
            [settings.targetX, settings.targetY, settings.targetZ], // target
            [0, 1, 0],                                              // up
        );
        const textureProjectionMatrix = settings.perspective
            ? m4.perspective(null,
                degToRad(settings.fieldOfView),
                settings.projWidth / settings.projHeight,
                0.1,  // near
                200)  // far
            : m4.ortho(null,
                -settings.projWidth / 2,   // left
                settings.projWidth / 2,   // right
                -settings.projHeight / 2,  // bottom
                settings.projHeight / 2,  // top
                0.1,                      // near
                200);                     // far

        let textureMatrix = m4.identity(null);
        // m4.translate(textureMatrix, textureMatrix, [0.5, 0.5, 0.5]);
        // m4.scale(textureMatrix, textureMatrix, [0.5, 0.5, 0.5]);
        m4.multiply(textureMatrix, textureMatrix, textureProjectionMatrix);
        // use the inverse of this world matrix to make
        // a matrix that will transform other positions
        // to be relative this this world space.
        m4.multiply(textureMatrix,textureMatrix,m4.invert(null, textureWorldMatrix));

        gl.useProgram(textureProgramInfo.spGlID);

        // set uniforms that are the same for both the sphere and plane
        G_ShaderFactory.setUniforms(textureProgramInfo.uniSetters, {
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: imageTexture,
        });

        // ------ Draw the sphere --------
        // Setup all the needed attributes.
        G_ShaderFactory.setBuffersAndAttributes(textureProgramInfo.attrSetters, sphereBufferInfo);
        // Set the uniforms unique to the sphere
        G_ShaderFactory.setUniforms(textureProgramInfo.uniSetters, sphereUniforms);
        // calls gl.drawArrays or gl.drawElements
        G_ShaderFactory.drawBufferInfo(sphereBufferInfo);

        // ------ Draw the plane --------
        // Setup all the needed attributes.
        G_ShaderFactory.setBuffersAndAttributes(textureProgramInfo.attrSetters, planeBufferInfo);
        // Set the uniforms we just computed
        G_ShaderFactory.setUniforms(textureProgramInfo.uniSetters, planeUniforms);
        // calls gl.drawArrays or gl.drawElements
        G_ShaderFactory.drawBufferInfo(planeBufferInfo);

        // ------ Draw the cube ------

        gl.useProgram(colorProgramInfo.spGlID);

        // Setup all the needed attributes.
        G_ShaderFactory.setBuffersAndAttributes(colorProgramInfo.attrSetters, cubeLinesBufferInfo);
        // scale the cube in Z so it's really long
        // to represent the texture is being projected to
        // infinity
        const mat = m4.multiply(null, textureWorldMatrix, m4.invert(null, textureProjectionMatrix));
        // Set the uniforms we just computed
        G_ShaderFactory.setUniforms(colorProgramInfo.uniSetters, {
            u_color: [0, 0, 0, 1],
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_world: mat,
        });

        // calls gl.drawArrays or gl.drawElements
        G_ShaderFactory.drawBufferInfo(cubeLinesBufferInfo, gl.LINES);
    }

    // Draw the scene.
    function render() {
        Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        const aspect = gl.canvas.width / gl.canvas.height;
        const projectionMatrix = m4.perspective(null, fieldOfViewRadians, aspect, 1, 2000);
        
        // Compute the camera's matrix using look at.
        const cameraPosition = [settings.cameraX, settings.cameraY, 7];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt2(null, cameraPosition, target, up);

        drawScene(projectionMatrix, cameraMatrix);
    }
    render();
}


export class ShadowMapProjectionTest {
    static run() {
        main();
    }
}
