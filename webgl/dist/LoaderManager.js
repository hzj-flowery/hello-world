"use strict";
/**
 * 加载管理员
 */
Object.defineProperty(exports, "__esModule", { value: true });
var CacheImageData = /** @class */ (function () {
    function CacheImageData(url, img) {
        this.url = "";
        this.url = url;
        this.img = img;
    }
    return CacheImageData;
}());
var LoaderManager = /** @class */ (function () {
    function LoaderManager() {
        this._curImageTask = [];
        this._cacheImage = [];
    }
    Object.defineProperty(LoaderManager, "instance", {
        get: function () {
            if (!this._instance)
                this._instance = new LoaderManager();
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    LoaderManager.prototype.loadImageArrayRes = function (arr, callBackProgress, callBackFinish) {
        this._curImageTask = arr;
        var count = 0;
        for (var j = 0; j < arr.length; j++) {
            var img = new Image();
            img.onload = function (pos, img) {
                if (!img) {
                    console.log("加载的图片路径不存在---", arr[pos]);
                    return;
                }
                this._cacheImage.push(new CacheImageData(arr[pos], img));
                count++;
                this.onLoadProgress(count / arr.length);
                if (count == arr.length) {
                    this.onLoadFinish();
                    if (callBackFinish)
                        callBackFinish();
                }
            }.bind(this, j, img);
            img.src = arr[j];
        }
    };
    /**
     * 获取缓存的纹理数据
     * @param url
     */
    LoaderManager.prototype.getCacheImage = function (url) {
        for (var j = 0; j < this._cacheImage.length; j++) {
            var data = this._cacheImage[j];
            if (data.url == url)
                return data.img;
        }
        return null;
    };
    /**
     * 移除CPU端内存中的图片缓存
     * @param url
     */
    LoaderManager.prototype.removeImage = function (url) {
        var index = -1;
        var img;
        for (var j = 0; j < this._cacheImage.length; j++) {
            var data = this._cacheImage[j];
            if (data.url == url) {
                index = j;
                img = data.img;
                break;
            }
        }
        if (index >= 0) {
            console.log("解除引用");
            this._cacheImage.splice(index, 1);
            this.releaseCPUMemoryForImageCache(img);
        }
        else {
            console.log("没找到----", img, index);
        }
    };
    /**
     *
     * @param img
     * 释放CPU端内存中的图片缓存
     */
    LoaderManager.prototype.releaseCPUMemoryForImageCache = function (img) {
        img.src = "";
        img = null;
    };
    LoaderManager.prototype.onLoadProgress = function (progress) {
        console.log("加载进度---------", progress);
    };
    LoaderManager.prototype.onLoadFinish = function () {
        console.log("加载完成啦");
    };
    return LoaderManager;
}());
exports.default = LoaderManager;
//# sourceMappingURL=LoaderManager.js.map