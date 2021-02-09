export class BaseService {
    public _start: boolean;
    public _isInModule: boolean;

    constructor() {
        this._start = false;
        this._isInModule = false;
        this.stop();
    }
    public start() {
        this._start = true;
    }
    public stop() {
        this._start = false;
    }
    public isStart() {
        return this._start;
    }
    public tick() {
    }
    public enterModule() {
        this._isInModule = true;
    }
    public exitModule() {
        this._isInModule = false;
    }
    public isInModule() {
        return this._isInModule;
    }
    public clear() {
    }
    public initData() {
    }
}
