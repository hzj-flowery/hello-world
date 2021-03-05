export default class AvatarState {

    private _name;
    private _handlerWillEnter;
    private _handlerWillExit;
    private _handlerDidEnter;
    private _handlerDidExit;
    private _handlerUpdate;
    private _canForceStop;
    
    constructor(name, willEnter?, willExit?, didEnter?, didExit?, canForceStop?) {
        this._name = name;
        this._handlerWillEnter = willEnter;
        this._handlerWillExit = willExit;
        this._handlerDidEnter = didEnter;
        this._handlerDidExit = didExit;
        this._handlerUpdate = null;
        this._canForceStop = canForceStop || true;
    }

    public setUpdate(update) {
        this._handlerUpdate = update;
    }

    public setCanForceStop(canForceStop) {
        this._canForceStop = canForceStop;
    }

    public onWillEnter() {
        if (this._handlerWillEnter) {
            this._handlerWillEnter(this._name);
        }
    }

    public onWillExit() {
        if (this._handlerWillExit) {
            this._handlerWillExit(this._name);
        }
    }

    public onDidEnter() {
        if (this._handlerDidEnter) {
            this._handlerDidEnter(this._name);
        }
    }

    public onDidExit() {
        if (this._handlerDidExit) {
            this._handlerDidExit(this._name);
        }
    }

    public setWillEnter(willEnter) {
        this._handlerWillEnter = willEnter;
    }

    public setWillExit(willExit) {
        this._handlerWillExit = willExit;
    }

    public setDidEnter(didEnter) {
        this._handlerDidEnter = didEnter;
    }

    public setDidExit(didExit) {
        this._handlerDidExit = didExit;
    }

    public canForceStop() {
        return this._canForceStop;
    }

    public getName() {
        return this._name;
    }

    public update(f) {
        if (this._handlerUpdate) {
            this._handlerUpdate(f);
        }
    }
}