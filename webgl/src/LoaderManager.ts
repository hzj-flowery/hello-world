/**
 * 加载管理员
 */

class CacheImageData {
    constructor(url,img){
        this.url = url;
        this.img = img;
    }
    public url:string = "";
    public img:HTMLImageElement;
}

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

export default class LoaderManager{
    private _cacheImage:Array<CacheImageData> = [];
    private _cache:Map<string,any>;//资源缓存
    public static _instance:LoaderManager;
    public static get instance():LoaderManager
    {
        if(!this._instance)
        this._instance = new LoaderManager();
        return this._instance;
    }

    constructor(){
        this._cache = new Map<string,any>();
    }
    
    //加载gltf动画文件
    async loadGLTF(path:string){
        const gltf = await loadJSON(path);
        // load all the referenced files relative to the gltf file
        const baseURL = new URL(path, location.href);
        gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
            const url = new URL(buffer.uri, baseURL.href);
            return loadBinary(url.href);
        }));
        this._cache.set(path,gltf);
    }

    //加载json格式的二进制
    //就是将json转为二进制 然后以二进制读取再转会json
    private loadJsonBlobData(path:string,callBackProgress?,callBackFinish?):void{
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get",path);
        request.send(null);
        //以二进制方式读取数据,读取到的结果将放入Blob的一个对象中存放
        request.responseType = "blob";
        request.onload = function () {
            if(request.status==0)
            {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    console.log("bin file---",fr.result);
                    var rawData = new Float32Array(fr.result as ArrayBuffer);
                    var str = "";
                    for (var i = 0; i < rawData.length; i++) {
                        str = str+String.fromCharCode((rawData[i]));
                    }
                    JSON.parse(str);
                    console.log("result --",str);
                    _this._cache.set(path,fr.result);
                    if(callBackFinish)callBackFinish.call(null,fr.result);
                }
            }
        }
    }
    
    /**
     * 加载obj
     */
    public loadObjData(path:string,callBackProgress?,callBackFinish?):void{

    }

    
    //加载二进制数据
    public loadBlobData(path:string,callBackProgress?,callBackFinish?):void{
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get",path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if(request.status==0)
            {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    _this._cache.set(path,fr.result);
                    if(callBackFinish)callBackFinish.call(null,fr.result);
                }
            }
        }
    }
    //加载json数据
    public loadJsonData(path:string,callBackProgress?,callBackFinish?):void{
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get",path);
        request.send(null);
        request.responseType = "json";
        request.onload = function () {
            if(request.status==0)
            {
                var jsonData = request.response;
                _this._cache.set(path,jsonData)
                if(callBackFinish)callBackFinish.call(null,jsonData);
            }
        }
    }
    //加载可以转化为json的数据
    public loadJsonStringData(path:string,callBackProgress?,callBackFinish?):void{
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get",path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if(request.status==0)
            {
                var jsonData = JSON.parse(request.responseText);
                _this._cache.set(path,jsonData)
                if(callBackFinish)callBackFinish.call(null,jsonData);
            }
        }
    }
    //加载骨骼数据
    private loadSkelData(path:string,callBackProgress?,callBackFinish?):void{
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get",path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if(request.status==0)
            {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                // fr.readAsText(request.response);
                fr.onload = function (e) {  //转换完成后，调用onload方法
                    // console.log("加载二进制成功---",fr.result);
                    _this._cache.set(path,fr.result);
                    
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

    
                    if(callBackFinish)callBackFinish.call(null,fr.result);
                }
            }
        }
    }

    //加载图片数据
    public loadImageData(path:string,callBackProgress?,callBackFinish?):void{
        var img = new Image();
        img.onload = function(img:HTMLImageElement){
            if(!img)
            {
                console.log("加载的图片路径不存在---",path);
                return ;
            }
            this._cacheImage.push(new CacheImageData(path,img));
            if(callBackFinish)callBackFinish.call(null,img);
        }.bind(this,img);
        img.src = path;
    }
    private getLoadFunc(path:string):Function{
            let strArr = path.split('.');
            let extName = strArr[strArr.length-1];
            switch(extName)
            {
               case "jpg":return this.loadImageData;
               case "png":return this.loadImageData;
               case "bin":return this.loadBlobData;
               case "obj":return this.loadObjData;
               case "json":return this.loadJsonData;
               case "gltf":return this.loadJsonStringData;
               case "skel":return this.loadSkelData;
               default:console.log("发现未知后缀名的文件----",path);null;break;
            }
    }
    //加载数据
    public async loadData(arr:Array<string>,callBackProgress?,callBackFinish?){
         
        //test
        // await this.loadGLTF("https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf");

        var count = 0;
        for(var j =0;j<arr.length;j++)
        {
          let path:string = arr[j];
          var loadFunc = this.getLoadFunc(path);
          loadFunc.call(this,path,null,(res)=>{
              count++;
              this.onLoadProgress(count/arr.length);
              if(count==arr.length)
                 {
                      this.onLoadFinish();
                      if(callBackFinish)callBackFinish();
                 }
          });
        }
    }
    //获取缓存中的数据
    public getCacheData(url:string):any{
           console.log(url,this._cache.has(url));
           return this._cache.get(url);
    }
    /**
     * 获取缓存的纹理数据
     * @param url 
     */
    public getCacheImage(url:string):HTMLImageElement{
         for(var j = 0;j<this._cacheImage.length;j++)
         {
             var data = this._cacheImage[j];
             if(data.url==url)
             return data.img;
         }
         return null;
    }
    /**
     * 移除CPU端内存中的图片缓存
     * @param url 
     */ 
    public removeImage(url:string):void{
        
        var index = -1;
        var img:HTMLImageElement;
        for(var j = 0;j<this._cacheImage.length;j++)
        {
            var data = this._cacheImage[j];
            if(data.url==url)
            {
               index = j;
               img = data.img;
               break;
            }
        }
        if(index>=0)
        {
            console.log("解除引用");
            this._cacheImage.splice(index,1);
            this.releaseCPUMemoryForImageCache(img);
        }
        else
        {
            console.log("没找到----",img,index);
        }
    }
    /**
     * 
     * @param img 
     * 释放CPU端内存中的图片缓存
     */ 
    public releaseCPUMemoryForImageCache(img:HTMLImageElement):void{
        img.src = "";
        img = null;
    }
    public onLoadProgress(progress:number):void{
         console.log("加载进度---------",progress);
    }
    public onLoadFinish():void{
        console.log("加载完成啦");
    }

}