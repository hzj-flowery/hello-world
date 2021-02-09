import { G_EffectGfxMgr } from "../../../init";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { Path } from "../../../utils/Path";
import SummaryLoseBase from "./SummaryLoseBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryArenaLose extends SummaryLoseBase {

    private _battleData;
    public init(battleData, callback) {
        this._battleData = battleData;
        super.init(battleData, callback);
    }

    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }

    public onExit() {
        super.onExit();
    }

    private _createItemInfo(index): cc.Node {
        var reward = this._battleData.awards[index - 1];
        let resNode: cc.Node = new cc.Node("resNode");
        cc.resources.load(Path.getPrefab('CommonResourceInfo', 'common'), cc.Prefab, (err, res: cc.Prefab) => {
            if (err != null || !resNode.isValid) {
                return;
            }
            var resInfo = cc.instantiate(res).getComponent(CommonResourceInfo);
            resNode.addChild(resInfo.node);
            resInfo.onLoad();
            resInfo.updateUI(reward.type, reward.value, reward.size);
            resInfo.setTextColorToDTypeColor();
            resInfo.showResName(true);
            for (let _ in this._battleData.addAwards) {
                var v = this._battleData.addAwards[_];
                if (v.award.type == reward.type && v.award.value == reward.value) {
                    resInfo.updateCrit(v.index, v.award.size);
                    break;
                }
            }
        });
        return resNode;
    }

    private _createActionNode(effect): cc.Node {
        if (effect == 'fail_txt_tishengzhanli') {
            return this._createText();
        } else if (effect == 'fail_icon1') {
            return this._createLoseNode(1);
        } else if (effect == 'fail_icon2') {
            return this._createLoseNode(2);
        } else if (effect == 'fail_icon3') {
            return this._createLoseNode(3);
        } else if (effect == 'fail_icon4') {
            return this._createLoseNode(4);
        } else if (effect == 'fail_txt_huode') {
            return this._createText('txt_sys_reward02');
        } else if (effect == 'moving_jwin_huode_1') {
            return this._createItemInfo(1);
        } else if (effect == 'moving_jwin_huode_2') {
            return this._createItemInfo(2);
        } else if (effect == 'shibai') {
            return this._createLosePic();
        }
    }

    private _createAnimation() {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._createContinueNode();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_jfail', effectFunction.bind(this), eventFunction.bind(this), false);
    }
}