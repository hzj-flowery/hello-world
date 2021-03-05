import { assert } from "./GlobleFunc";

var newQueueNode = function (value) {
    return {
        value: value,
        next: null,
        last: null
    };
}
export default class Queue {
    private _capacity: number;
    private _size: number;
    private _head;
    private _end;
    private _options;
    constructor(capacity?, options?) {
        this._capacity = capacity;
        if (capacity) {
            assert(capacity > 0, ' capacity must > 0 ');
        }
        this._size = 0;
        this._head = null;
        this._end = null;
        this._options = options;
    }
    _checkCapacity() {
        if (this._capacity && this._size >= this._capacity) {
            if (this._options && this._options.notReplace) {
                return true;
            } else {
                this.pop();
            }
        }
        return false;
    }
    push(data) {
        if (this._checkCapacity()) {
            return;
        }
        var queueNode = newQueueNode(data);
        if (!this._end) {
            this._head = queueNode;
            this._end = queueNode;
            this._size = 1;
        } else {
            this._end.next = queueNode;
            queueNode.last = this._end;
            this._end = queueNode;
            this._size = this._size + 1;
        }
        return true;
    }
    insert(index, data) {
        if (this._checkCapacity()) {
            return;
        }
        if (index > this._size) {
            return this.push(data);
        }
        var queueNode = newQueueNode(data);
        if (!this._end) {
            this._head = queueNode;
            this._end = queueNode;
            this._size = 1;
        } else {
            if (index == 1) {
                this._head.last = queueNode;
                queueNode.next = this._head;
                this._head = queueNode;
                this._size = this._size + 1;
            } else {
                var count = 2;
                var last = null;
                var temp = this._head.next;
                while (temp) {
                    if (count == index) {
                        var last = temp.last;
                        assert(last != null, 'last is nil');
                        last.next = queueNode;
                        queueNode.last = last;
                        queueNode.next = temp;
                        temp.last = queueNode;
                        this._size = this._size + 1;
                        break;
                    }
                    count = count + 1;
                    temp = temp.next;
                }
            }
        }
        return true;
    }
    pop() {
        if (this._head) {
            var tHead = this._head;
            this._head = tHead.next;
            this._size = this._size - 1;
            if (!this._head) {
                this._end = null;
            } else {
                this._head.last = null;
            }
            return tHead.value;
        }
        return null;
    }
    stack() {
        if (this._end) {
            var t = this._end;
            this._end = this._end.last;
            this._size = this._size - 1;
            if (!this._end) {
                this._head = null;
            } else {
                this._end.next = null;
            }
            return t.value;
        }
        return null;
    }
    size() {
        return this._size;
    }
    clear() {
        this._size = 0;
        this._head = null;
        this._end = null;
    }
    foreach(callback) {
        var t = this._head;
        while (t) {
            var isBreak = callback(t.value);
            if (isBreak) {
                break;
            }
            t = t.next;
        }
    }
    getValueByIndex(i) {
        var count = 1;
        var t = this._head;
        while (t) {
            if (count == i) {
                return t.value;
            }
            t = t.next;
            count = count + 1;
        }
    }
    setValueByIndex(i, value) {
        var count = 1;
        var t = this._head;
        while (t) {
            if (count == i) {
                t.value = value;
                return;
            }
            t = t.next;
            count = count + 1;
        }
    }
    removeValueByIndex(i) {
        if (i == 1) {
            return this.pop();
        } else if (i == this._size) {
            return this.stack();
        }
        var count = 2;
        var t = this._head.next;
        while (t) {
            if (count == i) {
                var lastNode = t.last;
                var nextNode = t.next;
                lastNode.next = nextNode;
                nextNode.last = lastNode;
                this._size = this._size - 1;
                return;
            }
            t = t.next;
            count = count + 1;
        }
    }
}