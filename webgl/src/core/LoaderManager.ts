/**
 * 加载管理员
 */
import { MD5 } from "../tool/MD5";
import { syRender } from "./renderer/data/RenderData";
import { MathUtils } from "./utils/MathUtils";

//--------------------------------------------------gltf

namespace gltfHelper {
    class LoaderUtils {
        static decodeText(array) {
            if (typeof TextDecoder !== 'undefined') {
                return new TextDecoder().decode(array);
            } // Avoid the String.fromCharCode.apply(null, array) shortcut, which
            // throws a "maximum call stack size exceeded" error for large arrays.

            let s = '';

            for (let i = 0, il = array.length; i < il; i++) {
                // Implicitly assumes little-endian.
                s += String.fromCharCode(array[i]);
            }

            try {
                // merges multi-byte utf-8 characters.
                return decodeURIComponent(escape(s));
            } catch (e) {
                // see #16358
                return s;
            }
        }
        static extractUrlBase(url) {
            const index = url.lastIndexOf('/');
            if (index === -1) return './';
            return url.substr(0, index + 1);
        }

    }

    const EXTENSIONS = {
        KHR_BINARY_GLTF: 'KHR_binary_glTF',
        KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
        KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
        KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
        KHR_MATERIALS_IOR: 'KHR_materials_ior',
        KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
        KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
        KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
        KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
        KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
        KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
        KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
        KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
        EXT_TEXTURE_WEBP: 'EXT_texture_webp',
        EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
    };
    const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
    const BINARY_EXTENSION_HEADER_LENGTH = 12;
    const BINARY_EXTENSION_CHUNK_TYPES = {
        JSON: 0x4E4F534A,
        BIN: 0x004E4942
    };
    export class GLTFBinaryExtension {

        public name: string;
        public content: any;
        public body: any;
        public header: any;
        constructor(data) {

            this.name = EXTENSIONS.KHR_BINARY_GLTF;
            this.content = null;
            this.body = null;
            const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
            this.header = {
                magic: LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
                version: headerView.getUint32(4, true),
                length: headerView.getUint32(8, true)
            };

            if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

                throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');

            } else if (this.header.version < 2.0) {

                throw new Error('THREE.GLTFLoader: Legacy binary file detected.');

            }

            const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
            const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
            let chunkIndex = 0;

            while (chunkIndex < chunkContentsLength) {

                const chunkLength = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;
                const chunkType = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;

                if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

                    const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
                    this.content = LoaderUtils.decodeText(contentArray);

                } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

                    const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
                    this.body = data.slice(byteOffset, byteOffset + chunkLength);

                } // Clients must ignore chunks with unknown types.


                chunkIndex += chunkLength;

            }

            if (this.content === null) {

                throw new Error('THREE.GLTFLoader: JSON content not found.');

            }

        }

    }
}
//-----------------------------------------------------------------------------------------------------end

/**
 var myHeaders = new Headers();
var myInit:any = { method: 'GET',
              headers: myHeaders,
              mode: 'cors',
              cache: 'default' };
var myRequest = new Request('http:localhost:3000//res/models/windmill/windmill.obj', myInit);

fetch(myRequest).then(function(response) {
   return response.text();
 }).then(function(myBlob) {
   console.log("myBlob-------",myBlob);
 });
 */

async function loadFile(url, typeFunc) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`could not load: ${url}`);
    }
    return await response[typeFunc]();
}

async function loadBinary(url) {
    return loadFile(url, 'arrayBuffer');
}

async function loadJSON(url) {
    return loadFile(url, 'json');
}
async function loadText(url) {
    return loadFile(url, 'text');
}

export default class LoaderManager {
    private _cache: Map<string, any>;//资源缓存
    public static _instance: LoaderManager;
    public static get instance(): LoaderManager {
        if (!this._instance)
            this._instance = new LoaderManager();
        return this._instance;
    }

    constructor() {
        this._cache = new Map<string, any>();
    }

