import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import { G_UserData } from "../../../init";
import { ReturnConst } from "../../../const/ReturnConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelFamousReward2 extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _imageRewardTitleBG: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgTitle: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _rewardInfo1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _rewardInfo2: CommonIconTemplate = null;

    public updateUI(index, rewards: any[]) {
        let POS_Y = [28, 28, 67]
        this._imageRewardTitleBG.y = (POS_Y[index - 1]);
        var pic = Path.getEssenceText(index);
        UIHelper.loadTexture(this._imgTitle, pic);
        var doubleTimes = G_UserData.getReturnData().getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER);
        if (rewards && rewards.length >= 2) {
            this._rewardInfo1.initUI(rewards[0].type, rewards[0].value, 0);
            this._rewardInfo2.initUI(rewards[1].type, rewards[1].value, 0);
            this._rewardInfo1.showDoubleTips(doubleTimes > 0);
        }
        else if (rewards && rewards.length >= 1) {
            this._rewardInfo1.initUI(rewards[0].type, rewards[0].value, 0);
            this._rewardInfo2.node.active = false;
        }
        else {
            this._rewardInfo1.node.active = false;
            this._rewardInfo2.node.active = false;
        }
    }
}