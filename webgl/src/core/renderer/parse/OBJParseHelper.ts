// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { G_ShaderFactory } from "../shader/ShaderFactory";

export namespace OBJParseHelper {

    function create1PixelTexture(gl:WebGLRenderingContext, pixel):WebGLTexture {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(pixel));
      return texture;
    }
    function createTexture(gl:WebGLRenderingContext, url):WebGLTexture {
      const texture = create1PixelTexture(gl, [128, 192, 255, 255]);
      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        // Check if the image is a power of 2 in both dimensions.
        if (MathUtils.isPowerOf2(image.width) && MathUtils.isPowerOf2(image.height)) {
          // Yes, it's a power of 2. Generate mips.
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
      });
      return texture;
    }
  
    function makeIndexIterator(indices) {
      let ndx = 0;
      const fn = () => indices[ndx++];
      fn.reset = () => { ndx = 0; };
      fn.numElements = indices.length;
      return fn;
    }
    function makeUnindexedIterator(positions) {
      let ndx = 0;
      const fn = () => ndx++;
      fn.reset = () => { ndx = 0; };
      fn.numElements = positions.length / 3;
      return fn;
    }
    const subtractVector2 = (a, b) => a.map((v, ndx) => v - b[ndx]);
    //构造切线
    function generateTangents(position, texcoord, indices?):Array<number> {
      const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
      const numFaceVerts = getNextIndex.numElements;
      const numFaces = numFaceVerts / 3;
      const tangents = [];
      for (let i = 0; i < numFaces; ++i) {
        const n1 = getNextIndex();
        const n2 = getNextIndex();
        const n3 = getNextIndex();
  
        const p1 = position.slice(n1 * 3, n1 * 3 + 3);
        const p2 = position.slice(n2 * 3, n2 * 3 + 3);
        const p3 = position.slice(n3 * 3, n3 * 3 + 3);
  
        const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
        const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
        const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);
  
        const dp12 = glMatrix.mat4.subtractVectors(null, p2, p1);
        const dp13 = glMatrix.mat4.subtractVectors(null, p3, p1);
  
        const duv12 = subtractVector2(uv2, uv1);
        const duv13 = subtractVector2(uv3, uv1);
  
        const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
        const tangent = Number.isFinite(f)
          ? glMatrix.vec3.normalize(null,
            glMatrix.mat4.scaleVector(null, glMatrix.mat4.subtractVectors(null, glMatrix.mat4.scaleVector(null, dp12, duv13[1]), glMatrix.mat4.scaleVector(null, dp13, duv12[1]),), f))
          : [1, 0, 0];
        tangents.push.apply(tangents, tangent);
        tangents.push.apply(tangents, tangent);
        tangents.push.apply(tangents, tangent);
  
      }
      return tangents;
    }
  
  
    function parseOBJ(text) {
      // because indices are base 1 let's just fill in the 0th data
      const objPositions = [[0, 0, 0]];
      const objTexcoords = [[0, 0]];
      const objNormals = [[0, 0, 0]];
      const objColors = [[0, 0, 0]];
  
      // same order as `f` indices
      const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
      ];
  
      // same order as `f` indices
      let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
      ];
  
      const materialLibs = [];
      const geometries = [];
      let geometry;
      let groups = ['default'];
      let material = 'default';
      let object = 'default';
  
      const noop = () => { };
  
      function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
          geometry = undefined;
        }
      }
  
      function setGeometry() {
        if (!geometry) {
          const position = [];
          const texcoord = [];
          const normal = [];
          const color = [];
          webglVertexData = [
            position,
            texcoord,
            normal,
            color,
          ];
          geometry = {
            object,
            groups,
            material,
            data: {
              position,
              texcoord,
              normal,
              color,
            },
          };
          geometries.push(geometry);
        }
      }
  
      function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
          if (!objIndexStr) {
            return;
          }
          const objIndex = parseInt(objIndexStr);
          const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
          webglVertexData[i].push.apply(webglVertexData[i], objVertexData[i][index]);
          // if this is the position index (index 0) and we parsed
          // vertex colors then copy the vertex colors to the webgl vertex color data
          if (i === 0 && objColors.length > 1) {
            geometry.data.color.push.apply(geometry.data.color, objColors[index]);
          }
        });
      }
  
      const keywords = {
        //顶点
        v(parts) {
          // if there are more than 3 values here they are vertex colors
          if (parts.length > 3) {
            objPositions.push(parts.slice(0, 3).map(parseFloat));
            objColors.push(parts.slice(3).map(parseFloat));
          } else {
            objPositions.push(parts.map(parseFloat));
          }
        },
        //顶点法线
        vn(parts) {
          objNormals.push(parts.map(parseFloat));
        },
        //纹理坐标
        vt(parts) {
          // should check for missing v and extra w?
          objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
          setGeometry();
          const numTriangles = parts.length - 2;
          for (let tri = 0; tri < numTriangles; ++tri) {
            addVertex(parts[0]);
            addVertex(parts[tri + 1]);
            addVertex(parts[tri + 2]);
          }
        },
        s: noop,    // smoothing group
        //obj对应的材质文件
        mtllib(parts, unparsedArgs) {
          // the spec says there can be multiple filenames here
          // but many exist with spaces in a single filename
          materialLibs.push(unparsedArgs);
        },
        //当前图元所用材质
        usemtl(parts, unparsedArgs) {
          material = unparsedArgs;
          newGeometry();
        },
        g(parts) {
          groups = parts;
          newGeometry();
        },
        //对象名称
        o(parts, unparsedArgs) {
          object = unparsedArgs;
          newGeometry();
        },
      };
  
      const keywordRE = /(\w*)(?: )*(.*)/;
      const lines = text.split('\n');
      for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
          continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
          continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
          console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
          continue;
        }
        handler(parts, unparsedArgs);
      }
  
      // remove any arrays that have no entries.
      for (const geometry of geometries) {
        geometry.data = Object.entries(
          Object.entries(geometry.data).filter(([, array]) => array["length"] > 0));
      }
  
      // remove any arrays that have no entries.
      for (const geometry of geometries) {
        {
          // geometry.data = Object.fromEntries(
          // Object.entries(geometry.data).filter(([, array]) => array.length > 0));
          let arrData = Object.entries(geometry.data).filter(([, array]) => array["length"] > 0);
          let targetData = {};
          for (let j in arrData) {
            let curData = arrData[j][1][1];
            let key = curData[0];
            let value = curData[1];
            targetData[key] = value;
          }
          //重新赋值
          geometry.data = targetData;
        }
      }
  
      return {
        geometries,
        materialLibs,
      };
    }
  
    function parseMapArgs(unparsedArgs) {
      // TODO: handle options
      return unparsedArgs;
    }
  
    function parseMTL(text) {
      const materials = {};
      let material;
  
      const keywords = {
        newmtl(parts, unparsedArgs) {
          material = {};
          materials[unparsedArgs] = material;
        },
        /* eslint brace-style:0 */
        Ns(parts) { material.shininess = parseFloat(parts[0]); }, //反射高光度 指定材质的反射指数
        Ka(parts) { material.ambient = parts.map(parseFloat); }, //环境色
        Kd(parts) { material.diffuse = parts.map(parseFloat); }, //漫反射色
        Ks(parts) { material.specular = parts.map(parseFloat); }, //高光色
        Ke(parts) { material.emissive = parts.map(parseFloat); },
        map_Kd(parts, unparsedArgs) { material.diffuseMap = parseMapArgs(unparsedArgs); },
        map_Ns(parts, unparsedArgs) { material.specularMap = parseMapArgs(unparsedArgs); },
        map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
        Ni(parts) { material.opticalDensity = parseFloat(parts[0]); }, //折射值 指定材质表面的光密度
        d(parts) { material.opacity = parseFloat(parts[0]); },         //透明度
        illum(parts) { material.illum = parseInt(parts[0]); },
      };
  
      const keywordRE = /(\w*)(?: )*(.*)/;
      const lines = text.split('\n');
      for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
          continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
          continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
          console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
          continue;
        }
        handler(parts, unparsedArgs);
      }
  
      return materials;
    }
  
    export async function load(gl: WebGLRenderingContext, path: string) {
      const objHref = path;
      const response = await fetch(objHref);
      const text = await response.text();
      const obj = parseOBJ(text);
      const baseHref = new URL(objHref, window.location.href);
      const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
        const matHref = new URL(filename, baseHref).href;
        console.log("material----",filename);
        const response = await fetch(matHref);
        return await response.text();
      }));
      const materials = parseMTL(matTexts.join('\n'));
      const textures = {
        defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
        defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
      };
  
      // load texture for materials
      for (const material of Object.values(materials)) {
        Object.entries(material)
          .filter(([key]) => key.endsWith('Map'))
          .forEach(([key, filename]) => {
            let texture = textures[filename];
            if (!texture) {
              const textureHref = new URL(filename, baseHref).href;
              console.log("textures---------",filename);
              texture = createTexture(gl, textureHref);
              textures[filename] = texture;
            }
            material[key] = texture;
          });
      }
      // hack the materials so we can see the specular map
      Object.values(materials).forEach((m: any) => {
        m.shininess = 25;
        m.specular = [3, 2, 1];
      });
  
      const defaultMaterial = {
        diffuse: [1, 1, 1],
        diffuseMap: textures.defaultWhite,
        normalMap: textures.defaultNormal,
        ambient: [0, 0, 0],
        specular: [1, 1, 1],
        specularMap: textures.defaultWhite,
        shininess: 400,
        opacity: 1,
      };
  
      const parts = obj.geometries.map(({ material, data }) => {
        // Because data is just named arrays like this
        //
        // {
        //   position: [...],
        //   texcoord: [...],
        //   normal: [...],
        // }
        //
        // and because those names match the attributes in our vertex
        // shader we can pass it directly into `createBufferInfoFromArrays`
        // from the article "less code more fun".
  
        if (data.color) {
          if (data.position.length === data.color.length) {
            // it's 3. The our helper library assumes 4 so we need
            // to tell it there are only 3.
            data.color = { numComponents: 3, data: data.color };
          }
        } else {
          // there are no vertex colors so just use constant white
          data.color = { value: [1, 1, 1, 1] };
        }
  
        // generate tangents if we have the data to do so.
        if (data.texcoord && data.normal) {
          data.tangent = generateTangents(data.position, data.texcoord);
        } else {
          // There are no tangents
          data.tangent = { value: [1, 0, 0] };
        }
  
        if (!data.texcoord) {
          data.texcoord = { value: [0, 0] };
        }
  
        if (!data.normal) {
          // we probably want to generate normals if there are none
          data.normal = { value: [0, 0, 1] };
        }
  
        // create a buffer for each array by calling
        // gl.createBuffer, gl.bindBuffer, gl.bufferData
        const bufferInfo = G_ShaderFactory.createBufferInfoFromArrays(data);
  
        var retData: any = {};
        retData.bufferInfo = bufferInfo;
        retData.material = {};
        for (var j in defaultMaterial) {
          retData.material[j] = defaultMaterial[j];
        }
        for (let j in materials[material]) {
          retData.material[j] = materials[material][j];
        }
        return retData;
      });
  
      return { obj: obj, parts: parts };
    }
  
  }
  
  
  