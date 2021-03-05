const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { handler } from '../../../utils/handler';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { TextHelper } from '../../../utils/TextHelper';

@ccclass
export default class PopupHurtRewardCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBG: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon: CommonIconTemplate = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnGet: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHurtNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGot: cc.Sprite = null;

    private static HURT_SCALE_SIZE = 10000;
    private _rewardData;
    onLoad() {
        var size = this._nodeBG.getContentSize();
        this.node.setContentSize(size);
        // this._btnGet.addClickEventListenerExDelay(handler(this, this._onGetClick), 100);
        this._btnGet.addClickEventListenerEx(handler(this, this._onGetClick));
    }

    public updateUI(rewardData) {
        this._rewardData = rewardData;
        var showBtnGet = true;
        if (G_UserData.getSiegeData().isHurtRewardGet(this._rewardData.id)) {
            showBtnGet = false;
        }
        this._btnGet.setVisible(showBtnGet);
        this._btnGet.setString(Lang.get('siege_reward_get'));
        this._imageGot.node.active = (!showBtnGet);
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(this._rewardData.award_type, this._rewardData.award_value, this._rewardData.award_size);
        var item = TypeConvertHelper.convert(this._rewardData.award_type, this._rewardData.award_value, this._rewardData.award_size);
        this._textItemName.string = (item.name);
        this._textItemName.node.color = (item.icon_color);
        var targetHurt = this._rewardData.target_size * PopupHurtRewardCell.HURT_SCALE_SIZE;
        var targetHurtStr = TextHelper.getAmountText2(targetHurt);
        this._textHurtNum.string = (targetHurtStr);
        var totalDamage = G_UserData.getSiegeData().getTotal_hurt();
        if (totalDamage < targetHurt) {
            this._btnGet.setEnabled(false);
            this._btnGet.setString(Lang.get('siege_reward_not_reach'));
        } else {
            this._btnGet.setEnabled(true);
        }
    }
    _onGetClick(sender) {

        if (G_UserData.getSiegeData().isExpired()) {
            G_UserData.getSiegeData().refreshRebelArmy();
            return;
        }
        G_UserData.getSiegeData().c2sRebArmyHurtReward(this._rewardData.id);
    }
}