const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonRewardListNode from '../../../ui/component/CommonRewardListNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import CommonConst from '../../../const/CommonConst';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class CarnivalActivityTaskCell extends ListViewCellBase {

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

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    _callback: any;
    _data: any;

    static LINE_ITEM_NUM = 1;
    static ITEM_GAP = 106;
    static ITEM_ADD_GAP = 132;
    static ITEM_OR_GAP = 132;
    static SCROLL_WIDTH = 550;

    onInit(){
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    onCreate() {
        UIHelper.addEventListener(this.node, this._commonButtonLargeNormal._button, 'CarnivalActivityTaskCell', '_onTouchCallBack');
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
        //logWarn('CarnivalActivityTaskCell:_onIconClicked  ' + curSelectedPos);
        //this.dispatchCustomCallback(curSelectedPos, this._data);\
        this.dispatchCustomCallback(curSelectedPos);
    }
    _onTouchCallBack(sender, state) {
        this.onClickBtn();
    }
    onClickItem(sender) {
        var tag = this.getTag();
    }
    _updateRewards(actTaskUnitData) {
        var fixRewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        var rewardNum = fixRewards.length + selectRewards.length;
        var rewards = [];
        var rewardTypes = [];
        for (var i = 1; i<=rewardNum; i++) {
            if (i <= fixRewards.length) {
                rewards.push(fixRewards[i-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
            } else {
                rewards.push(selectRewards[i - fixRewards.length-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_SELECT);
            }
        }
        this._commonRewardListNode.setGaps(CarnivalActivityTaskCell.ITEM_GAP, CarnivalActivityTaskCell.ITEM_ADD_GAP, CarnivalActivityTaskCell.ITEM_OR_GAP, CarnivalActivityTaskCell.SCROLL_WIDTH);
        this._commonRewardListNode.updateInfo(rewards, rewardTypes);
    }
    _createProgressRichText(richText) {
        this._nodeProgress.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(1, 0.5));
        this._nodeProgress.addChild(widget.node);
    }
    updateInfo(data) {
        this._data = data;
        var customActTaskUnitData = data.actTaskUnitData;
        var activityUnitData = data.actUnitData;
        var reachReceiveCondition = data.reachReceiveCondition;
        var canReceive = data.canReceive;
        var buttonTxt = customActTaskUnitData.getButtonTxt();
        var taskDes = customActTaskUnitData.getDescription();
        var progressTitle = customActTaskUnitData.getProgressTitle();
        var [value01, value02, onlyShowMax] = customActTaskUnitData.getProgressValue();
        var functionId = activityUnitData.getFunctionId();
        var notShowProgress = activityUnitData.getShow_schedule() != CommonConst.TRUE_VALUE;
        this._updateRewards(customActTaskUnitData);
        this._textTaskDes.string = (taskDes);
        this._nodeProgress.active = (!notShowProgress);
        if (!notShowProgress) {
            if (onlyShowMax) {
                var richText = Lang.get('customactivity_task_progress_03', {
                    title: progressTitle,
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            } else if (reachReceiveCondition) {
                var richText = Lang.get('customactivity_task_progress_02', {
                    title: progressTitle,
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            } else {
                var richText = Lang.get('customactivity_task_progress_01', {
                    title: progressTitle,
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            }
        }
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._commonButtonLargeNormal.setString(buttonTxt);
        this._imageReceive.node.active = (false);
        if (reachReceiveCondition) {
            if (canReceive) {
                this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_receive'));
            } else {
                this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_already_receive'));
                this._commonButtonLargeNormal.setVisible(false);
                this._imageReceive.node.active = (true);
            }
        } else {
            if (functionId != 0) {
            } else {
                this._commonButtonLargeNormal.setEnabled(false);
            }
        }
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }

}
