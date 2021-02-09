import CommonListItem from "./CommonListItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonListView extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    itemTemplate: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    scrollView: cc.ScrollView = null;
    @property
    spawnCount = 0; // how many items we actually spawn
    @property
    totalCount = 0; // how many items we need for the whole list
    @property
    spacing = 0; // space between each item
    @property
    bufferZone = 0;

    private updateTimer: number = 0;
    private updateInterval: number = 0.1;
    private lastContentPosY = 0;

    private _clickCallBack: any;


    private _oringinalContentY: number;
    private content: cc.Node;
    private _itemWidth: number;
    private _itemSize: cc.Size;
    private items: cc.Node[] = [];
    private _type = -1;
    private _updateFunc: (item, index, type) => {};
    private _hasLoaded: boolean = false;
    private _isResetEnd:boolean = true;

    public isHasLoaded():boolean{
        return this._hasLoaded&&this._itemSize!=null;
    }
    onLoad() {
        if (!this._hasLoaded) {
            this._hasLoaded = true;
            this.content = this.scrollView.content;
            this.lastContentPosY = this._oringinalContentY = this.content.y;

            if (this.bufferZone == 0) {
                this.bufferZone = this.content.parent.height;
            }
            if (this.itemTemplate) {
                //   this.init();
                this.itemTemplate.active = false;
            }
        }
    }

    init(itemTemplate?, updateFunc?, clickCallBack?, customCallBack?) {
        this.onLoad();
        this.content = this.content || this.scrollView.content;
        this.items = [];
        this.content.removeAllChildren();
        if (itemTemplate) {
            this.itemTemplate = cc.instantiate(itemTemplate);
            // this.content.addChild(this.itemTemplate);
        }
        this._updateFunc = updateFunc;
        this._clickCallBack = clickCallBack;

        this._itemSize = this.itemTemplate.getChildByName('_resourceNode').getContentSize();
        // this.itemTemplate.parent = this.content;
        // this.itemTemplate.setPosition(0, -this._itemSize.height - this.spacing);
        // this.itemTemplate.getComponent(CommonListItem).initItem(0, clickCallBack);
        // this.items.push(this.itemTemplate);
        // for (let i = 1; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
        //     let item = cc.instantiate(this.itemTemplate);
        //     this.content.addChild(item);
        //     item.setPosition(0, -this._itemSize.height * (1 + i) - this.spacing * (i + 1));
        //     item.getComponent(CommonListItem).initItem(i, clickCallBack);
        //     this.items.push(item);
        // }
       
        
    }

    initWithParam(param: any) {
        this.init(param.template, param.updateFunc, param.touchFunc);
    }

    public set updateFunc(value) {
        this._updateFunc = value;
    }

    public get updateFunc() {
        return this._updateFunc;
    }

    public setData(totalCount, type: number = 0, reset: boolean = false, delay:boolean = true) {
        this._type = type;
        this.totalCount = totalCount;
        this.content.height = (this.totalCount) * (this._itemSize.height + this.spacing) + this.spacing; // get total content height
        this.content.height = Math.max(this.content.height, this.content.parent.height);
        delay = reset && delay;
        if (reset) {
            this.reset(delay);
        } else {
            this.refreshItems();
        }
    }

    public resize(totalCount, type: number = 0) {
        this.setData(totalCount, type);
    }

    reset(delay:boolean = false) {
        this.lastContentPosY = this.content.y = this._oringinalContentY;
        this._isResetEnd = false;
        this.scrollView.stopAutoScroll();
        this.scheduleOnce(()=>{
            this._isResetEnd = true;
        })
        let cnt = Math.min(this.spawnCount, this.totalCount);
        for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
            var delayTime = delay ? i * 0.05 : 0;
            this.scheduleOnce(() => {
                let item = this.items[i];
                if (!item && i < this.totalCount) {
                    item = cc.instantiate(this.itemTemplate);
                    this.content.addChild(item);
                    item.setPosition(0, -this._itemSize.height * (1 + i) - this.spacing * (i + 1));
                    item.getComponent(CommonListItem).initItem(i, this._clickCallBack);
                    this.items.push(item);
                }
                if (item) {
                    item.setPosition(0, -this._itemSize.height * (1 + i) - this.spacing * (i + 1));
                    this._updateFunc && this._updateFunc(item.getComponent(CommonListItem), i, this._type);
                }
            }, delayTime);
        }
    }

    getPositionInView(item) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    update(dt) {
        if (!this._hasLoaded || !this._itemSize) {
            return;
        }
        if(!this._isResetEnd)
        return;
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return; // we don't need to do the math every frame
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this.bufferZone;
        let isScrolling = this.content.y != this.lastContentPosY;
        if (!isScrolling) {
            return;
        }
        let isDown = this.content.y < this.lastContentPosY; // scrolling direction
        let offset = (this._itemSize.height + this.spacing) * this.spawnCount;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y - this.bufferZone < -offset) {
                    items[i].y = items[i].y + offset;
                    let item = items[i].getComponent(CommonListItem);
                    let itemId = item.itemID - items.length; // update item id
                    this._updateFunc && this._updateFunc(item, itemId, this._type);
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y + this._itemSize.height > offset) {
                    items[i].y = items[i].y - offset;
                    let item = items[i].getComponent(CommonListItem);
                    let itemId = item.itemID + items.length;
                    this._updateFunc && this._updateFunc(item, itemId, this._type);
                }
            }
        }
        this.lastContentPosY = this.scrollView.content.y;
    }
    refreshItems() {
        for (let i = 0; i < this.spawnCount; ++i) {
            let item = this.items[i];
            if (!item && i < this.totalCount) {
                item = cc.instantiate(this.itemTemplate);
                this.content.addChild(item);
                item.setPosition(0, -this._itemSize.height * (1 + i) - this.spacing * (i + 1));
                item.getComponent(CommonListItem).initItem(i, this._clickCallBack);
                this.items.push(item);
            }
            if (item) {
                var itemComp = item.getComponent(CommonListItem);
                this._updateFunc && this._updateFunc(itemComp, itemComp.itemID, this._type);
                if (i == 0 && item.active == false) {
                    this.reset();
                    break;
                }
            }
        }
    }

    moveBottomItemToTop() {
        let offset = (this._itemSize.height + this.spacing) * this.items.length;
        let length = this.items.length;
        let item = this.getItemAtBottom();
        // whether need to move to top
        if (item.y + offset < 0) {
            item.y = item.y + offset;
            let itemComp = item.getComponent(CommonListItem);
            let itemId = itemComp.itemID - length;
            this._updateFunc && this._updateFunc(item, itemId, this._type);
        }
    }

    getItemAtBottom() {
        let item = this.items[0];
        for (let i = 1; i < this.items.length; ++i) {
            if (item.y > this.items[i].y) {
                item = this.items[i];
            }
        }
        return item;
    }

    scrollToFixedPosition() {
        this.scrollView.scrollToOffset(cc.v2(0, 500), 2);
    }
    removeAllItem() {
        this.items = [];
        this.scrollView.content.removeAllChildren();
    }
}
