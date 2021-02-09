import { SlotList } from "./SlotList";
import { Slot } from "./Slot";

export class OnceSignal {

    private _valueClasses: any[];
    protected _slots: SlotList;

    constructor(...value) {
        this._valueClasses = value;
        this._slots = SlotList.NIL;
    }

    public getValueClasses() {
        return this._valueClasses;
    }

    public setValueClasses(...value) {
        this._valueClasses = value;
    }

    public getListenersLength() {
        return this._slots.getLength();
    }

    public addOnce(listener): Slot {
        return this.registerListener(listener, true);
    }

    public remove(listener) {
        let slot = this._slots.find(listener);
        if (!slot) {
            return null;
        }
        this._slots = this._slots.filterNot(listener);
        return slot;
    }

    public removeAll() {
        this._slots = SlotList.NIL;
    }

    public dispatch(...value) {
        let slotsToProcess = this._slots;
        if (slotsToProcess.nonEmpty) {
            while (slotsToProcess.nonEmpty) {
                slotsToProcess.head.execute(value);
                slotsToProcess = slotsToProcess.tail;
            }
        }
    }

    public registerListener(listener, once?: boolean): Slot {
        let newSlot = new Slot(listener, this, once || false, null);
        this._slots = this._slots.prepend(newSlot);
        return newSlot;
    }
}