const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonRewardListNode from '../../../ui/component/CommonRewardListNode'
import CommonListItem from '../../../ui/component/CommonListItem';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import CommonConst from '../../../const/CommonConst';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { handler } from '../../../utils/handler';
import CommonButtonLargeNormal from '../../../ui/component/CommonButtonLargeNormal';

@ccclass
export default class CustomActivityTaskItemCell extends CommonListItem {

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
       type: CommonButtonLargeNormal,
       visible: true
   })
   _commonButtonLargeNormal: CommonButtonLargeNormal = null;

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
   
   private _callback:any;
   private static LINE_ITEM_NUM = 1;
   private static ITEM_GAP = 106;
   private static ITEM_ADD_GAP = 132;
   private static ITEM_OR_GAP = 132;
onCreate() {
    // this._commonButtonLargeNormal.node.on(cc.Node.EventType.TOUCH_END,this._onTouchCallBack,this)
    var size = this._resourceNode.node.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._commonButtonLargeNormal.setSwallowTouches(false);
    this._commonButtonLargeNormal.addTouchEventListenerEx(handler(this,this.onClickBtn),false)
}
onClickBtn() {
    if (this._callback) {
        this._callback(this);
    }
    this._onItemClick();
}
private _onItemClick() {
    var curSelectedPos = this.itemID;
    cc.warn('CustomActivityTaskItemCell:_onIconClicked  ' + curSelectedPos);
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
protected updateUI(itemId, data) {
    this.updateInfo(data[0]);
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
    this._commonRewardListNode.setGaps(CustomActivityTaskItemCell.ITEM_GAP, CustomActivityTaskItemCell.ITEM_ADD_GAP, CustomActivityTaskItemCell.ITEM_OR_GAP);
    this._commonRewardListNode.updateInfo(rewards, rewardTypes);
}
_createProgressRichText(richText) {
    this._nodeProgress.removeAllChildren();
    var widget = RichTextExtend.createWithContent(richText);
    widget.node.setAnchorPoint(new cc.Vec2(1, 0.5));
    this._nodeProgress.addChild(widget.node);
}
updateInfo(data) {
    var customActTaskUnitData = data.actTaskUnitData;
    var activityUnitData = data.actUnitData;
    var reachReceiveCondition = data.reachReceiveCondition;
    var canReceive = data.canReceive;
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

    this._commonButtonLargeNormal.setString(TextHelper.byteAlignment(buttonTxt, 2, 4));
    
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