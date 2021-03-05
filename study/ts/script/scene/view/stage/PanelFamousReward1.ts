import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { G_UserData } from "../../../init";
import { ReturnConst } from "../../../const/ReturnConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelFamousReward1 extends cc.Component {

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
        type: CommonResourceInfo,
        visible: true
    })
    _rewardInfo1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _rewardInfo2: CommonResourceInfo = null;

    public updateUI(index, rewards) {
        let POS_Y = [28, 28, 67]
        this._imageRewardTitleBG.y = (POS_Y[index - 1]);
        var pic = Path.getEssenceText(index);
        UIHelper.loadTexture(this._imgTitle, pic);

        if (rewards && rewards.length >= 2) {
            this._rewardInfo1.updateUI(rewards[0].type, rewards[0].value, rewards[0].size);
            this._rewardInfo2.updateUI(rewards[1].type, rewards[1].value, rewards[1].size);
        }
        else if (rewards && rewards.length >= 1) {
            this._rewardInfo1.updateUI(rewards[0].type, rewards[0].value, rewards[0].size);
            this._rewardInfo2.node.active = false;
        }
        else {
            this._rewardInfo1.node.active = false;
            this._rewardInfo2.node.active = false;
        }

        var doubleTips = this._imageRewardTitleBG.getChildByName('Image_Double');
        doubleTips.active = (false);
            var doubleTimes = G_UserData.getReturnData().getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER);
            doubleTips.active = (doubleTimes > 0);
        }
    }
}