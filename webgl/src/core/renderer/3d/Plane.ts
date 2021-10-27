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

export class Plane extends SY.ShadowSprite{
    constructor(planeWidth:number,planeHeight:number){
        super();
        this._planeHeight = planeHeight;
        this._planeWidth = planeWidth;
        this.onLocalInit();
    }
    private _planeWidth:number = 20;//地形宽度
    private _planeHeight:number = 20;//地形高度
    private _subdivisionAcross:number = 1;//横排细分
    private _subdivisionDown:number = 1;//竖排细分
    private _widthCount:number = 20;
    private _heightCount:number = 20;

    onLocalInit(){
        let vertexData = syPrimitives.createPlaneVertices( 
            this._planeWidth,  // width
            this._planeHeight,  // height
            this._subdivisionAcross,   // subdivisions across
            this._subdivisionDown,   // subdivisions down
            );
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.attributeId,vertexData.indices,1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.attributeId,vertexData.normal, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.attributeId,vertexData.texcoord, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.attributeId,vertexData.position, 3)
        
        this.setColor(122.5,122.5,255,255);
    }

    public setCellCounts(widthCount:number,heightCount:number):void{
        this._widthCount = widthCount;
        this._heightCount = heightCount;
        this.spriteFrame = CustomTextureData.getBoardData(this._widthCount,this._heightCount,[0xFF,0xCC]);
    }
}


