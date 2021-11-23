
/**
 * 字节数组的使用
 * 整型：这个可以是一个字节Uint8Array,Int8Array,也可是双字节Uint16Array,Int16Array,
 * 也可是四字节Unit32Array,Int32Array
 * 浮点型：这个要四个字节，适用于float类型，例如Float32Array,当然也只有这一种类型
 * 双精度型：这个要八个字节，适用于double类型，例如Float64Array,当然也只有这一种类型
 * 
 * 使用
 *  // From a length
var float32 = new Float32Array(2);
float32[0] = 42;
console.log(float32[0]); // 42
console.log(float32.length); // 2
console.log(float32.BYTES_PER_ELEMENT); // 4

// From an array
var arr = new Float32Array([21,31]);
console.log(arr[1]); // 31

// From another TypedArray
var x = new Float32Array([21, 31]);
var y = new Float32Array(x);
console.log(y[0]); // 21

// From an ArrayBuffer
// var buffer = new ArrayBuffer(16);
var buffer = new ArrayBuffer(16);
// buffer[0] = 10;
// buffer[1] = 20;
// buffer[2] = 30;
// buffer[3] = 40;
// buffer[4] = 50;
var z = new Float32Array(buffer, 0, 4);
console.log(z);
// z.forEach(function(value,index,arr){
//     console.log(value,index,arr);
// })

 */

import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { CameraData } from "../data/CameraData";
import { syRender } from "../data/RenderData";
import { Node } from "./Node";
import { Texture, TextureOpts } from "./texture/Texture";
import { Texture2D } from "./texture/Texture2D";
import TextureCube from "./texture/TextureCube";
import TextureCustom from "./texture/TextureCustom";
import { BufferAttribute, G_BufferManager, IndexsBuffer, VertColorBuffer, VertMatrixBuffer, NormalBuffer, UVsBuffer, VertexsBuffer } from "./buffer/BufferManager";
import enums from "../camera/enums";
import { G_ShaderCenter } from "../shader/ShaderCenter";
import { LightData } from "../data/LightData";
import { syGL } from "../gfx/syGLEnums";
import { G_DrawEngine } from "./DrawEngine";
import { handler } from "../../../utils/handler";
import { G_TextureManager } from "./texture/TextureManager";
import { G_PassFactory } from "../shader/PassFactory";
import { Pass } from "../shader/Pass";
import { RenderTexture } from "./texture/RenderTexture";
import { glMatrix } from "../../math/Matrix";
import { glEnums } from "../gfx/GLapi";
import { syStateStringKey, syStateStringValue } from "../gfx/State";
import { GameMainCamera } from "../camera/GameMainCamera";
import { Color } from "../../value-types/color";
import { Material } from "./material/Material";

/**
 * 显示节点
 * author:hzj
 */
export namespace SY {
    export enum GLID_TYPE {
        VERTEX = 1, //顶点
        INDEX,   //索引
        NORMAL, //法线
        UV,     //uv
        TANGENT, //切线
        VERT_COLOR,  //顶点颜色
        VERT_MATRIX,//节点自定义矩阵
        TEXTURE_2D, //2D纹理
        TEXTURE_CUBE, //立方体纹理

        MORPH_TARGET_POSITION0,//变形目标顶点
        MORPH_TARGET_POSITION1,//变形目标顶点
        MORPH_TARGET_POSITION2,//变形目标顶点
        MORPH_TARGET_POSITION3,//变形目标顶点
        MORPH_TARGET_POSITION4,//变形目标顶点
        MORPH_TARGET_POSITION5,//变形目标顶点
        MORPH_TARGET_POSITION6,//变形目标顶点
        MORPH_TARGET_POSITION7,//变形目标顶点
    }

    export enum SpriteSizeMode {
        /**
     * !#en Use the customized node size.
     * !#zh 使用节点预设的尺寸
     * @property {Number} CUSTOM
     */
        CUSTOM = 0,
        /**
         * !#en Match the trimmed size of the sprite frame automatically.
         * !#zh 自动适配为精灵裁剪后的尺寸
         * @property {Number} TRIMMED
         */
        TRIMMED,
        /**
         * !#en Match the raw size of the sprite frame automatically.
         * !#zh 自动适配为精灵原图尺寸
         * @property {Number} RAW
         */
        RAW
    }
    var attributeId: number = 0;//材质id
    /**
     * 这个渲染类可以用于基础研究
     * 数据生成 绑定  
     */
    export class SpriteBase extends Node {

