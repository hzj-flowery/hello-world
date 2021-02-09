import PopupBase from "../../../ui/PopupBase";
import CommonMaterialIcon from "../../../ui/component/CommonMaterialIcon";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { table } from "../../../utils/table";
import { G_ResolutionManager, G_SignalManager, G_AudioManager } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { SignalConst } from "../../../const/SignalConst";
import { AudioConst } from "../../../const/AudioConst";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import TreasureConst from "../../../const/TreasureConst";
import { DataConst } from "../../../const/DataConst";
import CakeGetCreamCell from "../cakeActivity/CakeGetCreamCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureLimitCostPanel extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property(cc.Prefab)
    CommonMaterialIcon:cc.Prefab = null;
    
    _costKey: any;
    _onClick: any;
    _onStep: any;
    _onStart: any;
    _onStop: any;
    _limitLevel: any;
    _fromNode: any;
    _items: any[];
    _itemIds: any[];
    _signalInstrumentLimitLvPutRes: any;
    _signalTreasureLimitLvPutRes: any;
    
    ctor(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode) {
        this._costKey = costKey;
        this._onClick = onClick;
        this._onStep = onStep;
        this._onStart = onStart;
        this._onStop = onStop;
        this._limitLevel = limitLevel;
        this._fromNode = fromNode;
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
        this._items = [];
        this._itemIds = [];
    }
    _initView() {
        var info = TreasureDataHelper.getLimitCostConfig(this._limitLevel);
        var iconNode = this._imageBg.node.getChildByName('iconNode');
        if (this._costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
            var tbPos = {
                1: [
                    46,
                    148
                ],
                2: [
                    110,
                    56
                ],
                3: [
                    225,
                    56
                ],
                4: [
                    290,
                    148
                ]
            };
            for (var i = 1; i<=4; i++) {
                var item = cc.instantiate(this.CommonMaterialIcon).getComponent(CommonMaterialIcon);
                var itemId = DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + i];
                item.node.setScale(0.8);
                item.updateUI(itemId, handler(this, this._onClickIcon), handler(this, this._onStepClickIcon));
                var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
                item.setName(param.name);
                item.setCostCountEveryTime(info['consume_' + this._costKey]);
                item.setStartCallback(handler(this, this._onStartCallback));
                item.setStopCallback(handler(this, this._onStopCallback));
                item.setIsShift(true);
                item.node.name = i.toString();
                item.node.setPosition(cc.v2(tbPos[i][0], tbPos[i][1]));
                iconNode.addChild(item.node);
                table.insert(this._items, item);
                table.insert(this._itemIds, itemId);
            }
        } else {
            var item = cc.instantiate(this.CommonMaterialIcon).getComponent(CommonMaterialIcon);
            var itemId = info['value_' + this._costKey];
            item.node.setScale(0.8);
            item.updateUI(itemId, handler(this, this._onClickIcon), handler(this, this._onStepClickIcon));
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
            item.setName(param.name);
            item.setCostCountEveryTime(info['consume_' + this._costKey]);
            item.setStartCallback(handler(this, this._onStartCallback));
            item.setStopCallback(handler(this, this._onStopCallback));
            item.setIsShift(true);
            item.node.setPosition(cc.v2(170, 53));
            iconNode.addChild(item.node);
            table.insert(this._items, item);
            table.insert(this._itemIds, itemId);
        }
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onClickPanel));
    }
    onEnter() {
        this._signalTreasureLimitLvPutRes = G_SignalManager.add(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, handler(this, this._onTreasureLimitLvPutRes));
        var nodePos = this._fromNode.convertToWorldSpaceAR(cc.v2(0, 0));
        var dstPos = this.node.convertToNodeSpaceAR(cc.v2(nodePos.x, nodePos.y));
        this._imageBg.node.setPosition(dstPos);
    }
    onExit() {
        this._signalTreasureLimitLvPutRes.remove();
        this._signalTreasureLimitLvPutRes = null;
    }
    updateUI() {
        for (let i in this._items) {
            var item = this._items[i];
            item.updateCount();
        }
    }
    _onClickIcon(materials) {
        if (this._onClick) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG);
            this._onClick(this._costKey, materials);
        }
    }
    _onStepClickIcon(itemId, itemValue, costCountEveryTime) {
        if (this._onStep) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG);
            var result = this._onStep(this._costKey, itemId, itemValue, costCountEveryTime);
            let continue1 = result[0];
            var realCostCount = result[1];
            var isDo = result[2];
            return [
                continue1,
                realCostCount,
                isDo
            ];
        }
    }
    _onStartCallback(itemId, count) {
        if (this._onStart) {
            this._onStart(this._costKey, itemId, count);
        }
    }
    _onStopCallback() {
        if (this._onStop) {
            this._onStop();
        }
    }
    _onClickPanel() {
        this.close();
    }
    _onTreasureLimitLvPutRes(eventName, idx) {
        if (this.updateUI) {
            this.updateUI();
        }
    }
    findNodeWithItemId(itemId):cc.Component {
        for (let i in this._itemIds) {
            var id = this._itemIds[i];
            if (id == itemId) {
                return this._items[i];
            }
        }
        return null;
    }
    getCostKey() {
        return this._costKey;
    }
}