    //加载gltf动画文件
    async loadGLTF(path: string) {
        const gltf = await loadJSON(path);
        // load all the referenced files relative to the gltf file
        const baseURL = new URL(path, location.href);
        gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
            const url = new URL(buffer.uri, baseURL.href);
            return loadBinary(url.href);
        }));
        this._cache.set(path, gltf);
    }

    //加载json格式的二进制
    //就是将json转为二进制 然后以二进制读取再转会json
    private loadJsonBlobData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        //以二进制方式读取数据,读取到的结果将放入Blob的一个对象中存放
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    var rawData = new Float32Array(fr.result as ArrayBuffer);
                    var str = "";
                    for (var i = 0; i < rawData.length; i++) {
                        str = str + String.fromCharCode((rawData[i]));
                    }
                    JSON.parse(str);
                    if (callBackFinish) callBackFinish.call(null, fr.result, path);
                }
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }

    /**
     * 加载obj
     */
    public loadObjData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {

    }


    //加载二进制数据
    private loadBlobData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    if (callBackFinish) callBackFinish.call(null, fr.result, path);
                }
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    private loadGlbBlobData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "arraybuffer";
        request.onload = function () {
            if (request.status == 0) {
                var gltfbe = new gltfHelper.GLTFBinaryExtension(request.response);
                var result = JSON.parse(gltfbe.content as string);
                if (callBackFinish) callBackFinish.call(null, result, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    //加载json数据
    private loadJsonData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "json";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = request.response;
                if (callBackFinish) callBackFinish.call(null, jsonData, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    //加载可以转化为json的数据
    private loadJsonStringData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = JSON.parse(request.responseText);
                if (callBackFinish) callBackFinish.call(null, jsonData, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    //加载可以转化为json的数据
    private loadGlslStringData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                if (callBackFinish) callBackFinish.call(null, request.responseText, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    //加载可以转化为json的数据
    private loadTextData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                let content = request.responseText;
                let arr = content.split("&&");
                let last = [];
                for (let i = 0; i < arr.length; i = i + 3) {
                    //0 1 2
                    last.push({ content: arr[i], type: arr[i + 2] });
                }
                console.log(last);
                if (callBackFinish) callBackFinish.call(null, request.responseText, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    //加载骨骼数据
    private loadSkelData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    if (callBackFinish) callBackFinish.call(null, fr.result, path);
                }
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }

    //加载图片数据
    private loadImageData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        let isHttp = path.indexOf("http") >= 0;
        if (!isHttp) {
            //本地
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function (img: HTMLImageElement) {
                if (!img) {
                    console.log("加载的图片路径不存在---", path);
                    return;
                }
                if (callBackFinish) callBackFinish.call(null, img, path);
            }.bind(this, img);
            img.onerror = function (event) {
                if (callBackError)
                    callBackError(img, path)
            }
            img.src = path;
        }
        else {
            var request = new XMLHttpRequest();
            request.open("get", path, true);
            request.send();
            request.responseType = "blob";
            request.onload = function () {
                if (request.status == 200) {
                    var objectURL = URL.createObjectURL(request.response);
                    var img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = objectURL;
                    img.decode().then(() => {
                        //防止卡顿 图片预先解码
                        if (callBackFinish) callBackFinish.call(null, img, path);
                    });
                }
                else {
                    if (callBackError)
                        callBackError(img, path)
                }
            }
        }
    }
    private loadsyData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        let isHttp = path.indexOf("http") >= 0;
        if (!isHttp) {
            //本地
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function (img: HTMLImageElement) {
                if (callBackFinish) callBackFinish.call(null, img, path);
            }.bind(this, img);
            img.onerror = function (event) {
                if (callBackError)
                    callBackError(img, path)
            }
            img.src = path;
        }
        else {
            var request = new XMLHttpRequest();
            request.open("get", path, true);
            request.send();
            request.responseType = "blob";
            request.onload = function () {
                if (request.status == 200) {
                    //way1
                    // var objectURL = URL.createObjectURL(request.response);
                    // var img = new Image();
                    // img.crossOrigin = "anonymous";
                    // img.src = objectURL;
                    // img.decode().then(()=>{
                    //     //防止卡顿 图片预先解码
                    //     if (callBackFinish) callBackFinish.call(null, img, path);
                    // });

                    //way2
                    var fr = new FileReader(); //FileReader可以读取Blob内容  
                    fr.readAsDataURL(request.response); //二进制转换成ArrayBuffer
                    fr.onload = function (e) {  //转换完成后，调用onload方法
                        var img = new Image();
                        img.crossOrigin = "anonymous";
                        img.src = fr.result as string;
                        img.decode().then(() => {
                            //防止卡顿 图片预先解码
                            if (callBackFinish) callBackFinish.call(null, img, path);
                        });
                        var waitWriteData = fr.result as string;
                        //--------secret
                        waitWriteData = waitWriteData.replace("data:text/plain;base64", "zhangman")
                        //--------------

                        //-----------
                        var targetPath = path.replace("//", "/");
                        var pathArr = targetPath.split("/");
                        var targetfileName = pathArr[pathArr.length - 1].split(".")[0]
                        var file = new File([waitWriteData], targetfileName + ".b64sy", { type: "text/plain;charset=utf-8" })
                        window["saveAs"](file)
                        //-----------

                    }
                }
                else {
                    if (callBackError)
                        callBackError(img, path)
                }
            }
        }
    }
    private loadb62syData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {
        let isHttp = path.indexOf("http") >= 0;
        if (!isHttp) {
            //本地
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function (img: HTMLImageElement) {
                if (callBackFinish) callBackFinish.call(null, img, path);
            }.bind(this, img);
            img.onerror = function (event) {
                if (callBackError)
                    callBackError(img, path)
            }
            img.src = path;
        }
        else {
            var request = new XMLHttpRequest();
            request.open("get", path, true);
            request.send();
            request.responseType = "text";
            request.onload = function () {
                if (request.status == 200) {
                    var img = new Image();
                    img.crossOrigin = "anonymous";
                    var waitWriteData = request.response
                    waitWriteData = waitWriteData.replace("zhangman", "data:text/plain;base64")
                    img.src = waitWriteData;
                    img.decode().then(() => {
                        //防止卡顿 图片预先解码
                        if (callBackFinish) callBackFinish.call(null, img, path);
                    });
                    img.onerror = function (event) {
                        if (callBackError)
                            callBackError(img, path)
                    }

                }
                else {
                    if (callBackError)
                        callBackError(img, path)
                }
            }
        }
    }
    //加载可以转化为json的数据
    private loadFntData(path: string, callBackProgress?, callBackFinish?, callBackError?): void {

        var getConfigByKey = function (configText, key) {
            var itemConfigTextList = configText.split(" ");

            for (var i = 0, length = itemConfigTextList.length; i < length; i++) {
                var itemConfigText = itemConfigTextList[i];

                if (key === itemConfigText.substring(0, key.length)) {
                    var value = itemConfigText.substring(key.length + 1);
                    return parseInt(value);
                }
            }

            return 0;
        }

        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                var ret: any = {}
                let fntText = request.responseText;
                fntText = fntText.split("\r\n").join("\n");
                var lines = fntText.split("\n");
                var charsCount = getConfigByKey(lines[3], "count");
                ret.lineHeight = getConfigByKey(lines[1], 'lineHeight');
                ret.fontSize = getConfigByKey(lines[0], 'size');
                ret.textureWidth = getConfigByKey(lines[1], 'scaleW');
                ret.textureHeight = getConfigByKey(lines[1], 'scaleH');
                ret.letterInfos = {};
                
                for (var i = 4; i < 4 + charsCount; i++) {
                    var charText = lines[i];
                    var letter = String.fromCharCode(getConfigByKey(charText, "id"));  
                    var c = {};
                    ret.letterInfos[letter] = c;
                    c["x"] = getConfigByKey(charText, "x");
                    c["y"] = getConfigByKey(charText, "y");
                    c["width"] = getConfigByKey(charText, "width");
                    c["height"] = getConfigByKey(charText, "height");
                    c["xoffset"] = getConfigByKey(charText, "xoffset");
                    c["yoffset"] = getConfigByKey(charText, "yoffset");
                    c["xadvance"] = getConfigByKey(charText, "xadvance");
                }
                console.log(ret)
                if (callBackFinish) callBackFinish.call(null, ret, path);
            }
            else {
                if (callBackError)
                    callBackError(request, path)
            }
        }
    }
    private getLoadFunc(path: string): Function {
        let strArr = path.split('.');
        let extName = strArr[strArr.length - 1];
        switch (extName) {
            case "jpg": return this.loadImageData;
            case "png": return this.loadImageData;
            case "bin": return this.loadBlobData;
            case "obj": return this.loadObjData;
            case "json": return this.loadJsonData;
            case "gltf": return this.loadJsonStringData;
            case "glb": return this.loadGlbBlobData;
            case "skel": return this.loadSkelData;
            case "txt": return this.loadTextData;
            case "glsl": return this.loadGlslStringData;
            case "frag": return this.loadGlslStringData;
            case "vert": return this.loadGlslStringData;
            case "sy": return this.loadsyData;
            case "b64sy": return this.loadb62syData;
            case "fnt": return this.loadFntData;
            default: console.log("发现未知后缀名的文件----", path); null; break;
        }
    }
    //加载数据
    public async load(arr: Array<string> | string, callBackProgress?, callBackFinish?) {

        //test
        // await this.loadGLTF("https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf");

        if (!(arr instanceof Array)) {
            arr = [arr];
        }
        var count = 0;
        var length = arr.length;
        var resRet: Array<any> = [];
        for (var j = 0; j < length; j++) {
            let path: string = arr[j];
            let result = this.getRes(path);
            if (result) {
                //资源存在 不用重新加载
                resRet.push(result);
                count++;
                if (callBackProgress) callBackProgress(count / length);
                this.onLoadProgress(count / length);

                if (count == length) {
                    this.onLoadFinish();
                    //任何加载成功图片的逻辑 都必须等到下一帧再返回结果
                    requestAnimationFrame(() => {
                        if (callBackFinish) callBackFinish(resRet.length == 1 ? resRet[0] : resRet);
                    });
                    return;
                }
                //继续加载
                continue;
            }

            var loadFunc = this.getLoadFunc(path);
            loadFunc.call(this, path, null, (res, path) => {
                resRet.push(res);
                this._cache.set(path, res);
                if (callBackProgress) callBackProgress(count / length);
                count++;
                this.onLoadProgress(count / length);
                if (count == length) {
                    this.onLoadFinish();
                    //任何加载成功图片的逻辑 都必须等到下一帧再返回结果
                    requestAnimationFrame(() => {
                        if (callBackFinish) callBackFinish(resRet.length == 1 ? resRet[0] : resRet);
                    });
                }
            }, (res, path) => {
                count++;
                if (count == length) {
                    this.onLoadFinish();
                    //任何加载成功图片的逻辑 都必须等到下一帧再返回结果
                    requestAnimationFrame(() => {
                        if (callBackFinish) callBackFinish(resRet.length == 1 ? resRet[0] : resRet);
                    });
                }

            });
        }
    }
    //获取缓存中的数据
    public getRes(url: string): any {
        return this._cache.get(url);
    }

    /**
     * 调整模板pass
     */
    public adjustTemplatePass(): void {
        let passName = "res/glsl/StandardTemplate/pass.json";
        let passData = this.getRes(passName);
        let baseData: any = {};
        for (let k = 0; k < passData.length; k++) {
            if (passData[k].name == "baseAttribute")
                baseData = passData[k];
        }
        //追加
        for (let k in passData) {
            let v = passData[k]
            if (v.name == "baseAttribute")
                continue;
            if (v.template == null) {
                v.template = baseData.template
            }

            //copy state-------------------------------------
            var baseState: Array<any> = baseData.state;
            if (v.state == null) {
                v.state = MathUtils.clone(baseState)
            }
            else {
                baseState.forEach((value, index) => {
                    let isExist: boolean = false;
                    v.state.forEach((svalue, sindex) => {
                        if (svalue.key == value.key) {
                            isExist = true;
                        }
                    })
                    //对于不存在的值 要以模板值为主
                    //对于存在的值，则以外围pass为主
                    if (!isExist) {
                        v.state.push(value);
                    }
                })
            }

            //copy custom--------------------------------------------
            var baseCustom: Array<any> = baseData.custom;
            if (baseCustom && baseCustom.length > 0) {
                if (v.custom == null) {
                    v.custom = MathUtils.clone(baseCustom)
                }
                else {
                    baseCustom.forEach((value, index) => {
                        let isExist: boolean = false;
                        v.custom.forEach((svalue, sindex) => {
                            if (svalue.key == value.key&&svalue.value ==value.value) {
                                isExist = true;
                            }
                        })
                        //对于不存在的值 要以模板值为主
                        //对于存在的值，则以外围pass为主
                        if (!isExist) {
                            v.custom.push(value);
                        }
                    })
                }
            }
        }
    }

    public loadTemplate(cb): void {
        LoaderManager.instance.loadGlsl("StandardTemplate", null, function () {
            LoaderManager.instance.adjustTemplatePass();
            if (cb) cb();
        })
    }
    /**
     * 加载着色器代码
     * @param spriteName 
     * @param progressBack 
     * @param finishBack 
     * @param passContent 
     */
    public loadGlsl(spriteName: string, progressBack?: Function, finishBack?: Function, passContent?: Array<any>): void {

        let fatherPath = "res/glsl/" + spriteName + "/";
        let standardTemplate = "res/glsl/StandardTemplate/";//模板库目录
        let passName = fatherPath + "pass.json";
        let vertExtName = ".vert";
        let fragExtName = ".frag";
        //执行加载
        var loadCount = 1;
        let runRealLoad = function (passJson: any) {
            let vs = fatherPath + passJson.name + vertExtName;
            let fs = fatherPath + passJson.name + fragExtName;
            if (passJson.template) {
                vs = standardTemplate + passJson.name + vertExtName;
                fs = standardTemplate + passJson.name + fragExtName;
            }
            let vsData = this.getRes(vs);
            let fsData = this.getRes(fs);

            if (vsData && fsData) {
                loadCount--;
                if (progressBack) progressBack([vsData, fsData, passJson]);
                if (loadCount <= 0 && finishBack) {
                    finishBack();
                }
            }
            else {
                this.load([vs, fs], null, (res) => {
                    if (!res) {
                        console.log("加载出错");
                    }
                    loadCount--;
                    let vsData = this.getRes(vs);
                    let fsData = this.getRes(fs);
                    if (!vsData || !fsData) {
                        console.log("当前要加载的shader源码不存在------", spriteName);
                        if (loadCount <= 0 && finishBack) {
                            finishBack();
                        }
                        return;
                    }
                    if (progressBack) progressBack([vsData, fsData, passJson]);
                    if (loadCount <= 0 && finishBack) {
                        finishBack();
                    }
                })
            }

        }.bind(this)

        var loadPassFinish = function (res: any[]) {
            if (res && res.length > 0) {
                //追加额外的pass
                var passLen = res.length;
                var reduceLen = 0;
                for (let k = 0; k < passLen; k++) {
                    if (res[k].name == "TemplatePass") {
                        var templatePass = this.getStandardTemplatePass(res[k].tag);
                        if (templatePass) {
                            //copy state-----------------------------------------------
                            if (res[k].state) {
                                templatePass.state.forEach((value, index) => {
                                    let isExist: boolean = false;
                                    res[k].state.forEach((svalue, sindex) => {
                                        if (svalue.key == value.key) {
                                            isExist = true;
                                        }
                                    })
                                    //对于不存在的值 要以模板值为主
                                    //对于存在的值，则以外围pass为主
                                    if (!isExist) {
                                        res[k].state.push(value);
                                    }
                                })

                            }
                            else {
                                res[k].state = MathUtils.clone(templatePass.state)
                            }
                            res[k].name = templatePass.name
                            res[k].template = true;

                            //copy custom-----------------------------------------------
                            // res[k].custom = MathUtils.clone(templatePass.custom)
                            if (templatePass.custom && templatePass.custom.length > 0) {
                                if (res[k].custom) {
                                    templatePass.custom.forEach((value, index) => {
                                        let isExist: boolean = false;
                                        res[k].custom.forEach((svalue, sindex) => {
                                            if (svalue.key == value.key&&svalue.value ==value.value) {
                                                isExist = true;
                                            }
                                        })
                                        //对于不存在的值 要以模板值为主
                                        //对于存在的值，则以外围pass为主
                                        if (!isExist) {
                                            res[k].custom.push(value);
                                        }
                                    })

                                }
                                else {
                                    res[k].custom = MathUtils.clone(templatePass.custom)
                                }
                            }
                        }
                    }
                    else if (res[k].name == "baseAttribute") {
                        reduceLen = 1;
                    }
                }
                //加载pass成功啦
                loadCount = res.length - reduceLen
                for (let k = reduceLen; k < res.length; k++) {
                    runRealLoad(res[k])
                }
            }
            else {
                console.log("配置pass出错啦------", res);
            }
        }.bind(this)

        //先加载pass
        if (passContent && passContent.length > 0) {
            loadPassFinish(passContent);
        }
        else {
            this.load(passName, () => { }, loadPassFinish)
        }
    }

    public getStandardTemplatePass(tag: syRender.ShaderType): any {
        var depthP = this.getRes("res/glsl/StandardTemplate/pass.json");
        if (depthP) {
            for (let k = 0; k < depthP.length; k++) {
                var customData = depthP[k].custom;
                if (customData && customData.length > 0) {
                    for (let j = 0; j < customData.length; j++) {
                        if (customData[j].key == syRender.PassCustomKey.ShaderType && customData[j].value == tag) {
                            return depthP[k];
                        }
                    }
                }
            }
        }
    }
    /**
     * 移除CPU端内存中的图片缓存
     * @param url 
     */
    public removeImage(url: string): void {
        var img: HTMLImageElement = this.getRes(url);
        if (img) {
            console.log("解除引用");
            this._cache.delete(url);
            this.releaseCPUMemoryForImageCache(img);
        }
        else {
            console.log("sorry----没找到---无法清理-", url);
        }
    }
    /**
     * 
     * @param img 
     * 释放CPU端内存中的图片缓存
     */
    public releaseCPUMemoryForImageCache(img: HTMLImageElement): void {
        img.src = "";
        img = null;
    }
    public onLoadProgress(progress: number): void {
        // console.log("加载进度---------", progress);
    }
    public onLoadFinish(): void {
        // console.log("加载完成啦");
    }

}