export class AssetManager {
    public assets:any;
    public errors:any;
    public toLoad:number;
    public loaded:number;
    public textureLoader:any;
    public pathPrefix:string;
    constructor(textureLoader, pathPrefix) {
        if (pathPrefix === void 0) { pathPrefix = ""; }
        this.assets = {};
        this.errors = {};
        this.toLoad = 0;
        this.loaded = 0;
        this.textureLoader = textureLoader;
        this.pathPrefix = pathPrefix;
    }
    static downloadText = function (url, success, error) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            if (request.status == 200) {
                success(request.responseText);
            }
            else {
                error(request.status, request.responseText);
            }
        };
        request.onerror = function () {
            error(request.status, request.responseText);
        };
        request.send();
    };
    static downloadBinary = function (url, success, error) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            if (request.status == 200) {
                success(new Uint8Array(request.response));
            }
            else {
                error(request.status, request.responseText);
            }
        };
        request.onerror = function () {
            error(request.status, request.responseText);
        };
        request.send();
    };
    public loadBinary(path, success, error) {
        var _this = this;
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        path = this.pathPrefix + path;
        this.toLoad++;
        AssetManager.downloadBinary(path, function (data) {
            _this.assets[path] = data;
            if (success)
                success(path, data);
            _this.toLoad--;
            _this.loaded++;
        }, function (state, responseText) {
            _this.errors[path] = "Couldn't load binary " + path + ": status " + status + ", " + responseText;
            if (error)
                error(path, "Couldn't load binary " + path + ": status " + status + ", " + responseText);
            _this.toLoad--;
            _this.loaded++;
        });
    };
    public loadText(path, success, error) {
        var _this = this;
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        path = this.pathPrefix + path;
        this.toLoad++;
        AssetManager.downloadText(path, function (data) {
            _this.assets[path] = data;
            if (success)
                success(path, data);
            _this.toLoad--;
            _this.loaded++;
        }, function (state, responseText) {
            _this.errors[path] = "Couldn't load text " + path + ": status " + status + ", " + responseText;
            if (error)
                error(path, "Couldn't load text " + path + ": status " + status + ", " + responseText);
            _this.toLoad--;
            _this.loaded++;
        });
    };
    public loadTexture(path, success, error) {
        var _this = this;
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        path = this.pathPrefix + path;
        this.toLoad++;
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function (ev) {
            var texture = _this.textureLoader(img);
            _this.assets[path] = texture;
            _this.toLoad--;
            _this.loaded++;
            if (success)
                success(path, img);
        };
        img.onerror = function (ev) {
            _this.errors[path] = "Couldn't load image " + path;
            _this.toLoad--;
            _this.loaded++;
            if (error)
                error(path, "Couldn't load image " + path);
        };
        img.src = path;
    };
    public loadTextureData(path, data, success, error) {
        var _this = this;
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        path = this.pathPrefix + path;
        this.toLoad++;
        var img = new Image();
        img.onload = function (ev) {
            var texture = _this.textureLoader(img);
            _this.assets[path] = texture;
            _this.toLoad--;
            _this.loaded++;
            if (success)
                success(path, img);
        };
        img.onerror = function (ev) {
            _this.errors[path] = "Couldn't load image " + path;
            _this.toLoad--;
            _this.loaded++;
            if (error)
                error(path, "Couldn't load image " + path);
        };
        img.src = data;
    };
    public loadTextureAtlas(path, success, error) {
        var _this = this;
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        var parent = path.lastIndexOf("/") >= 0 ? path.substring(0, path.lastIndexOf("/")) : "";
        path = this.pathPrefix + path;
        this.toLoad++;
        AssetManager.downloadText(path, function (atlasData) {
            var pagesLoaded = { count: 0 };
            var atlasPages = new Array();
            try {
                var atlas = new spine.TextureAtlas(atlasData, function (path) {
                    atlasPages.push(parent + "/" + path);
                    var image = document.createElement("img");
                    image.width = 16;
                    image.height = 16;
                    return new spine.FakeTexture(image);
                });
            }
            catch (e) {
                var ex = e;
                _this.errors[path] = "Couldn't load texture atlas " + path + ": " + ex.message;
                if (error)
                    error(path, "Couldn't load texture atlas " + path + ": " + ex.message);
                _this.toLoad--;
                _this.loaded++;
                return;
            }
            var _loop_1 = function (atlasPage) {
                var pageLoadError = false;
                _this.loadTexture(atlasPage, function (imagePath, image) {
                    pagesLoaded.count++;
                    if (pagesLoaded.count == atlasPages.length) {
                        if (!pageLoadError) {
                            try {
                                var atlas = new spine.TextureAtlas(atlasData, function (path) {
                                    return _this.get(parent + "/" + path);
                                });
                                _this.assets[path] = atlas;
                                if (success)
                                    success(path, atlas);
                                _this.toLoad--;
                                _this.loaded++;
                            }
                            catch (e) {
                                var ex = e;
                                _this.errors[path] = "Couldn't load texture atlas " + path + ": " + ex.message;
                                if (error)
                                    error(path, "Couldn't load texture atlas " + path + ": " + ex.message);
                                _this.toLoad--;
                                _this.loaded++;
                            }
                        }
                        else {
                            _this.errors[path] = "Couldn't load texture atlas page " + imagePath + "} of atlas " + path;
                            if (error)
                                error(path, "Couldn't load texture atlas page " + imagePath + " of atlas " + path);
                            _this.toLoad--;
                            _this.loaded++;
                        }
                    }
                }, function (imagePath, errorMessage) {
                    pageLoadError = true;
                    pagesLoaded.count++;
                    if (pagesLoaded.count == atlasPages.length) {
                        _this.errors[path] = "Couldn't load texture atlas page " + imagePath + "} of atlas " + path;
                        if (error)
                            error(path, "Couldn't load texture atlas page " + imagePath + " of atlas " + path);
                        _this.toLoad--;
                        _this.loaded++;
                    }
                });
            };
            for (var _i = 0, atlasPages_1 = atlasPages; _i < atlasPages_1.length; _i++) {
                var atlasPage = atlasPages_1[_i];
                _loop_1(atlasPage);
            }
        }, function (state, responseText) {
            _this.errors[path] = "Couldn't load texture atlas " + path + ": status " + status + ", " + responseText;
            if (error)
                error(path, "Couldn't load texture atlas " + path + ": status " + status + ", " + responseText);
            _this.toLoad--;
            _this.loaded++;
        });
    };
    public get(path) {
        path = this.pathPrefix + path;
        return this.assets[path];
    };
    public remove(path) {
        path = this.pathPrefix + path;
        var asset = this.assets[path];
        if (asset.dispose)
            asset.dispose();
        this.assets[path] = null;
    };
    public removeAll() {
        for (var key in this.assets) {
            var asset = this.assets[key];
            if (asset.dispose)
                asset.dispose();
        }
        this.assets = {};
    };
    public isLoadingComplete() {
        return this.toLoad == 0;
    };
    public getToLoad() {
        return this.toLoad;
    };
    public getLoaded() {
        return this.loaded;
    };
    public dispose() {
        this.removeAll();
    };
    public hasErrors() {
        return Object.keys(this.errors).length > 0;
    };
    public getErrors() {
        return this.errors;
    };
}