import { AudioConst } from "../const/AudioConst";
import { G_AudioManager, G_UserData } from "../init";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { handler } from "../utils/handler";
import { Path } from "../utils/Path";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import CommonMaterialIcon from "./component/CommonMaterialIcon";
import PopupBase from "./PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass

export default class PopupCommonLimitCost extends PopupBase {
    @property({type: cc.Prefab,visible: true})
    _commonMaterialIcon: cc.Prefab = null;

    protected _items: Array<CommonMaterialIcon>;
    private _itemIds: Array<any>;
    protected _costKey;
    private _imageBgNode: cc.Node;
    protected _fromNode: cc.Node;
    private _onClick;
    private _onStep;
    private _onStart;
    private _onStop;
    protected _limitLevel;
    //设置初始化数据
    public setInitData(costKey,onClick, onStep, onStart, onStop, limitLevel, fromNode:cc.Node):void{
        this._costKey = costKey;
        this._onClick = onClick;
        this._onStep = onStep;
        this._onStart = onStart;
        this._onStop = onStop;
        this._limitLevel = limitLevel;
        this._fromNode = fromNode;
        this._commonMaterialIcon =  this._commonMaterialIcon || cc.resources.get(Path.getPrefab("CommonMaterialIcon","common"));
        if(this.signal==null)
        this.signal = new PrioritySignal('string');
        
    }
    protected setNode(imageBg:cc.Node):void{
        this._imageBgNode = imageBg;
    }
    onCreate() {
        this._initData();
        
    }
    _initData() {
        this._items = [];
        this._itemIds = [];
    }
    _initView() {
    }
    //创建材料图片
    _createMaterialIcon(itemId:number, costCount:number, itemType:number): cc.Node {
        var item = cc.instantiate(this._commonMaterialIcon) as cc.Node;
        this._imageBgNode.addChild(item);
        var cmi = item.getComponent(CommonMaterialIcon) as CommonMaterialIcon;
        item.setScale(0.8);
        cmi.setType(itemType);
        cmi.updateUI(itemId, handler(this, this._onClickIcon), handler(this, this._onStepClickIcon));
        var param = TypeConvertHelper.convert(itemType, itemId);
        cmi.setName(param.name);
        cmi.setCostCountEveryTime(costCount);
        cmi.setStartCallback(handler(this, this._onStartCallback));
        cmi.setStopCallback(handler(this, this._onStopCallback));
        cmi.setIsShift(true);
        item.setPosition(new cc.Vec2(0, -118));
        this._items.push(cmi);
        this._itemIds.push(itemId);
        return item;
    }
    onEnter() {
        this._initView();
        var nodePos = this._fromNode.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        var dstPos = this.node.convertToNodeSpaceAR(new cc.Vec2(nodePos.x, nodePos.y));
        this._imageBgNode.setPosition(dstPos);
        this.updateUI();
    }
    onExit() {
    }
    //更新UI显示
    updateUI() {
        cc.warn('PopupCommonLimitCost:updateUI');
        for (var i in this._items) {
            var item = this._items[i];
            this.fitterItemCount(item, this._itemIds[i]);
        }
    }
    //更新道具数量
    protected fitterItemCount(item, itemId) {
        var type = item.getType();
        var count = null;
        if (type == TypeConvertHelper.TYPE_HERO) {
            var list = G_UserData.getHero().getSameCardCountWithBaseId(itemId);
            count = list.length;
        }
        item.updateCount(count);
    }
    _onClickIcon(materials) {
        if (this["_onClick"] && (typeof (this["_onClick"]) == "function")) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG);
            this["_onClick"](this._costKey, materials);
        }
    }
    _onStepClickIcon(itemId, itemValue, costCountEveryTime) {
        if (this["_onStep"] && (typeof (this["_onStep"]) == "function")) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG);
            return this["_onStep"](this._costKey, itemId, itemValue, costCountEveryTime);
        }
    }
    _onStartCallback(itemId, count) {
        if (this["_onStart"] && (typeof (this["_onStart"]) == "function")) {
            this["_onStart"](this._costKey, itemId, count);
        }
    }
    _onStopCallback() {
        if (this["_onStop"] && (typeof (this["_onStop"]) == "function")) {
            this["_onStop"]();
        }
    }
    _onClickPanel() {
        this.close();
    }
    //通过道具id查找它的材料实例
    findNodeWithItemId(itemId):CommonMaterialIcon {
        for (var i in this._itemIds) {
            var id = this._itemIds[i];
            if (id == itemId) {
                return this._items[i];
            }
        }
        return null;
    }
    //获取消费的key 
    getCostKey() {
        return this._costKey;
    }
}