        private _attributeId: string;//这里存放一个材质id
        private _passContent: Array<any> = [];//pass的内容

        private _color: Color;//节点自定义颜色
        private _diffuse: Color;//漫反射颜色
        private _alpha: number = 1;//节点自定义透明度
        private _customMatrix: Float32Array = glMatrix.mat4.identity(null);//节点自定义矩阵

        private _textures: Array<Texture>;
        private _pass: Array<Pass>;
        private _renderData: Array<syRender.QueueItemBaseData>;
        
        //材料
        public material:Material;

        //参考glprimitive_type
        protected _sizeMode: SpriteSizeMode;//节点的尺寸模式
        constructor() {
            super();
            attributeId++;
            this._attributeId = "materialId_" + attributeId;
            this._renderData = []
            this._color = new Color(255, 255, 255, 255);//默认颜色为白色
            this._diffuse = new Color(255, 255, 255, 255);//默认颜色为白色
            this._sizeMode = SpriteSizeMode.CUSTOM;//默认加载图片的尺寸大小为自定义
            this._textures = [];
            this.material = new Material();
            this.init();
        }
        private init(): void {
            this.onInit();
        }

        public get attributeId() {
            return this._attributeId;
        }

        public pushPassContent(shaderTy: syRender.ShaderType, stateArr?: Array<Array<any>>, customArr?: Array<Array<any>>, isForce?: boolean, isNew: boolean = false): void {
            var tag = syRender.ShaderTypeString[shaderTy]
            if (tag==null) {
                return
            }
            var content = null;
            if (!isNew) {
                for (let k=0; k < this._passContent.length; k++) {
                    var v = this._passContent[k];
                    if (v.tag == tag) {
                        content = v;
                        break;
                    }
                }
            }
            if (!content) {
                content = { "name": "TemplatePass", "tag": tag, state: null, custom: null };
                this._passContent.push(content);
            }

            //状态
            if (stateArr && stateArr.length) {
                content.state = content.state ? content.state : []
                for (let k = 0; k < stateArr.length; k++) {
                    content.state.push({ "key": stateArr[k][0], "value": stateArr[k][1] });
                }
            }

            //宏
            if (customArr && customArr.length) {
                content.custom = content.custom ? content.custom : [];
                for (let k = 0; k < customArr.length; k++) {
                    if (customArr[k].length == 2) {
                        content.custom.push({ "key": customArr[k][0], "value": customArr[k][1] });
                    }
                    else if (customArr[k].length == 3) {
                        content.custom.push({ "key": customArr[k][0], "value": customArr[k][1] + "$" + customArr[k][2] });
                    }
                }
            }
            if (isForce) {
                this.handleShader();
            }
        };


        /**
         * 设置精灵图片的尺寸模式
         */
        public set sizeMode(mode: SpriteSizeMode) {
            this._sizeMode = mode;
        };
        protected onInit(): void {

        }
        /**
         * 节点被添加到父节点上
         */
        protected onEnter(): void {
            this.handleShader();
        }
        /**
         * 节点从父节点上移除
         */
        protected onEixt(): void {

        }
        protected onLoadShaderFinish(): void {
        }

        /**
         * 获取当前正在使用的shader
         */
        protected get baseProgram() {
            if (this._pass && this._pass.length > 0) {
                return this._pass[0].baseProgram;
            }
            else {
                console.error("当前还没创建pass")
            }
        }

        protected get program() {
            if (this._pass && this._pass.length > 0) {
                return this._pass[0].program;
            }
            else {
                console.error("当前还没创建pass")
            }
        }

        protected get pass() {
            return this._pass;
        }

