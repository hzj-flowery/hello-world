import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonRewardListNode from "../../../ui/component/CommonRewardListNode";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors, G_UserData } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FirstPayItemCellNew extends ListViewCellBase {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;

    @property({
        type: CommonRewardListNode,
        visible: true
    })
    _commonRewardListNode: CommonRewardListNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskDes: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButtonLargeNormal: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    static LINE_ITEM_NUM = 1;
    static ITEM_GAP = 106;
    static ITEM_MID_GAP = 160;
    static ITEM_ADD_GAP = 132;
    static ITEM_OR_GAP = 132;
    static POS_OFFSET_DISCOUNT = 10;
    static SCROLL_WIDTH = 582;
    private _callback: any;
    private _data: any;

    ctor() {

    }
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButtonLargeNormal.setSwallowTouches(false);
    }
    onClickBtn() {
        if (this._callback) {
            this._callback(this);
        }
        this._onItemClick(this);
    }
    _onItemClick(sender) {
        var curSelectedPos = sender.getTag();
        this.dispatchCustomCallback(curSelectedPos, this._data);
    }
    _onTouchCallBack(sender, state) {
        if (state == cc.Node.EventType.TOUCH_END || !state) {
            var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
            var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
            if (moveOffsetX < 20 && moveOffsetY < 20) {
                this.onClickBtn();
            }
        }
    }
    onClickItem(sender) {
        var tag = this.getTag();
    }
    _updateRewards(data) {
        var rewards = [];
        var rewardTypes = [];
        for (var i = 1; i <= 3; i++) {
            rewards.push({
                size: data['size_' + i],
                type: data['type_' + i],
                value: data['value_' + i]
            });
            rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
        }
        this._commonRewardListNode.setGaps(FirstPayItemCellNew.ITEM_GAP, FirstPayItemCellNew.ITEM_ADD_GAP, FirstPayItemCellNew.ITEM_OR_GAP, FirstPayItemCellNew.SCROLL_WIDTH);
        this._commonRewardListNode.updateInfo(rewards, rewardTypes);
    }

    updateUI(data, charge, time) {
        this._data = data;
        this._textTaskDes.string = `第${data.Day}天`;
        var hasReceive = G_UserData.getActivityFirstPay().hasReceive(data.id);
        var canReceive = G_UserData.getActivityFirstPay().canReceive(data.id);
        const reachReceive = G_UserData.getActivityFirstPay().isReachReceiveCondition(data.id)
        this._updateRewards(data);
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._commonButtonLargeNormal.setString('领取');
        this._imageReceive.node.active = (false);
        if (canReceive) {
        } else if (hasReceive) {
            this._commonButtonLargeNormal.setVisible(false);
            this._imageReceive.node.active = (true);
        } else {
            if (reachReceive) {
                this._commonButtonLargeNormal.setEnabled(false);
            } else {
                this._commonButtonLargeNormal.setString('去充值');
            }
        }
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }
}