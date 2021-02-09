import CommonListItem from "../../../ui/component/CommonListItem";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { handler } from "../../../utils/handler";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import { G_UserData, Colors, G_SceneManager, G_ConfigManager } from "../../../init";
import { table } from "../../../utils/table";
import { Lang } from "../../../lang/Lang";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import PopupBoxReward from "../../../ui/popup/PopupBoxReward";

var MAX_DAILY_AWARD_SIZE = 1;

const {ccclass, property} = cc._decorator;
@ccclass
export default class DailyMissionItemCell extends CommonListItem{

    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;
 
    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButton: CommonButtonSwitchLevel1 = null;
 
    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonGo: CommonButtonSwitchLevel1 = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCondition: cc.Node = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeRewardDi: cc.Sprite = null;
 
    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonResInfo1: CommonResourceInfo = null;
 
    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonResInfo2: CommonResourceInfo = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _dailyActivityValue: cc.Label = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;
    
    @property({
     type: cc.Sprite,
     visible: true
 })
 _imageIcon: cc.Sprite = null;
 
 @property({
     type: cc.Node,
     visible: true
 })
 _node_daily: cc.Node = null;
 
 @property({
     type: cc.Node,
     visible: true
 })
 _node_reward: cc.Node = null;
 
 
 @property({
     type: cc.Sprite,
     visible: true
 })
 _image_icon_frame: cc.Sprite = null;