        private handleBuiltDefine():void{
			
		  var builtDefine = G_BufferManager.getBuiltDefine(this.attributeId);
          if(builtDefine&&builtDefine.length>0&&this._passContent.length>0)
          {
            builtDefine.forEach((defineStr,index)=>{
               for(let k = 0;k<this._passContent.length;k++)
               {
                   let content = this._passContent[k];
                   if(!content.custom)
                   content.custom = [];
                   var isExist = false;
                   content.custom.forEach((value,key) => {
                       if(value.key==syRender.PassCustomKey.DefineUse&&value.value==defineStr)
                       isExist = true;
                   });
                   if(!isExist)
                   {
                       //插入
                       this._passContent[k].custom.push({ "key": syRender.PassCustomKey.DefineUse, "value": defineStr});
                   }
               }
            })
            
          }


            
            
        }
        /**
         * 处理着色器
         */
        private handleShader() {
            this._pass = []

            //内置宏
            this.handleBuiltDefine();
            let name = this.name;
            LoaderManager.instance.loadGlsl(name, (res) => {
                this._pass.push(G_PassFactory.createPass(res[0], res[1], res[2]));
            }, () => {
                this.onLoadShaderFinish();
            }, this._passContent);

        }
        public createCustomMatrix(mat): void {
            this._customMatrix = mat;
        }

        /**
         * 设置节点颜色
         * @param r [0-255]
         * @param g [0-255]
         * @param b [0-255]
         * @param a [0-255]
         */
        public setColor(r: number = 0, g: number = 0, b: number = 0, a: number = 255) {
            this._color.r = r;
            this._color.g = g;
            this._color.b = b;
            this._color.a = a;
        }
        /**
         * 设置慢反射颜色
         */
        public setDiffuse(r: number = 0, g: number = 0, b: number = 0, a: number = 255) {
            this._diffuse.r = r;
            this._diffuse.g = g;
            this._diffuse.b = b;
            this._diffuse.a = a;
        }
        /**
         * 设置节点的透明度
         */
        public set alpha(value: number) {
            this._alpha = value
        }
        /**
         * 获取节点透明度
         */
        public get alpha(): number {
            return this._alpha
        }
        public set spriteFrame(url: string | Array<string> | TextureOpts | Object) {
            var tex = G_TextureManager.createTexture(url);
            if(tex.isTexture2D&&!(tex instanceof RenderTexture) )
            {
                tex.builtType = syRender.BuiltinTexture.TEXTURE0+this._textures.length;
                 //2d
                 this._textures.forEach((value,index)=>{
                     if((value as Texture2D).url==url)
                     {
                         //删掉重复的值
                        this._textures.splice(index)
                     }
                 })
            }
            this._textures.push(tex); 
            this.onSetTextureUrl(tex);
        }
        
