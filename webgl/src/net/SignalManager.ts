import { PrioritySignal } from "./event/PrioritySignal";
import { Slot } from "./event/Slot";

class SignalManager {
    private _signals: { [key: string]: PrioritySignal };
    constructor() {
        this._signals = {};
    }

    public clear() {
        this._signals = {};
    }

    public add(event: string, listener: Function, priority?: number): Slot {
        return this.registerListener(event, listener, false, priority || 0);
    }

    public addOnce(event: string, listener: Function, priority?: number): Slot {
        return this.registerListener(event, listener, true, priority || 0);
    }

    public registerListener(event: string, listener: Function, once: boolean, priority: number): Slot {
        let signal: PrioritySignal = this._signals[event];
        if (!signal) {
            signal = new PrioritySignal("string", "table");
            this._signals[event] = signal;
        }
        return signal.registerListenerWithPriority(listener, once || false, priority || 0);
    }

    public dispatch(event: string, ...params) {
        let signal: PrioritySignal = this._signals[event];
        if (signal) {
            params = params || [];
            params.unshift(event);
            signal.dispatch.apply(signal, params);
        }
    }
}

export var G_SignalManager = new SignalManager();