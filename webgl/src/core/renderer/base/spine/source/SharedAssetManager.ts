import { Texture } from "./Texture"
export class SharedAssetManager{
public clientAssets:any;
public queuedAssets:any;
public rawAssets:any;
public errors:any;
public pathPrefix:any;

        constructor(pathPrefix){
            if (pathPrefix === void 0) { pathPrefix = ""; }
            this.clientAssets = {};
            this.queuedAssets = {};
            this.rawAssets = {};
            this.errors = {};
            this.pathPrefix = pathPrefix;
        }
        public queueAsset(clientId, textureLoader, path) {
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined) {
                clientAssets = new Assets(clientId);
                this.clientAssets[clientId] = clientAssets;
            }
            if (textureLoader !== null)
                clientAssets.textureLoader = textureLoader;
            clientAssets.toLoad.push(path);
            if (this.queuedAssets[path] === path) {
                return false;
            }
            else {
                this.queuedAssets[path] = path;
                return true;
            }
        };
        public loadText(clientId, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        _this.rawAssets[path] = request.responseText;
                    }
                    else {
                        _this.errors[path] = "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        };
        public loadJson(clientId, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        _this.rawAssets[path] = JSON.parse(request.responseText);
                    }
                    else {
                        _this.errors[path] = "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        };
        public loadTexture(clientId, textureLoader, path) {
            var _this = this;
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, textureLoader, path))
                return;
            var img = new Image();
            img.src = path;
            img.crossOrigin = "anonymous";
            img.onload = function (ev) {
                _this.rawAssets[path] = img;
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
            };
        };
        public get(clientId, path) {
            path = this.pathPrefix + path;
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            return clientAssets.assets[path];
        };
        public updateClientAssets(clientAssets) {
            for (var i = 0; i < clientAssets.toLoad.length; i++) {
                var path = clientAssets.toLoad[i];
                var asset = clientAssets.assets[path];
                if (asset === null || asset === undefined) {
                    var rawAsset = this.rawAssets[path];
                    if (rawAsset === null || rawAsset === undefined)
                        continue;
                    if (rawAsset instanceof HTMLImageElement) {
                        clientAssets.assets[path] = clientAssets.textureLoader(rawAsset);
                    }
                    else {
                        clientAssets.assets[path] = rawAsset;
                    }
                }
            }
        };
        public isLoadingComplete(clientId) {
            var clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            this.updateClientAssets(clientAssets);
            return clientAssets.toLoad.length == clientAssets.loaded();
        };
        public dispose() {
        };
        public hasErrors() {
            return Object.keys(this.errors).length > 0;
        };
        public getErrors() {
            return this.errors;
        };
       
    }