        /**
         * 设置内置的纹理
         * @param url 
         * @param builtTexType 
         */
        public setBuiltSpriteFrame(url: string,builtTexType:syRender.BuiltinTexture):void{
             var tex = G_TextureManager.createTexture(url);
             if(tex)
             {
                tex.builtType = builtTexType;
                this._textures.push(tex);
                if(builtTexType == syRender.BuiltinTexture.MAP_BUMP)
                {
                    //凹凸贴图
                    this.material.bumpMap = tex;
                    this.material.bumpScale = 0.01;
                    this.pushPassContent(syRender.ShaderType.Sprite,[],[
                        [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_MAP_BUMP]
                    ])
                }
                else if(builtTexType==syRender.BuiltinTexture.MAP_NORMAL)
                {
                    //法线贴图
                    this.material.normalMap = tex;
                    this.material.normalMapScale = 1.0;
                    this.pushPassContent(syRender.ShaderType.Sprite,[],[
                        [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TANGENTSPACE_NORMALMAP]
                    ])
                }
             }
        }
        /**
         * 直接设置纹理
         */
        public set texture(tex: Texture) {
            
        }
        /**
         * 设置完纹理之后调用
         */
        protected onSetTextureUrl(tex:Texture): void {

        }
        /**
         * 获取顶点数据的buffer
         * @param type 
         */
        public getBuffer(type: GLID_TYPE): BufferAttribute {
            return G_BufferManager.getBuffer(type, this._attributeId)
        }
        protected getBufferItemSize(type: GLID_TYPE): number {
            var buffer = this.getBuffer(type);
            return buffer ? buffer.itemSize : -1
        }
        //采集数据以后的行为
        protected onCollectRenderDataAfter(data: syRender.QueueItemBaseData) {

        }
        //采集数据之前的行为
        protected onCollectRenderDataBefore() {

        }
        /**
         * 
         * @param texture 纹理的GLID
         */
        protected collectRenderData(time: number): void {
            if (this._textures && this._textures.length > 0) {
                //说明使用了纹理 但纹理还没有被加载完成
                for (let k = 0; k < this._textures.length; k++) {
                    if (this._textures[k].loaded == false) {
                        return;
                    }
                }
            }

            this.onCollectRenderDataBefore();
            if (!this._pass || this._pass.length == 0) {
                //一次渲染shader是必不可少的
                return
            }
            for (let i = 0; i < this._pass.length; i++) {
                let pass = this._pass[i];
                if (!pass) {
                    continue;
                }
                if (!this._renderData[i]) {
                    this._renderData.push(syRender.DataPool.get(syRender.QueueItemType.Base));
                }
                this._renderData[i].node = this as Node;
                this._renderData[i].pass = pass;
                this._renderData[i].time = time;

                this.updateRenderData(this._renderData[i]);
                this.onCollectRenderDataAfter(this._renderData[i])
                Device.Instance.collectData(this._renderData[i]);
            }
        }
        private updateRenderData(rData: syRender.QueueItemBaseData): void {
            //顶点组----------------------------------------------------------------------
            rData.primitive.position.glID = this.getBuffer(SY.GLID_TYPE.VERTEX).glID;
            rData.primitive.position.itemSize = this.getBufferItemSize(SY.GLID_TYPE.VERTEX);
            rData.primitive.position.itemNums = this.getBuffer(SY.GLID_TYPE.VERTEX).itemNums;
            //索引组----------------------------------------------------------------------
            var indexBufferAttribute = this.getBuffer(SY.GLID_TYPE.INDEX);
            if (indexBufferAttribute) {
                rData.primitive.index.glID = indexBufferAttribute.glID;
                rData.primitive.index.itemSize = indexBufferAttribute.itemSize;
                rData.primitive.index.itemNums = indexBufferAttribute.itemNums;
            }
            //uv组-------------------------------------------------------------------------
            var uvBufferAttribute = this.getBuffer(SY.GLID_TYPE.UV)
            if (uvBufferAttribute) {
                rData.primitive.uv.glID = uvBufferAttribute.glID;
                rData.primitive.uv.itemSize = uvBufferAttribute.itemSize;
            }
            //法线组-----------------------------------------------------------------------
            var normalBufferAttribute = this.getBuffer(SY.GLID_TYPE.NORMAL);
            if (normalBufferAttribute) {
                rData.primitive.normal.glID = normalBufferAttribute.glID;
                rData.primitive.normal.itemSize = normalBufferAttribute.itemSize;
            }
            //切线组-----------------------------------------------------------------------
            var tagentBufferAttribute = this.getBuffer(SY.GLID_TYPE.TANGENT);
            if (tagentBufferAttribute) {
                rData.primitive.tagent.glID = tagentBufferAttribute.glID;
                rData.primitive.tagent.itemSize = tagentBufferAttribute.itemSize;
            }
            //节点自定义顶点颜色组----------------------------------------------------------
            var vertcolorBufferAttribute = this.getBuffer(SY.GLID_TYPE.VERT_COLOR);
            if (vertcolorBufferAttribute) {
                rData.primitive.nodeVertColor.glID = vertcolorBufferAttribute.glID
                rData.primitive.nodeVertColor.itemSize = vertcolorBufferAttribute.itemSize;
                rData.primitive.nodeVertColor.itemNums = vertcolorBufferAttribute.itemNums;
            }

            //节点的颜色
            rData.primitive.color.set(this._color);
            //漫反射颜色
            rData.primitive.diffuse = this._diffuse;
            //节点的透明度
            rData.primitive.alpha = this._alpha;
            //自定义的矩阵
            rData.primitive.customMatrix = this._customMatrix;

            //节点自定义矩阵组------------------------------------------------------------------------
            var vertmatrixBufferAttribute = this.getBuffer(SY.GLID_TYPE.VERT_MATRIX);
            if (vertmatrixBufferAttribute) {
                rData.primitive.vertMatrix.glID = vertmatrixBufferAttribute.glID;
                rData.primitive.vertMatrix.itemSize = vertmatrixBufferAttribute.itemSize;
                rData.primitive.vertMatrix.itemNums = vertmatrixBufferAttribute.itemNums;
            }

            //模型矩阵
            rData.primitive.modelMatrix = this.modelMatrix;
            
            if(rData.pass.shaderType == syRender.ShaderType.RTT_Use)
            {
                 //mrt
                 var mrtTex = GameMainCamera.instance.getRenderTexture(syRender.RenderTextureUUid.RTT)
                 mrtTex.getDeferredTex().forEach((texS, index) => {
                     texS ? rData.push2DTexture(texS, index) : null;})
            }
            for (let k = 0; k < this._textures.length; k++) {
                var targetTexture = this._textures[k];
                if (targetTexture instanceof RenderTexture && (targetTexture as RenderTexture).isDeferred()) {
                    (targetTexture as RenderTexture).getDeferredTex().forEach((texS, index) => {
                                texS ? rData.push2DTexture(texS, index) : null;
                        })
                }
                else if (targetTexture && targetTexture.glID) {

                    if (targetTexture.isTexture2D)
                        rData.push2DTexture(targetTexture.glID,targetTexture.builtType);
                    else if (targetTexture.isTextureCube)
                        rData.pushCubeTexture(targetTexture.glID);
                }
            }
            rData.primitive.type = rData.pass.state.primitiveType;
        }
        /**
         * 默认返回第一个纹理
         */
        public get texture(): Texture {
            return this._textures[0];
        }
        public destroy(): void {
            this._textures.forEach((value, index) => {
                value.destroy();
            })
        }
    }
    /**
     * 阴影
     */
    export class ShadowSprite extends SpriteBase {
        constructor() {
            super();
            this._customTempMatrix = glMatrix.mat4.identity(null);
            this._tempMatrix = glMatrix.mat4.identity(null);
        }
        private _customTempMatrix: Float32Array;
        private _tempMatrix: Float32Array;

