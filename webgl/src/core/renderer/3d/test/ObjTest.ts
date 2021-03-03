"use strict";

import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { OBJParseHelper } from "../../parse/OBJParseHelper";
import { G_ShaderFactory } from "../../shader/ShaderFactory";

const vs = `
  attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec3 a_tangent;
  attribute vec2 a_texcoord;
  attribute vec4 a_color;

  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform mat4 u_world;
  uniform vec3 u_viewWorldPosition;

  varying vec3 v_normal;
  varying vec3 v_tangent;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying vec4 v_color;

  void main() {
    vec4 worldPosition = u_world * a_position;
    gl_Position = u_projection * u_view * worldPosition;
    v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
    mat3 normalMat = mat3(u_world);
    v_normal = normalize(normalMat * a_normal);
    v_tangent = normalize(normalMat * a_tangent);

    v_texcoord = a_texcoord;
    v_color = a_color;
  }
  `;

const fs = `
  precision highp float;

  varying vec3 v_normal;
  varying vec3 v_tangent;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying vec4 v_color;

  uniform vec3 diffuse;
  uniform sampler2D diffuseMap;
  uniform vec3 ambient;
  uniform vec3 emissive;
  uniform vec3 specular;
  uniform sampler2D specularMap;
  uniform float shininess;
  uniform sampler2D normalMap;
  uniform float opacity;
  uniform vec3 u_lightDirection;
  uniform vec3 u_ambientLight;

  void main () {
    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    vec3 bitangent = normalize(cross(normal, tangent));

    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
    normal = normalize(tbn * normal);

    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    vec4 specularMapColor = texture2D(specularMap, v_texcoord);
    vec3 effectiveSpecular = specular * specularMapColor.rgb;

    vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
    float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

    gl_FragColor = vec4(
        emissive +
        ambient * u_ambientLight +
        effectiveDiffuse * fakeLight +
        effectiveSpecular * pow(specularLight, shininess),
        effectiveOpacity);
  }
  `;









async function main() {
  const gl = Device.Instance.gl;
  if (!gl) {
    return;
  }

  // compiles and links the shaders, looks up attribute and uniform locations
  const meshProgramInfo = G_ShaderFactory.createProgramInfo(vs, fs);
  
  let str = "http:localhost:3000/res/models/windmill/windmill.obj";
  // let str1 = "https://webglfundamentals.org/webgl/resources/models/chair/chair.obj"
  let str1 = "http:localhost:3000/res/models/chair/chair.obj"
  let str2 = "https://webglfundamentals.org/webgl/resources/models/book-vertex-chameleon-study/book.obj"
  let str3 = "http:localhost:3000/res/models/book/book.obj"
  var objData = await OBJParseHelper.load(gl, str3);
  
  function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return { min, max };
  }

  function getGeometriesExtents(geometries) {
    return geometries.reduce(({ min, max }, { data }) => {
      const minMax = getExtents(data.position);
      return {
        min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
        max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
      };
    }, {
      min: Array(3).fill(Number.POSITIVE_INFINITY),
      max: Array(3).fill(Number.NEGATIVE_INFINITY),
    });
  }

  const extents = getGeometriesExtents(objData.obj.geometries);
  const range = glMatrix.mat4.subtractVectors(null, extents.max, extents.min);
  // amount to move the object so its center is at the origin
  const objOffset = glMatrix.mat4.scaleVector(null,
    glMatrix.mat4.addVectors(null,
      extents.min,
      glMatrix.mat4.scaleVector(null, range, 0.5)),
    -1);
  const cameraTarget = [0, 0, 0];
  // figure out how far away to move the camera so we can likely
  // see the object.
  const radius = glMatrix.vec3.length(range) * 0.5;
  const cameraPosition = glMatrix.mat4.addVectors(null, cameraTarget, [
    0,
    0,
    radius,
  ]);
  // Set zNear and zFar to something hopefully appropriate
  // for the size of this object.
  const zNear = radius / 100;
  const zFar = radius * 30;

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function render(time) {
    time *= 0.001;  // convert to seconds

    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.width / gl.canvas.height;
    const projection = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);

    const up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    const camera = glMatrix.mat4.lookAt2(null, cameraPosition, cameraTarget, up);

    // Make a view matrix from the camera matrix.
    const view = glMatrix.mat4.invert(null, camera);

    const sharedUniforms = {
      u_lightDirection: glMatrix.vec3.normalize(null, [-1, 3, 5]),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
    };

    gl.useProgram(meshProgramInfo.spGlID);

    // calls gl.uniform
    G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, sharedUniforms);

    // compute the world matrix once since all parts
    // are at the same space.
    let u_world = glMatrix.mat4.rotateY(null, glMatrix.mat4.identity(null), time);
    glMatrix.mat4.translate(u_world, u_world, objOffset);

    for (const { bufferInfo, material } of objData.parts) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      G_ShaderFactory.setBuffersAndAttributes(meshProgramInfo.attrSetters, bufferInfo);
      // calls gl.uniform
      G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, {
        u_world: u_world,
      });
      G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, material)
      // calls gl.drawArrays or gl.drawElements
      G_ShaderFactory.drawBufferInfo(bufferInfo);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


export default class ObjTest {
  static run() {
    main();
  }
}
