import { Slot } from "./Slot";

export class SlotList {
    public head: Slot;
    public tail: SlotList;
    public nonEmpty: boolean;

    public static NIL = new SlotList(null, null);

    constructor(head: Slot, tail?: SlotList) {
        if (head == null && tail == null) {
            this.nonEmpty = false;
        }
        else if (head == null) {

        }
        else {
            this.head = head;
            this.tail = tail || SlotList.NIL;
            this.nonEmpty = true;
        }
    }

    public getLength() {
        if (!this.nonEmpty) {
            return 0
        }
        if (this.tail == SlotList.NIL) {
            return 1
        }
        let result: number = 0;
        let p: SlotList = this;
        while (p.nonEmpty) {
            result = result + 1
            p = p.tail;
        }
        return result;
    }

    public prepend(slot) {
        return new SlotList(slot, this)
    }

    public append(slot) {
        if (!slot) {
            return this
        }
        if (!this.nonEmpty) {
            return new SlotList(slot)
        }

        if (this.tail == SlotList.NIL) {
            return new SlotList(slot).prepend(this.head)
        }

        let wholeClone = new SlotList(this.head)
        let subClone = wholeClone
        let current = this.tail

        while (current.nonEmpty) {
            let currentClone = new SlotList(current.head)
            subClone.tail = currentClone
            subClone = currentClone
            current = current.tail
        }
        subClone.tail = new SlotList(slot)
        return wholeClone
    }

    public insertWithPriority(slot: Slot) {
        if (!this.nonEmpty) {
            return new SlotList(slot)
        }

        let priority = slot.getPriority()
        if (priority > this.head.getPriority()) {
            return this.prepend(slot)
        }

        let wholeClone = new SlotList(this.head)
        let subClone = wholeClone
        let current = this.tail

        while (current.nonEmpty) {
            if (priority > current.head.getPriority()) {
                subClone.tail = current.prepend(slot)
                return wholeClone
            }
            let currentClone = new SlotList(current.head)
            subClone.tail = currentClone
            subClone = currentClone
            current = current.tail
        }

        subClone.tail = new SlotList(slot)
        return wholeClone
    }

    public filterNot(listener: Function) {
        if (!this.nonEmpty || listener == null) {
            return this
        }

        if (listener == this.head.getListener()) {
            return this.tail
        }

        let wholeClone = new SlotList(this.head)
        let subClone = wholeClone
        let current = this.tail
        while (current.nonEmpty) {
            if (current.head.getListener() == listener) {
                subClone.tail = current.tail
                return wholeClone
            }
            let currentClone = new SlotList(current.head)
            subClone.tail = currentClone
            subClone = currentClone
            current = current.tail
        }
        return this
    }

    public contains(listener) {
        if (!this.nonEmpty) {
            return false
        }
        let p: SlotList = this
        while (p.nonEmpty) {
            if (p.head.getListener() == listener) {
                return true
            }
            p = p.tail
        }

        return false
    }

    public find(listener) {
        if (!this.nonEmpty) {
            return null
        }

        let p: SlotList = this
        while (p.nonEmpty) {
            if (p.head.getListener() == listener) {
                return p.head
            }
            p = p.tail
        }
        return null
    }
}