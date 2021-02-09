const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonRewardListNode from '../../../ui/component/CommonRewardListNode'
import { TextHelper } from '../../../utils/TextHelper';
import { Lang } from '../../../lang/Lang';
import CommonConst from '../../../const/CommonConst';
import CommonListItem from '../../../ui/component/CommonListItem';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { handler } from '../../../utils/handler';

@ccclass
export default class CustomActivitySingleRechargeItemCell extends CommonListItem {

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
   
   public static LINE_ITEM_NUM = 1;
   public static ITEM_GAP = 106;
   public static ITEM_ADD_GAP = 132;
   public static ITEM_OR_GAP = 132;

   private _callback:any;
   onCreate() {
    var size = this._resourceNode.node.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._commonButtonLargeNormal.addClickEventListenerEx(handler(this,this.onClickBtn))
}
onClickBtn() {
    if (this._callback) {
        this._callback(this);
    }
    this._onItemClick(this);
}
_onItemClick(sender) {
    var curSelectedPos = this.itemID;
    cc.warn('CustomActivitySingleRechargeItemCell:_onIconClicked  ' + curSelectedPos);
    this.dispatchCustomCallback(curSelectedPos);
}
_onTouchCallBack(sender:cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            this.onClickBtn();
        }
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
    for (var i = 1; i <= rewardNum; i += 1) {
        if (i <= fixRewards.length) {
            rewards.push(fixRewards[i-1]);
            rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
        } else {
            rewards.push(selectRewards[i - fixRewards.length-1]);
            rewardTypes.push(CustomActivityConst.REWARD_TYPE_SELECT);
        }
    }
    this._commonRewardListNode.setGaps(CustomActivitySingleRechargeItemCell.ITEM_GAP, CustomActivitySingleRechargeItemCell.ITEM_ADD_GAP, CustomActivitySingleRechargeItemCell.ITEM_OR_GAP);
    this._commonRewardListNode.updateInfo(rewards, rewardTypes);
}
protected updateUI(index:number,data:any){
       this.updateInfo(data[0]);
}
_createProgressRichText(richText) {
    this._nodeProgress.removeAllChildren();
    var widget = RichTextExtend.createWithContent(richText);
    widget.node.setAnchorPoint(new cc.Vec2(0.5, 0.5));
    this._nodeProgress.addChild(widget.node);
}
updateInfo(data) {
    var customActTaskUnitData = data.actTaskUnitData;
    var activityUnitData = data.actUnitData;
    var reachReceiveCondition = data.reachReceiveCondition;
    var canReceive = data.canReceive;
    var hasLimit = data.hasLimit;
    var buttonTxt = activityUnitData.getButtonTxt();
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
        } else if (value01 > 0) {
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
    this._commonButtonLargeNormal.switchToNormal();
    this._imageReceive.node.active = (false);
    if (canReceive) {
        this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_receive'));
    } else {
        if (hasLimit) {
            this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_already_receive'));
            this._commonButtonLargeNormal.setVisible(false);
            this._imageReceive.node.active = (true);
        } else if (!reachReceiveCondition) {
            if (functionId != 0) {
                this._commonButtonLargeNormal.switchToHightLight();
            } else {
                this._commonButtonLargeNormal.setEnabled(false);
            }
        }
    }
}
setCallBack(callback) {
    if (callback) {
        this._callback = callback;
    }
}


}