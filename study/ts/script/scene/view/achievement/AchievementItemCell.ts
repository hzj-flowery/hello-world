const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { AchievementData } from '../../../data/AchievementData';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';
import { Colors, G_SceneManager, G_ServerTime } from '../../../init';
import PanelSeasonPlayers from '../settlement/PanelSeasonPlayers';
import { TextHelper } from '../../../utils/TextHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { table } from '../../../utils/table';
import { SceneManager } from '../../SceneManager';
import PopupBoxReward from '../../../ui/popup/PopupBoxReward';
import CommonUI from '../../../ui/component/CommonUI';

@ccclass
export default class AchievementItemCell extends CommonListItem {

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



    private _achInfo: any;
    private _callback: any;

    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._imageIcon.node.on(cc.Node.EventType.TOUCH_END, this._onClickIcon, this);
        for (var i = 1; i <= 2; i++) {
            this['_commonResInfo' + i].node.active = (false);
        }
        this._commonButton.addClickEventListenerExDelay(handler(this, this._onButtonClick), 0);
        this._commonGo.addClickEventListenerExDelay(handler(this, this._onButtonGo), 0);
        this._commonButton.switchToNormal();
    }
    updateUI(index, achInfo) {
        this._updateAchievementNode(achInfo[0]);
        this._achInfo = achInfo[0];
    }
    _createConditionRichText(richText) {
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeCondition.addChild(widget.node);
    }
    _updateAchievementNode(achInfo) {
        var cfg = achInfo.cfgData;
        this._node_daily.active = (false);
        this._node_reward.x = (0);
        this._nodeCondition.removeAllChildren();
        if (cfg['tab'] == AchievementData.FIRST_MEET_TYPE) {
            this._image_icon_frame.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame('img_frame_07'));
            this._imageIcon.node.addComponent(CommonUI).loadTexture(Path.getCommonIcon('hero', cfg.icon));
            this._imageIcon.node.scale = (0.9);
        } else {
            this._image_icon_frame.node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_com_icon_bg02'));
            this._imageIcon.node.addComponent(CommonUI).loadTexture(Path.getCommonIcon('achievement', cfg.icon));
            this._imageIcon.node.scale = (0.8);
        }
        for (var i = 1; i <= 2; i++) {
            if (cfg['reward_type' + i] > 0) {
                this['_commonResInfo' + i].updateUI(cfg['reward_type' + i], cfg['reward_value' + i], cfg['reward_size' + i]);
                this['_commonResInfo' + i].node.active = (true);
                if (cfg['tab'] == AchievementData.FIRST_MEET_TYPE) {
                    this['_commonResInfo' + i].setPlusNum(25);
                }
            } else {
                this['_commonResInfo' + i].node.active = (false);
            }
        }
        if (this._commonResInfo2.node.active) {
            var contentSize = this._commonResInfo1.getResSize();
            var res1PosX = this._commonResInfo1.node.x;
            this._commonResInfo2.node.x = (res1PosX + contentSize.width + 15);
            var contentSize1 = this._commonResInfo2.getResSize();
            this._nodeRewardDi.node.setContentSize(cc.size(contentSize1.width + contentSize.width + 97, 32));
        } else {
            this._nodeRewardDi.node.setContentSize(cc.size(200, 32));
        }
        this._nodeRewardDi.node.active = (true);
        this._textItemName.string = (achInfo.cfgData.theme);
        this._textItemName["_updateRenderData"](true);
        this._textDesc.string = (achInfo.desc);
        this._textDesc.node.x = (this._textItemName.node.x + this._textItemName.node.getContentSize().width + 30);
        this._updateBtnState(achInfo);
    }
    _notReachBtn(isGotoBtn) {
    }
    _gotoBtn(isReceive) {
    }
    _updateRichText() {
    }
    _updateBtnState(achInfo) {
        var cfg = achInfo.cfgData;
        var isGotoBtn = cfg.function_id > 0;
        var isReceive = achInfo.serverData.getAward;
        var canGetAward = achInfo.serverData.now_value >= achInfo.serverData.max_value && !isReceive;
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
        if (cfg.if_display != 2) {
            var isGreen = achInfo.serverData.now_value >= achInfo.serverData.max_value;
            var currColor = Colors.colorToNumber(Colors.uiColors.GREEN);
            var totalColor = Colors.colorToNumber(Colors.uiColors.GREEN);
            if (!isGreen) {
                currColor = Colors.colorToNumber(Colors.uiColors.RED);
                totalColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO);
            }
            if (!canGetAward && !isReceive) {
                var curValue = parseInt(achInfo.serverData.now_value);
                var maxValue = parseInt(achInfo.serverData.max_value);
                if (curValue != null && maxValue) {
                    curValue = TextHelper.getAmountText(achInfo.serverData.now_value);
                    maxValue = TextHelper.getAmountText(achInfo.serverData.max_value);
                } else {
                    curValue = achInfo.serverData.now_value;
                    maxValue = achInfo.serverData.now_value;
                }
                var richText = Lang.get('achievement_condition', {
                    curr: curValue,
                    currColor: currColor,
                    total: maxValue,
                    totalColor: totalColor
                });
                this._createConditionRichText(richText);
            }
        }
    }
    _onButtonGo(sender) {
        var index = sender.getTag();
        var serverData = this._achInfo.serverData;
        var cfgData = this._achInfo.cfgData;
        if (serverData.getAward == false) {
            if (cfgData.function_id > 0) {
                WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_id);
            }
        }
    }

    _onButtonClick(sender) {
        var index = sender.getTag();
        var serverData = this._achInfo.serverData;
        var cfgData = this._achInfo.cfgData;
        if (serverData.getAward == false) {
            if (serverData.now_value >= serverData.max_value) {
                this.dispatchCustomCallback(cfgData.id);
            } else {
                if (cfgData.function_id > 0) {
                    WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_id);
                }
            }
        }
    }
    _onClickIcon() {
        var cfgData = this._achInfo.cfgData;
        var awardList = [];
        for (var i = 1; i <= 2; i++) {
            if (cfgData['reward_type' + i] > 0) {
                var award = {
                    type: cfgData['reward_type' + i],
                    value: cfgData['reward_value' + i],
                    size: cfgData['reward_size' + i]
                };
                table.insert(awardList, award);
            }
        }


        G_SceneManager.openPopup(Path.getCommonPrefab("PopupBoxReward"), function (popup: PopupBoxReward) {

            popup.init(Lang.get('achievement_reward_title'), null, true);
            popup.openWithAction();
            popup.updateUI(awardList);
            popup.setDetailText(Lang.get('achievement_reward_desc'));

        })
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }


}