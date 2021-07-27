/**
 * 加载管理员
 */

import { PassTag } from "./renderer/shader/Pass";

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
    private loadJsonBlobData(path: string, callBackProgress?, callBackFinish?): void {
        var _this = this;
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
                    console.log("bin file---", fr.result);
                    var rawData = new Float32Array(fr.result as ArrayBuffer);
                    var str = "";
                    for (var i = 0; i < rawData.length; i++) {
                        str = str + String.fromCharCode((rawData[i]));
                    }
                    JSON.parse(str);
                    console.log("result --", str);
                    if (callBackFinish) callBackFinish.call(null, fr.result, path);
                }
            }
        }
    }

    /**
     * 加载obj
     */
    public loadObjData(path: string, callBackProgress?, callBackFinish?): void {

    }


    //加载二进制数据
    private loadBlobData(path: string, callBackProgress?, callBackFinish?): void {
        var _this = this;
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
        }
    }
    //加载json数据
    private loadJsonData(path: string, callBackProgress?, callBackFinish?): void {
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get", path);
        request.send(null);
        request.responseType = "json";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = request.response;
                if (callBackFinish) callBackFinish.call(null, jsonData, path);
            }
        }
    }
    //加载可以转化为json的数据
    private loadJsonStringData(path: string, callBackProgress?, callBackFinish?): void {
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = JSON.parse(request.responseText);
                if (callBackFinish) callBackFinish.call(null, jsonData, path);
            }
        }
    }
    //加载可以转化为json的数据
    private loadGlslStringData(path: string, callBackProgress?, callBackFinish?): void {
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                if (callBackFinish) callBackFinish.call(null, request.responseText, path);
            }
        }
    }
    //加载可以转化为json的数据
    private loadTextData(path: string, callBackProgress?, callBackFinish?): void {
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
        }
    }
    //加载骨骼数据
    private loadSkelData(path: string, callBackProgress?, callBackFinish?): void {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                // fr.readAsText(request.response);
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    // console.log("加载二进制成功---",fr.result);

                    // var uint8_msg = new Uint8Array(fr.result as ArrayBuffer);
                    // // 解码成字符串
                    // var decodedString = String.fromCharCode.apply(null, uint8_msg);
                    // console.log("字符串--",decodedString); 
                    // // parse,转成json数据
                    // var data = JSON.parse(decodedString);
                    // console.log(data);

                    // let content = fr.result;//arraybuffer类型数据
                    // let resBlob = new Blob([content])
                    // let reader = new FileReader()
                    // reader.readAsText(resBlob, "utf-8")
                    // reader.onload = () => {
                    //     console.log("gagag---",reader.result);
                    //         let res = JSON.parse(reader.result as string)
                    //         console.log(res);
                    // }


                    if (callBackFinish) callBackFinish.call(null, fr.result, path);
                }
            }
        }
    }

    //加载图片数据
    private loadImageData(path: string, callBackProgress?, callBackFinish?): void {
        console.log("path------", path);
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
            img.src = path;
        }
        else {
            //远程加载
            // fetch(path).then((response)=>{
            //     console.log("response-------",response);
            //     if(response.ok)
            //     {
            //         console.log("进来啦----");
            //         let myBlob =  response.blob();
            //         var objectURL = URL.createObjectURL(myBlob);
            //         var img = new Image(); 
            //         img.src = objectURL;
            //         console.log("objectURL------",objectURL);
            //         if (callBackFinish) callBackFinish.call(null, img, path); 
            //     }
            //     throw new Error('Network response was not ok.');
            // }).catch((err)=>{
            //     console.log("加载图片失败了啊");
            // })

            var request = new XMLHttpRequest();
            request.open("get", path, true);
            request.send();
            request.responseType = "blob";
            request.onload = function () {
                var objectURL = URL.createObjectURL(request.response);
                var img = new Image();
                img.crossOrigin = "anonymous";
                img.src = objectURL;
                if (callBackFinish) callBackFinish.call(null, img, path);
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
            case "skel": return this.loadSkelData;
            case "txt": return this.loadTextData;
            case "glsl": return this.loadGlslStringData;
            case "frag": return this.loadGlslStringData;
            case "vert": return this.loadGlslStringData;
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
            });
        }
    }
    //获取缓存中的数据
    public getRes(url: string): any {
        return this._cache.get(url);
    }
    /**
     * 加载着色器代码
     * @param spriteName 
     * @param progressBack
     */
    public loadGlsl(spriteName: string, progressBack?: Function, finishBack?: Function): void {

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
            loadCount--;
            if (vsData && fsData) {
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

        //先加载pass
        this.load(passName, () => { }, (res: any[]) => {
            if (res && res.length > 0) {

                //追加额外的pass
                for (let k = 0; k < res.length; k++) {
                    var extraTag = res[k].extraTemplateTag;
                    if (extraTag && extraTag.length > 0) {
                        for (let j = 0; j < extraTag.length; j++) {
                            var depthP = this.getStandardTemplatePass(extraTag[j]);
                            if (depthP) {
                                res.push(depthP);
                            }
                        }
                    }
                }
                //加载pass成功啦
                loadCount = res.length
                for (let k = 0; k < res.length; k++) {
                    runRealLoad(res[k])
                }
            }
            else {
                console.log("配置pass出错啦------", res);
            }
        })
    }
    
    public getStandardTemplatePass(tag:PassTag):any{
        var depthP = this.getRes("res/glsl/StandardTemplate/pass.json");
        if(depthP)
        {
            for(let k=0;k<depthP.length;k++)
            {
                if(depthP[k].tag==tag)
                {
                    return depthP[k]
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
        console.log("加载进度---------", progress);
    }
    public onLoadFinish(): void {
        console.log("加载完成啦");
    }

}