    private _missionInfo:any;
    private _callback:any;

    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        var imageIcon = this._imageIcon;
        if (imageIcon) {
            // imageIcon.setTouchEnabled(true);
            imageIcon.node.on(cc.Node.EventType.TOUCH_END,this._onClickIcon,this);
        }
        for (var i = 1; i <= 2; i++) {
            (this['_commonResInfo' + i] as CommonResourceInfo).setVisible(false);
        }
        this._commonButton.addClickEventListenerExDelay(handler(this, this._onButtonClick), 0);
        this._commonGo.addClickEventListenerExDelay(handler(this, this._onButtonGo), 0);
    }
    updateUI(index, missionInfo) {
        this._updateDailyNode(missionInfo[0]);
        this._missionInfo = missionInfo[0];
    }
    _createConditionRichText(richText) {
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(new cc.Vec2(0.5, 0.5));
        this._nodeCondition.addChild(widget.node);
    }
    isAwardExp(award) {
        if (award.type == TypeConvertHelper.TYPE_RESOURCE && award.value == DataConst.RES_EXP) {
            return true;
        }
        return false;
    }
    _updateDailyNode(missionInfo) {
        this._node_daily.active = (true);
        this._node_reward.x = (131);
        this._nodeCondition.removeAllChildren();
        var iconPath = Path.getCommonIcon('main', missionInfo.icon);
        Util.updateImageView(this._imageIcon, { texture: iconPath });
        var awardList = [];
        var expAward = G_UserData.getDailyMission().getDailyAwardExp(missionInfo);
        if (expAward.size > 0) {
            table.insert(awardList, expAward);
        }
        for (var i = 1; i <= MAX_DAILY_AWARD_SIZE; i++) {
            if (missionInfo['reward_type' + i] > 0) {
                var award = {
                    type: missionInfo['reward_type' + i],
                    value: missionInfo['reward_value' + i],
                    size: missionInfo['reward_size' + i]
                };
                table.insert(awardList, award);
            }
        }
        for (var i = 1; i <= 2; i++) {
            (this['_commonResInfo' + i] as CommonResourceInfo).setVisible(false);
        }
        for (var i =1;i<=awardList.length;i++) {
            var value = awardList[i-1];
            (this['_commonResInfo' + i] as CommonResourceInfo).updateUI(value.type, value.value, value.size);
            (this['_commonResInfo' + i] as CommonResourceInfo).setVisible(true);
        }
        if (this._commonResInfo2.node.active) {
            var contentSize = this._commonResInfo1.getResSize();
            var res1PosX = this._commonResInfo1.node.x;
            this._commonResInfo2.node.x = (res1PosX + contentSize.width + 15);
        }
        this._textDesc.string = (' ');
        this._textDesc.node.x = (this._textItemName.node.x + this._textItemName.node.getContentSize().width + 40);
        this._textItemName.string =G_ConfigManager.checkCanRecharge() ? (missionInfo.name) : missionInfo.name.replace('购买', '兑换');
        this._updateBtnState(missionInfo);
        this._dailyActivityValue.string = ('+' + missionInfo.reward_active);
    }
    _notReachBtn(isGotoBtn) {
    }
    _gotoBtn(isReceive) {
    }
    _updateRichText() {
    }
    _updateBtnState(missionInfo) {
        var isGotoBtn = missionInfo.function_id > 0;
        var isReceive = missionInfo.getAward;
        var canGetAward = missionInfo.value >= missionInfo.require_value && !isReceive;
        this._imageReceive.node.active = (false);
        this._commonButton.setEnabled(false);
        this._commonGo.setVisible(false);
        if (canGetAward) {
            this._commonButton.setVisible(true);
            this._commonButton.setEnabled(true);
            this._commonButton.setString(Lang.get('common_btn_get_award'));
            this._commonButton.switchToNormal();
        } else {
            if (isReceive) {
                this._imageReceive.node.active = (true);
                this._commonButton.setVisible(false);
                this._commonGo.setVisible(false);
                this._nodeCondition.removeAllChildren();
            } else {
                if (isGotoBtn) {
                    this._commonButton.setVisible(false);
                    this._commonGo.setVisible(true);
                    this._commonGo.setString(Lang.get('common_btn_go_to'));
                    this._commonGo.setVisible(true);
                    this._commonGo.switchToHightLight();
                } else {
                    this._commonButton.setString(Lang.get('common_btn_no_finish'));
                    this._commonButton.setEnabled(false);
                    this._commonButton.setVisible(true);
                    this._commonGo.setVisible(false);
                }
            }
        }
        var isGreen = missionInfo.value >= missionInfo.require_value;
        var currColor = Colors.colorToNumber(Colors.uiColors.GREEN);
        var totalColor = Colors.colorToNumber(Colors.uiColors.GREEN);
        if (!isGreen) {
            currColor = Colors.colorToNumber(Colors.uiColors.RED);
            totalColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO);
        }
        if (!canGetAward && !isReceive) {
            var curValue = parseInt(missionInfo.value);
            var maxValue = parseInt(missionInfo.require_value);
            var richText = Lang.get('achievement_condition', {
                curr: curValue,
                currColor: currColor,
                total: maxValue,
                totalColor: totalColor
            });
            this._createConditionRichText(richText);
        }
    }
    _onButtonGo(sender) {
        var index = sender.getTag();
        var missionInfo = this._missionInfo;
        if (missionInfo.getAward == false) {
            if (missionInfo.function_id > 0) {
                WayFuncDataHelper.gotoModuleByFuncId(missionInfo.function_id);
            }
        }
    }
    _onButtonClick(sender) {
        var index = sender.getTag();
        var missionInfo = this._missionInfo;
        if (missionInfo.getAward == false) {
            if (missionInfo.value >= missionInfo.require_value) {
                this.dispatchCustomCallback(missionInfo.id);
            } else {
                if (missionInfo.function_id > 0) {
                    if (missionInfo.function_id == FunctionConst.FUNC_DINNER) {
                    }
                    WayFuncDataHelper.gotoModuleByFuncId(missionInfo.function_id, 'mission');
                }
            }
        }
    }
    _onClickIcon() {
        var cfgData = this._missionInfo;
        var awardList = [];
        var expAward = G_UserData.getDailyMission().getDailyAwardExp(cfgData);
        if (expAward.size > 0) {
            table.insert(awardList, expAward);
        }
        for (var i = 1; i <= MAX_DAILY_AWARD_SIZE; i++) {
            if (cfgData['reward_type' + i] > 0) {
                var award = {
                    type: cfgData['reward_type' + i],
                    value: cfgData['reward_value' + i],
                    size: cfgData['reward_size' + i]
                };
                table.insert(awardList, award);
            }
        }

        G_SceneManager.openPopup(Path.getCommonPrefab("PopupBoxReward"),function(popup:PopupBoxReward){
            popup.init(Lang.get('achievement_reward_title'), null, true)
            popup.updateUI(awardList);
            popup.openWithAction();
            popup.setDetailText(Lang.get('achievement_reward_desc'));
        })

    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }
}