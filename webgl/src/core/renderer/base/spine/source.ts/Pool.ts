export class Pool {
    public items: Array<any>;
    public instantiator: any;
    constructor(instantiator) {
        this.items = new Array();
        this.instantiator = instantiator;
    }
    public obtain() {
        return this.items.length > 0 ? this.items.pop() : this.instantiator();
    };
    public free(item) {
        if (item.reset)
            item.reset();
        this.items.push(item);
    };
    public freeAll(items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].reset)
                items[i].reset();
            this.items[i] = items[i];
        }
    };
    public clear() {
        this.items.length = 0;
    };
}