        protected onInit(): void {
            this.pushPassContent(syRender.ShaderType.ShadowMap, [], [
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_PACK]
            ]);

            this.pushPassContent(syRender.ShaderType.Sprite, [
                // [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_LINES]
            ], [
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK],

                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_MAT],
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_AMBIENT],
                // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPOT],
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_LIGHT_PARALLEL],
                // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_POINT],
                // [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_LIGHT_SPECULAR],
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_FOG]
            ]);
        }
        protected collectRenderData(time: number) {
            glMatrix.mat4.copy(this._tempMatrix, this._customTempMatrix)
            this.createCustomMatrix(this._tempMatrix);
            super.collectRenderData(time)
        }
        /**
         * 更新pv矩阵
         * @param proj 
         * @param view 
         */
        public onBindGPUBufferDataBefore(rd: syRender.QueueItemBaseData, proj: Float32Array, view: Float32Array): void {
            glMatrix.mat4.copy(this._customTempMatrix, rd.light.projectionMatrix);
            glMatrix.mat4.multiply(this._customTempMatrix, this._customTempMatrix, glMatrix.mat4.invert(null, rd.light.viewMatrix));
        }
    }
    /**
     * 多边形
     * 可以画线
     * 可以画点
     */
    export class SpriteBasePolygon extends SY.SpriteBase {
        constructor() {
            super();
        }
        private _polygon: Float32Array;//点坐标{x,y,z}
        public updatePositionData(posArr: Array<number>, isClear: boolean = true) {
            if (!posArr || posArr.length < 3) {
                if (this.is2DNode()) {
                    this.check();
                    this.updateScreenPosition(posArr, isClear)
                }
                return;
            }
            this.check();
            if (this.is2DNode()) {
                this.updateScreenPosition(posArr, isClear)
            }
            else if (this.is3DNode()) {
                this._polygon = new Float32Array(posArr);
                this.getBuffer(SY.GLID_TYPE.VERTEX).updateSubData(this._polygon);
            }
        }
        private updateScreenPosition(data: Array<any>, isClear: boolean = true): void {
            if ((!data || data.length == 0) && isClear == false) {
                return;
            }
            var clipPos: Array<number> = [];
            var z = -1;
            for (var k = 0; k < data.length; k++) {
                var temp = this.convertScreenSpaceToClipSpace(data[k].x, data[k].y);
                clipPos.push(temp[0]);
                clipPos.push(temp[1]);
                clipPos.push(z);
            }

            this._polygon = new Float32Array(clipPos);
            this.getBuffer(SY.GLID_TYPE.VERTEX).updateSubData(this._polygon);
        }
        private check(): void {
            if (!this._polygon) {
                G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, [], 3, 10)
            }
        }
        protected collectRenderData(time): void {
            if (!this._polygon || this._polygon.length < 3) return;
            super.collectRenderData(time);
        }
    }


    //2d显示节点
    /**lt(3)    rt(2)
     * ************
     * *          *
     * *          *
     * *          *
     * *          *
     * ************
     * lb(0)    rb(1) 
     * 
     * gl.TRIANGLES:表示以正常的三角形顺序进行绘制
     * 1：我们可以发送六个点给GPU,GPU就会按照给定点的顺序，每三个一组进行绘制
     * 注意每三个一组点的顺序非常重要，到底是顺时针还是逆时针，在执行剔除的时候，会决定是否剔除
     * (0,1,2)==>代表逆时针，（0,3,2）==>代表顺时针，而GPU那边默认剔除面的规则是顺时针是背面，逆时针是正面
     * 如果我们开启剔除，然后选择剔除的面是背面，那这个2d图片就只可以看到右下半部分这个三角形，左上半部分这个三角形被剔除了
     * 
     * 注意到上面是发六个顶点，每个顶点又有三个坐标（x,y,z）组成，如果每个坐标都是float,那每个坐标又是占4个字节，这里占的内存也是需要考虑的
     * 介于此,可以使用下面的方法
     * 2：如果我们要画一个四边形，我们只需要给GPU发送四个顶点就可以了，其本质上就是两个三角形拼接而成，然后再发送绘制索引，就好了，GPU会像发送顶点一样来找，三个三个取
     * 一个模型的顶点数是有限的，一般一个字节就足以了，当有很多三角形需要绘制的时候，这样可以省去不少内存
     * 
     * 总结：使用三角形绘制，不管是发送全部三角形的顶点数组，还是发送所有顶点的数组+所有三角形的索引数组，其绘制的规律一律是，三个三个取，最后面几个点如果不是3的倍数，则直接丢弃
     * 
     * gl.TRIANGLE_STRIP:三角形带绘制，
     * 发往GPU的数组：（0，1，2，3，4，5，6，7，8，9，....）
     * 这个数组的信息可以是纯粹的顶点，也可以是顶点+索引
     * 目前发现的规律是，从顶点数组或者索引数组中，先取三个顶点组成第一个三角形（0,1,2）,再从数组中取两个组成第三个三角形（2，3，4），
     * 再从数组中取两个组成第三个三角形（4，5，6），依次往下找
     * 
     * gl.LINES:表示画线，每次从数组中取出两个顶点，依次往下取
     * gl.LINES_STRIP:表示画线管带，第一次从数组中取出两个顶点组成一条线，后面依次取出一个点与上一次取出的最后一个点组成一条线
     *       
     * 凡继承此类的显示节点，则默认会干以下几件事
     * 1：根据尺寸，创建四个顶点坐标 组成一个顶点数组传送到GPU中
     * 2：根据四个顶点坐标的索引来画两个三角形刚好可以组成一个四边形，这些索引就组成了一个索引数组发往GPU中
     * 3：传四个顶点的UV坐标到GPU的显存中
     */
    export class UIImage extends SpriteBase {
        private _lt: Array<number> = [];//左上
        private _lb: Array<number> = [];//左下
        private _rt: Array<number> = [];//右上
        private _rb: Array<number> = [];//右下
        private _mask: Mask2D;//遮罩
        constructor() {
            super();
            this._node__type = syRender.NodeType.D2;
            this._sizeMode = SpriteSizeMode.RAW;
        }
        protected isUnpackY: boolean = false;
        private updateUV(): void {
            //uv 数据
            var texCoordinates_uv = [
                0.0, 1.0, //v0
                1.0, 1.0, //v1
                1.0, 0.0, //v2    //标准的uv坐标 左上角为原点 
                0.0, 0.0  //v3
            ];

            var texCoordinates_webgl = [
                0.0, 0.0, //v1
                1.0, 0.0, //v2       //webgl坐标 左下脚为原点
                1.0, 1.0, //v3
                0.0, 1.0, //v0
            ];

            G_BufferManager.createBuffer(SY.GLID_TYPE.UV, this.attributeId, this.isUnpackY ? texCoordinates_webgl : texCoordinates_uv, 2);
            // 索引数据
            var floorVertexIndices = [0, 1, 2, 3, 0];
            G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX, this.attributeId, floorVertexIndices, 1);

        }

        protected onSetTextureUrl(tex:Texture): void {
            if (tex)
                (tex as Texture2D).textureOnLoad = this.onTextureLoaded.bind(this);
        }

        /**
        * 加载纹理之后调用
        */
        public onTextureLoaded(image: HTMLImageElement): void {
            if (image) {
                if (this._sizeMode == SpriteSizeMode.RAW) {
                    this.setContentSize(image.width, image.height);
                }
            }
        }

        /**
        *
        * @param width
        * @param height
        */
        public setContentSize(width: number, height: number): void {
            this.width = width;
            this.height = height;

            var clipW = this.width / Device.Instance.width;
            var clipH = this.height / Device.Instance.height;

            var z = -1;
            //[-1,1] = >[0,1]
            var w = 2 * clipW;
            var h = 2 * clipH;

            this._lb = [];
            this._lb.push(-this.anchorX * w);
            this._lb.push(-this.anchorY * h);
            this._lb.push(z);                    //左下

            this._rb = [];
            this._rb.push(w - this.anchorX * w);  //右下
            this._rb.push(-this.anchorY * h);
            this._rb.push(z);

            this._rt = [];
            this._rt.push(w - this.anchorX * w); //右上
            this._rt.push(h - this.anchorY * h);
            this._rt.push(z);

            this._lt = [];
            this._lt.push(-this.anchorX * w);
            this._lt.push(h - this.anchorY * h);  //左上
            this._lt.push(z)


            var pos = [].concat(this._lb, this._rb, this._rt, this._lt);
            G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, pos, 3)
            this.updateUV();
        }

        public set mask(mk) {
            this._mask = mk;
        }
    }

    /**
     * mask
     */
    export class Mask2D extends UIImage {
        constructor() {
            super();
        }
        protected onInit() {
            super.onInit()

            this.pushPassContent(syRender.ShaderType.Sprite, [
                //深度 
                [syStateStringKey.depthTest, syStateStringValue.depthTest.ON],
                [syStateStringKey.depthFunc, syStateStringValue.depthFunc.LEQUAL],
                [syStateStringKey.depthWrite, syStateStringValue.depthWrite.ON],

                [syStateStringKey.blendColorMask, syRender.ColorMask.NONE],

                [syStateStringKey.stencilTest, syStateStringValue.stencilTest.ON],
                [syStateStringKey.stencilSep, syStateStringValue.stencilSep.OFF],
                [syStateStringKey.stencilFunc, syStateStringValue.stencilFunc.ALWAYS],
                [syStateStringKey.stencilRef, 10],
                [syStateStringKey.stencilMask, 0xffff],
                [syStateStringKey.stencilFailOp, syStateStringValue.stencilFailOp.KEEP],
                [syStateStringKey.stencilZFailOp, syStateStringValue.stencilZFailOp.KEEP],
                [syStateStringKey.stencilZPassOp, syStateStringValue.stencilZPassOp.REPLACE],

                // [syStateStringKey.stencilTestFront,syStateStringValue.stencilTestFront.ON],
                // [syStateStringKey.stencilFuncFront,syStateStringValue.stencilFuncFront.ALWAYS],
                // [syStateStringKey.stencilRefFront,3],
                // [syStateStringKey.stencilMaskFront,0xffff],
                // [syStateStringKey.stencilFailOpFront,syStateStringValue.stencilFailOpFront.KEEP],
                // [syStateStringKey.stencilZFailOpFront,syStateStringValue.stencilZFailOpFront.KEEP],
                // [syStateStringKey.stencilZPassOpFront,syStateStringValue.stencilZPassOpFront.REPLACE],
            ], [
                [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_ALPHA_TEST, 0.1]
            ])
        }
    }



    /**
     * 实例化绘制
     * 假设我们在界面上需要绘制1000个三角形，这些三角形大小都是一样的
     * 只是位置和颜色不同，那么就可以考虑使用实例化绘制
     * 首先把顶点数据发送给GPU，
     * 那么位置不同其实也就是空间坐标系不同，可以做一个矩阵来单独发送给GPU
     * 颜色不同，也就多发一个颜色属性给GPU
     * 有多少个实例三角形就需要发送多少个矩阵和颜色属性
     * 在GPU端，只需要开启一次draw就可以绘制多个三角形了
     * 在GPU端的数据是这样的
     * 【a,b,c】:这是三角形的顶点数据，只有一份哦
     * 【mat1,mat2,mat3,...】:这是实例化的矩阵数组，有多少个实例化，就有多少个矩阵
     * 【color1，color2,...】:这是实力化的颜色，有多少个实例化，就有多少个颜色
     *  启用这个drawArraysInstanced方法以后，GPU就拿着上面顶点数据，沿着实例化的个数，逐一从上面取数组中的item来进行绘制
     * 
     */
    export class Sprite2DInstance extends SY.UIImage {
        constructor() {
            super();
        }
        /**
         * 实例化的数目
         */
        private _numInstances: number;
        /**
         * 单个实例的顶点数目
         */
        private _InstanceVertNums: number;
        protected onInit(): void {
            this.pushPassContent(syRender.ShaderType.Instantiate)
            this._divisorNameData = new Map();
            this._divisorLocData = new Map();
        }
        private _divisorNameData: Map<string, boolean>;
        private _divisorLocData: Map<number, boolean>;
        public pushDivisor(name: string, isMatrix: boolean): void {
            if (this._divisorNameData.has(name) == false)
                this._divisorNameData.set(name, isMatrix);
        }
        protected set InstanceVertNums(nums: number) {
            this._InstanceVertNums = nums;
        }
        protected get InstanceVertNums(): number {
            return this._InstanceVertNums;
        }
        protected set numInstances(nums: number) {
            this._numInstances = nums;
        }
        protected get numInstances(): number {
            return this._numInstances;
        }
        protected onLoadShaderFinish() {
            this._divisorNameData.forEach((value, key) => {
                let loc = this.baseProgram.getCustomAttributeLocation(key);
                this._divisorLocData.set(loc, value)
            })
        }
        protected onCollectRenderDataAfter(renderData: syRender.QueueItemBaseData): void {
            renderData.primitive.instancedNums = this._numInstances
            renderData.primitive.instancedVertNums = this._InstanceVertNums
        }
        public onDrawBefore(time: number) {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.vertexAttribDivisor(key, 1, true);
                else
                    G_DrawEngine.vertexAttribDivisor(key);
            })
        }
        public onDrawAfter(): void {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.disableVertexAttribArrayDivisor(key, true);
                else
                    G_DrawEngine.disableVertexAttribArrayDivisor(key);
            })
        }

    }


    export class Sprite3DInstance extends SY.SpriteBase {
        constructor() {
            super();
        }
        /**
         * 实例化的数目
         */
        private _numInstances: number;
        /**
         * 单个实例的顶点数目
         */
        private _InstanceVertNums: number;
        protected onInit(): void {

            this._divisorNameData = new Map();
            this._divisorLocData = new Map();
            this.pushPassContent(syRender.ShaderType.Instantiate)
        }
        private _divisorNameData: Map<string, boolean>;
        private _divisorLocData: Map<number, boolean>;
        public pushDivisor(name: string, isMatrix: boolean): void {
            if (this._divisorNameData.has(name) == false)
                this._divisorNameData.set(name, isMatrix);
        }
        protected set InstanceVertNums(nums: number) {
            this._InstanceVertNums = nums;
        }
        protected get InstanceVertNums(): number {
            return this._InstanceVertNums;
        }
        protected set numInstances(nums: number) {
            this._numInstances = nums;
        }
        protected get numInstances(): number {
            return this._numInstances;
        }
        protected onLoadShaderFinish() {
            this._divisorNameData.forEach((value, key) => {
                let loc = this.baseProgram.getCustomAttributeLocation(key);
                this._divisorLocData.set(loc, value)
            })
        }
        protected onCollectRenderDataAfter(renderData: syRender.QueueItemBaseData): void {
            renderData.primitive.instancedNums = this._numInstances
            renderData.primitive.instancedVertNums = this._InstanceVertNums
        }
        public onDrawBefore(time: number) {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.vertexAttribDivisor(key, 1, true);
                else
                    G_DrawEngine.vertexAttribDivisor(key);
            })
        }
        public onDrawAfter(): void {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.disableVertexAttribArrayDivisor(key, true);
                else
                    G_DrawEngine.disableVertexAttribArrayDivisor(key);
            })
        }

    }


}