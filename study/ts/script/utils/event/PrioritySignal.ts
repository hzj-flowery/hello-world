import { Signal } from "./Signal";
import { Slot } from "./Slot";

export class PrioritySignal extends Signal {
    constructor(...value) {
        super(value);
    }

    public addWithPriority(listener: Function, priority?: number): Slot {
        return this.registerListenerWithPriority(listener, false, priority || 0)
    }

    public addOnceWithPriority(listener: Function, priority?: number): Slot {
        return this.registerListenerWithPriority(listener, true, priority || 0)
    }

    public registerListener(listener: Function, once?: boolean): Slot {
        return this.registerListenerWithPriority(listener, once || false);
    }

    public registerListenerWithPriority(listener: Function, once, priority?: number): Slot {
        let slot = new Slot(listener, this, once || false, priority || 0)
        this._slots = this._slots.insertWithPriority(slot);
        return slot;
    }
}