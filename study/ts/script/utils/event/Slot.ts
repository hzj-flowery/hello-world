import { OnceSignal } from "./OnceSignal";

export class Slot {
    private _signal: OnceSignal;
    private _listener: Function;
    private _once: boolean;
    private _priority;
    private _enabled: boolean;
    private _params: any[];

    constructor(listener: Function, signal: OnceSignal, once: boolean, priority) {
        this._signal = signal;
        this._listener = listener;
        this._once = once || false;
        this._priority = priority;
        this._enabled = true;
        this._params = [];
    }

    public execute(value) {
        if (!this._enabled) {
            return;
        }
        if (this._once) {
            this.remove();
        }
        if (this._params && this._params.length > 0) {
            this._listener.apply(this._listener, this._params);
        }
        else {
            this._listener.apply(this._listener, value);
        }
    }

    public getListener() {
        return this._listener;
    }

    public setListener(listener: Function) {
        this._listener = listener;
    }

    public getOnce() {
        return this._once;
    }

    public getPriority() {
        return this._priority;
    }

    public setEnable(enable: boolean) {
        this._enabled = enable;
    }

    public getEnable() {
        return this._enabled;
    }

    public setParams(...params) {
        this._params = params;
    }

    public getParams() {
        return this._params;
    }

    public remove() {
        this._signal.remove(this._listener);
    }
}