import { G_EffectGfxMgr } from "../../../init";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentTwoItems extends ComponentBase {

    private _AnimItemList: cc.Node[];
    private _items: any[];
    private _addReward: any[];
    private _showOne: boolean;

    public init(items: any[], addReward: any[], position: cc.Vec2, showOne?: boolean) {
        this.node.setPosition(position);
        this._AnimItemList = [];
        this._items = items;
        this._addReward = addReward;
        this._showOne = showOne;
        super.init();
    }

    public setStart() {
        super.setStart();
        this._playAnim();
        if (this._showOne) {
            this._showOneItem();
        }
    }

    private _playAnim() {

        for (let i = 0; i < 2; i++) {
            var reward = this._items[i];
            var addInfo: any = {};
            for (let i = 0; i < this._addReward.length; i++) {
                var v = this._addReward[i];
                if (v.award.type == reward.type && v.award.value == reward.value) {
                    addInfo.index = v.index;
                    addInfo.size = v.award.size;
                }
            }
            var effect = this._createSingleItem(reward.type, reward.value, reward.size, addInfo.index, addInfo.size);
            this._AnimItemList.push(effect);
        }
        this._AnimItemList[0].x = (-145);
        this._AnimItemList[1].x = (0);
    }

    private _showOneItem() {
        this._AnimItemList[0].x = (0);
        this._AnimItemList[1].active = (false);
    }

    private _createSingleItem(type, value, size, critIndex, critValue): cc.Node {

        let resNode:cc.Node = new cc.Node("CommonResourceInfo");
        var resInfo: CommonResourceInfo;
        cc.resources.load(Path.getPrefab('CommonResourceInfo', 'common'), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            resInfo = cc.instantiate(res).getComponent(CommonResourceInfo);
            resNode.addChild(resInfo.node);
            resInfo.onLoad();
            resInfo.updateUI(type, value, size);
            resInfo.setTextColorToDTypeColor();
            if (critIndex) {
                resInfo.updateCrit(critIndex, critValue);
            }

        }.bind(this));
       
        function effectFunction(effect) {
            if (effect == 'win_exp') {
                return resNode;
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_exp', effectFunction,
            handler(this, this.checkEnd), false);
        return effect.node;
    }
}