import HeroGoldHelper from "../heroGoldTrain/HeroGoldHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_ResolutionManager, G_UserData, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import PopupCommonLimitCost from "../../../ui/PopupCommonLimitCost";
import { HeroData } from "../../../data/HeroData";
import { DataConst } from "../../../const/DataConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { SignalConst } from "../../../const/SignalConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroLimitCostPanel extends PopupCommonLimitCost {
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

    private _signalHeroLimitLvPutRes: any;
    _baseId: any;
    _limitRed: any;
    onLoad(): void {
        this.setNode(this._imageBg.node);
        super.onLoad();
    }

    public setInitData(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode, otherInfo?): void {
        super.setInitData(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode);
        this._baseId = otherInfo.baseId;
        this._limitRed = otherInfo.limitRed;
    }
    _initView() {
        var info = HeroDataHelper.getHeroLimitCostConfig(this._limitLevel, this._limitRed);
        var tbPos = {};
        tbPos[1] = {
            [1]: [
                170,
                53
            ]
        };
        tbPos[2] = {
            [1]: [
                110,
                56
            ],
            [2]: [
                225,
                56
            ]
        };
        tbPos[3] = {
            [1]: [
                80,
                85
            ],
            [2]: [
                170,
                53
            ],
            [3]: [
                260,
                85
            ]
        };
        tbPos[4] = {
            [1]: [
                46,
                148
            ],
            [2]: [
                110,
                56
            ],
            [3]: [
                225,
                56
            ],
            [4]: [
                290,
                148
            ]
        };
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            for (var i = 1; i <= 4; i++) {
                var item = this._createMaterialIcon(DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i], info['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
                item.setPosition(new cc.Vec2(tbPos[4][i][0] - this._imageBg.node.getContentSize().width / 2, tbPos[4][i][1] - this._imageBg.node.getContentSize().width / 2));
            }
        } else {
            var configKey = HeroDataHelper.getLimitCostConfigKey(this._costKey);
            var type = info[configKey.type];
            var value = info[configKey.value];
            var consume = info[configKey.consume];
            if (type == 99) {
                if (value == 1) {
                    var id = this._baseId;
                    this._createMaterialIcon(id, consume, TypeConvertHelper.TYPE_HERO);
                } else {
                    var id = this._baseId;
                    var list = HeroDataHelper.getSameCountryHeroes(id, 7);
                    var num = list.length;
                    for (var i = 1; i <= num; i++) {
                        var item = this._createMaterialIcon(list[i -1], consume, TypeConvertHelper.TYPE_HERO);
                        item.setPosition(cc.v2(tbPos[num][i][0] - this._imageBg.node.getContentSize().width / 2, tbPos[num][i][1] - this._imageBg.node.getContentSize().width / 2));
                    }
                }
            } else {
                this._createMaterialIcon(value, consume, TypeConvertHelper.TYPE_ITEM);
            }

            // var item = this._createMaterialIcon(info['value_' + this._costKey], info['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
            // item.setPosition(0, -this._imageBg.node.getContentSize().height / 2)
        }
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onClickPanel, this);
    }
    onEnter() {
        super.onEnter();
        this._signalHeroLimitLvPutRes = G_SignalManager.add(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES, handler(this, this._onHeroLimitLvPutRes));
        var nodePos = this._fromNode.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        var dstPos = this.node.convertToNodeSpaceAR(new cc.Vec2(nodePos.x, nodePos.y));
        this._imageBg.node.setPosition(dstPos);
    }
    onExit() {
        super.onExit();
        this._signalHeroLimitLvPutRes.remove();
        this._signalHeroLimitLvPutRes = null;
    }
    _onHeroLimitLvPutRes(eventName, costKey) {
        if (this.updateUI) {
            this.updateUI();
        }
    }
    turnDown() {
        var list = [];
        list.push(this.node);
        for (var _ in this._items) {
            var item = this._items[_];
            list.push(item.node);
        }
        var node = this._imageBg.node.getChildByName('TextTip');
        list.push(node);
        for (var i in list) {
            var v = list[i];
            v.scaleY = -v.scaleY;
        }
    }
}