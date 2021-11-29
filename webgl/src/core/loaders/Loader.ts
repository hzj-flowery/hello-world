import { LoadingManager } from "./LoadingManager";


export class Loader {

    public crossOrigin: string;
    public withCredentials: boolean;
    public path: string;
    public resourcePath: string;
    public requestHeader: object;
    public manager: LoadingManager;

    constructor(manager) {

        this.manager = (manager !== undefined) ? manager : new LoadingManager();

        this.crossOrigin = 'anonymous';
        this.withCredentials = false;
        this.path = '';
        this.resourcePath = '';
        this.requestHeader = {};

    }

    load(url, onLoad, onProgress, onError) { }

    loadAsync(url, onProgress) {

        const scope = this;

        return new Promise(function (resolve, reject) {

            scope.load(url, resolve, onProgress, reject);

        });

    }

    parse( /* data */) { }

    setCrossOrigin(crossOrigin) {

        this.crossOrigin = crossOrigin;
        return this;

    }

    setWithCredentials(value) {

        this.withCredentials = value;
        return this;

    }

    setPath(path) {

        this.path = path;
        return this;

    }

    setResourcePath(resourcePath) {

        this.resourcePath = resourcePath;
        return this;

    }

    setRequestHeader(requestHeader) {

        this.requestHeader = requestHeader;
        return this;

    }

}
