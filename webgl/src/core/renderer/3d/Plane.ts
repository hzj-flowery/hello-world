import { glMatrix } from "../../math/Matrix";
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import CustomTextureData from "../data/CustomTextureData";
import { syRender } from "../data/RenderData";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../primitive/Primitives";

/**
 * // 0. create depth cubemap transformation matrices
        // -----------------------------------------------
        float near_plane = 1.0f;
        float far_plane  = 25.0f;
        glm::mat4 shadowProj = glm::perspective(glm::radians(90.0f), (float)SHADOW_WIDTH / (float)SHADOW_HEIGHT, near_plane, far_plane);
        std::vector<glm::mat4> shadowTransforms;
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3( 1.0f,  0.0f,  0.0f), glm::vec3(0.0f, -1.0f,  0.0f)));
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3(-1.0f,  0.0f,  0.0f), glm::vec3(0.0f, -1.0f,  0.0f)));
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3( 0.0f,  1.0f,  0.0f), glm::vec3(0.0f,  0.0f,  1.0f)));
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3( 0.0f, -1.0f,  0.0f), glm::vec3(0.0f,  0.0f, -1.0f)));
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3( 0.0f,  0.0f,  1.0f), glm::vec3(0.0f, -1.0f,  0.0f)));
        shadowTransforms.push_back(shadowProj * glm::lookAt(lightPos, lightPos + glm::vec3( 0.0f,  0.0f, -1.0f), glm::vec3(0.0f, -1.0f,  0.0f)));

        // 1. Render depth of scene to texture (from light's perspective)
        glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
        glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO); 
        glClear(GL_DEPTH_BUFFER_BIT);
        simpleDepthShader.use();
        for (unsigned int i = 0; i < 6; ++i)
            simpleDepthShader.setMat4("shadowMatrices[" + std::to_string(i) + "]", shadowTransforms[i]);
        simpleDepthShader.setFloat("far_plane", far_plane);
        simpleDepthShader.setVec3("lightPos", lightPos);
        RenderScene(simpleDepthShader);
        glBindFramebuffer(GL_FRAMEBUFFER, 0);

        // 2. render scene as normal using the generated depth/shadow map
        // --------------------------------------------------------------
        glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        shader.use();
        glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        glm::mat4 view = camera.GetViewMatrix();
        shader.setMat4("projection", projection);
        shader.setMat4("view", view);
        // set lighting uniforms
        shader.setVec3("lightPos", lightPos);
        shader.setVec3("viewPos", camera.Position);
        shader.setInt("shadows", shadows); // enable/disable shadows by pressing 'SPACE'
        shader.setFloat("far_plane", far_plane);
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, woodTexture);
        glActiveTexture(GL_TEXTURE1);
        glBindTexture(GL_TEXTURE_CUBE_MAP, depthCubemap);
        RenderScene(shader);
 */

export class Plane extends SY.ShadowSprite {

    protected indices: Array<number>;
    protected vertices: Array<number>;
    protected normals: Array<number>;
    protected tangents: Array<number>;
    protected binormals: Array<number>;
    protected uvs: Array<number>;

    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super();

        this.indices = [];
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.tangents = [];
        this.binormals = [];

        this._planeHeight = width;
        this._planeWidth = width;


        this.width = width;
        this.height = height;
        this._widthSegments = widthSegments;
        this._heightSegments = heightSegments;

        const width_half = width / 2;
        const height_half = height / 2;

        const gridX = Math.floor(widthSegments);
        const gridY = Math.floor(heightSegments);

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        const segment_width = width / gridX;
        const segment_height = height / gridY;


        for (let iy = 0; iy < gridY1; iy++) {

            const y = iy * segment_height - height_half;

            for (let ix = 0; ix < gridX1; ix++) {

                const x = ix * segment_width - width_half;

                this.vertices.push(x, - y, 0);

                this.normals.push(0, 0, 1);

                this.uvs.push(ix / gridX);
                this.uvs.push(1 - (iy / gridY));

            }

        }

        for (let iy = 0; iy < gridY; iy++) {

            for (let ix = 0; ix < gridX; ix++) {

                const a = ix + gridX1 * iy;
                const b = ix + gridX1 * (iy + 1);
                const c = (ix + 1) + gridX1 * (iy + 1);
                const d = (ix + 1) + gridX1 * iy;

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

            }

        }

        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX, this.attributeId, this.indices, 1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL, this.attributeId, this.normals, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV, this.attributeId, this.uvs, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, this.vertices, 3)


    }
    private _planeWidth: number = 5;//地形宽度
    private _planeHeight: number = 5;//地形高度
    private _subdivisionAcross: number = 1;//横排细分
    private _subdivisionDown: number = 1;//竖排细分
    private _widthSegments: number = 20;
    private _heightSegments: number = 20;

    onLocalInit() {
        let vertexData = syPrimitives.createPlaneVertices(
            this._planeWidth,  // width
            this._planeHeight,  // height
            this._subdivisionAcross,   // subdivisions across
            this._subdivisionDown,   // subdivisions down
        );
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX, this.attributeId, vertexData.indices, 1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL, this.attributeId, vertexData.normal, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV, this.attributeId, vertexData.texcoord, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, vertexData.position, 3)
        this.setColor(122.5, 122.5, 255, 255);
    }

    public setCellCounts(widthCount: number, heightCount: number): void {
        // this._widthSegments = widthCount;
        // this._heightSegments = heightCount;
        this.spriteFrame = CustomTextureData.getBoardData(this._widthSegments, this._heightSegments, [0xFF, 0xCC]);
    }
}


