import { PrioritySignal } from "../utils/event/PrioritySignal";

export class FightSignalManager {
    private _signal: PrioritySignal;

    constructor() {
        this._signal = new PrioritySignal("string");
    }

    private static fightSignalManager;

    public static getFightSignalManager(): FightSignalManager {
        if (this.fightSignalManager == null) {
            this.fightSignalManager = new FightSignalManager();
        }
        return this.fightSignalManager;
    }

    public addListenerHandler(handler: Function) {
        return this._signal.add(handler);
    }

    clear() {
        this._signal.removeAll();
    }

    public dispatchSignal(event, ...params) {
        params = params || [];
        params.unshift(event);
        this._signal.dispatch.apply(this._signal, params);
    }
}