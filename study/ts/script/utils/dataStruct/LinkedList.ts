export default class LinkedList {
    static node(data) {
        return {
            data: data,
            next: null,
            pre: null
        };
    }
    static test() {
        var list = new LinkedList();
        var a = { id: 1 };
        var b = { id: 2 };
        var c = { id: 3 };
        var d = { id: 4 };
        var e = { id: 5 };
        var nodeA = LinkedList.node(a);
        var nodeB = LinkedList.node(b);
        var nodeC = LinkedList.node(c);
        var nodeD = LinkedList.node(d);
        var nodeE = LinkedList.node(e);
        list.addAtTail(nodeA);
        list.addAtTail(nodeB);
        list.addAtTail(nodeC);
        list.addAtTail(nodeD);
        list.addAtTail(nodeE);
        list.remove(nodeE);
        var walk = function (node, data) {
            console.log(data.id);
        }
        list.walkThrough(walk);
        var firstArrow = list.getFirst();
        while (firstArrow) {
            list.remove(firstArrow);
            firstArrow = list.getFirst();
        }
        var walk1 = function (node, data) {
            console.log(data.id);
        }
        list.walkThrough(walk1);
    }
    private _head;
    private _tail;
    private _count;
    ctor() {
        this._head = null;
        this._tail = null;
        this._count = 0;
    }
    count() {
        return this._count;
    }
    addAtTail(node) {
        var p = this._head;
        if (!p) {
            this._head = node;
            this._tail = node;
            this._count = 1;
        } else {
            node.pre = this._tail;
            this._tail.next = node;
            this._tail = node;
            this._count = this._count + 1;
        }
    }
    addAtHead(node) {
        if (!this._head) {
            this._head = node;
            this._tail = node;
            this._count = 1;
            return;
        }
        this._head.pre = node;
        node.next = this._head;
        this._head = node;
        this._count = this._count + 1;
    }
    addAtIndex(node, index) {
        if (index > this._count) {
            this.addAtTail(node.data);
        } else if (index <= 1) {
            this.addAtHead(node.data);
        } else {
            var i = 1;
            var p = this._head;
            var pre = this._head;
            while (i < index) {
                pre = p;
                p = p.next;
                i = i + 1;
            }
            node.next = p;
            pre.next = node;
            this._count = this._count + 1;
        }
    }
    get(index) {
        var p = this._head;
        if (this._count == 0 || index > this._count || index <= 0) {
            return -1;
        } else {
            var i = 1;
            while (i < index) {
                p = p.next;
                i = i + 1;
            }
            return p.data;
        }
    }
    getFirst() {
        return this._head;
    }
    getLast() {
        return this._tail;
    }
    removeAtIndex(index) {
        if (index > this._count || index <= 0) {
            return -1;
        }
        if (index == 1) {
            this._head = this._head.next;
            this._count = this._count - 1;
            return;
        }
        var p = this._head;
        var pre = this._head;
        var i = 1;
        while (i < index) {
            pre = p;
            p = p.next;
            i = i + 1;
        }
        pre.next = p.next;
        p = null;
        this._count = this._count - 1;
    }
    remove(node) {
        if (this._count == 1) {
            this._head = null;
            this._tail = null;
            this._count = 0;
            return;
        }
        if (!node.next) {
            if (node.pre) {
                node.pre.next = null;
                this._tail = node.pre;
                this._count = this._count - 1;
            }
        } else if (!node.pre) {
            if (node.next) {
                node.next.pre = null;
                this._head = node.next;
                this._count = this._count - 1;
            }
        } else {
            node.pre.next = node.next;
            node.next.pre = node.pre;
            this._count = this._count - 1;
        }
    }
    filter(cond, proc) {
        if (!this._head) {
            return;
        }
        var p = this._head;
        while (p) {
            if (cond(p.data)) {
                proc(p.data);
            }
            p = p.next;
        }
    }
    walkThrough(cb) {
        if (!this._head) {
            return;
        }
        var p = this._head;
        while (p) {
            cb(p, p.data);
            p = p.next;
        }
    }
}