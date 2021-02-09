import { G_EffectGfxMgr } from "../../../init";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import { DropHelper } from "../../../utils/DropHelper";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentDrop extends ComponentBase {

    private static ITEM_POS_5 = [
        -200,
        -100,
        0,
        100,
        200
    ];
    private static ITEM_POS_4 = [
        -150,
        -50,
        50,
        150
    ];
    private static ITEM_POS_3 = [
        -100,
        0,
        100
    ];
    private static ITEM_POS_2 = [
        -50,
        50
    ];

    private static ITEM_POS_1 = [0];

    private _drops: any[];
    _isDouble: any;
    public init(drops, position, isDouble?) {
        this.node.setPosition(position);
        this._drops = DropHelper.sortDropList(drops);
        this._isDouble = isDouble;
        super.init();
    }

    public setStart() {
        super.setStart();
        this.play();
    }

    private play() {
        var delay = cc.delayTime(0.1);
        var callFunc = [];
        for (let i = 0; i < this._drops.length; i++) {
            var func = cc.callFunc(function () {
                this._createSingleItem(this._drops[i].type, this._drops[i].value, this._drops[i].size, i + 1);
            }.bind(this));
            callFunc.push(func);
        }
        var endFunc = cc.callFunc(function () {
            this.onFinish();
        }.bind(this));
        if (callFunc.length > 0) {
            var sequence = cc.sequence(callFunc[0], delay, callFunc[1], delay, callFunc[2], delay, callFunc[3], endFunc);
            this.node.runAction(sequence);
        }
        else{
            this.onFinish();
        }
    }

    private _createSingleItem(type, value, size, index) {
        let iconNode: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('CommonIconTemplate', 'common'), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            var icon: CommonIconTemplate = cc.instantiate(res).getComponent(CommonIconTemplate);
            iconNode.addChild(icon.node);
            icon.initUI(type, value, size);
            // icon.node.setScale(0.8);
            icon.node.setScale(1);
            icon.showDoubleTips(this._isDouble);
            icon.setTouchEnabled(false);
        }.bind(this));
        function effectFunction(effect) {
            if (effect == 'win_equip_icon') {
                return iconNode;
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_icon', effectFunction, null, false);
        var dropCount = this._drops.length;
        effect.node.x = (ComponentDrop['ITEM_POS_' + dropCount][index - 1]);
    }
}