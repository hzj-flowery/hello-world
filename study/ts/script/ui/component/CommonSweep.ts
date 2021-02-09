const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from './CommonNormalMidPop'
import UIHelper from '../../utils/UIHelper';

@ccclass
export default class CommonSweep extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _popupArenaSweep_2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _baseNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageListBG: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listDrop: cc.ScrollView = null;

    private _direction: number;
    private _itemSumHeight: number = 0;

    onLoad(): void {
        this._listDrop.node.setAnchorPoint(0.5, 0.5);
        this._listDrop.node.setPosition(0, 0);
        this._listDrop.content.setAnchorPoint(0.5, 1);
        this._listDrop.content.setPosition(0, this._listDrop.node.height / 2);
        this._listDrop.content.height = this._listDrop.node.height;
    }
    setTitle(title) {
        this._commonNodeBk.setTitle(title);
    }
    pushItem(item: cc.Node) {
        this._listDrop.content.addChild(item);
        let x: number = (item.anchorX - 0.5) * item.width;
        let y: number = (item.anchorX - 1) * item.height - this._itemSumHeight;
        this._itemSumHeight += item.height;
        item.setPosition(x, y);
        this._listDrop.content.height = Math.max(this._itemSumHeight, this._listDrop.node.height);
        this._listDrop.scrollToBottom(0, false);
    }
    /**
     * 
     * @param item 
     * @param idx //下标从0走
     */
    insertItem(item: cc.Node, idx: number) {
        UIHelper.insertCurstomListContentByPos(this._listDrop.content, item, idx)
    }
    scrollToBottom() {
        this._listDrop.scrollToBottom(0, true);
    }
    setCloseFunc(callback) {
        this._commonNodeBk.addCloseEventListener(callback);
    }
    clearDropList() {
        this._listDrop.content.removeAllChildren();
        this._itemSumHeight = 0;
        // this._listDrop.addScrollViewEventListener(function (sender, eventType) {
        // });
        // this._listDrop.addEventListener(function (sender, eventType) {
        // });
        // if (this._direction == ccui.ListViewDirection.vertical) {
        //     this._listDrop.jumpToTop();
        // } else if (this._direction == ccui.ListViewDirection.horizontal) {
        //     this._listDrop.jumpToLeft();
        // }
    }
    hideCloseBtn() {
        this._commonNodeBk.hideCloseBtn();
    }
    setCloseVisible(v) {
        this._commonNodeBk.setCloseVisible(v);
    }
}

// const { ccclass, property } = cc._decorator;

// import CommonNormalMidPop from './CommonNormalMidPop'
// import UIHelper from '../../utils/UIHelper';

// @ccclass
// export default class CommonSweep extends cc.Component {

//     @property({
//         type: cc.Sprite,
//         visible: true
//     })
//     _popupArenaSweep_2: cc.Sprite = null;

//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _panelBase: cc.Node = null;

//     @property({
//         type: CommonNormalMidPop,
//         visible: true
//     })
//     _commonNodeBk: CommonNormalMidPop = null;

//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _baseNode: cc.Node = null;

//     @property({
//         type: cc.Sprite,
//         visible: true
//     })
//     _imageListBG: cc.Sprite = null;

//     @property({
//         type: cc.ScrollView,
//         visible: true
//     })
//     _listDrop: cc.ScrollView = null;

//     private _direction: number;

//     onLoad(): void {

//     }
//     setTitle(title) {
//         this._commonNodeBk.setTitle(title);
//     }
//     pushItem(item:cc.Node) {
//         UIHelper.updateCurstomListSize(this._listDrop.content, item);
//         this._listDrop.scrollToBottom(0);
//     }
//     /**
//      * 
//      * @param item 
//      * @param idx //下标从0走
//      */
//     insertItem(item: cc.Node, idx: number) {
//         UIHelper.insertCurstomListContentByPos(this._listDrop.content, item, idx)
//     }
//     scrollToBottom() {
//         this._listDrop.scrollToBottom(0, true);
//     }
//     setCloseFunc(callback) {
//         this._commonNodeBk.addCloseEventListener(callback);
//     }
//     clearDropList() {
//         this._listDrop.content.removeAllChildren();
//         // this._listDrop.addScrollViewEventListener(function (sender, eventType) {
//         // });
//         // this._listDrop.addEventListener(function (sender, eventType) {
//         // });
//         // if (this._direction == ccui.ListViewDirection.vertical) {
//         //     this._listDrop.jumpToTop();
//         // } else if (this._direction == ccui.ListViewDirection.horizontal) {
//         //     this._listDrop.jumpToLeft();
//         // }
//     }
//     hideCloseBtn() {
//         this._commonNodeBk.hideCloseBtn();
//     }
//     setCloseVisible(v) {
//         this._commonNodeBk.setCloseVisible(v);
//     }

// }