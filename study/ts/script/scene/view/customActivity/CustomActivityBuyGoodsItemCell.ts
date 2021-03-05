const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonRewardListNode from '../../../ui/component/CommonRewardListNode'
import { TextHelper } from '../../../utils/TextHelper';
import { Lang } from '../../../lang/Lang';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import CommonListItem from '../../../ui/component/CommonListItem';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import CommonConst from '../../../const/CommonConst';
import { handler } from '../../../utils/handler';

@ccclass
export default class CustomActivityBuyGoodsItemCell extends CommonListItem {

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

   private static LINE_ITEM_NUM = 1;
   private static ITEM_GAP = 106;
   private static ITEM_ADD_GAP = 132;
   private static ITEM_OR_GAP = 132;

   
   private _callback:any;
onCreate() {
    var size = this._resourceNode.node.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._commonButtonLargeNormal.setSwallowTouches(false);
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
    cc.warn('CustomActivityBuyGoodsItemCell:_onIconClicked  ' + curSelectedPos);
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
    this._commonRewardListNode.setGaps(CustomActivityBuyGoodsItemCell.ITEM_GAP, CustomActivityBuyGoodsItemCell.ITEM_ADD_GAP, CustomActivityBuyGoodsItemCell.ITEM_OR_GAP);
    this._commonRewardListNode.updateInfo(rewards, rewardTypes);
}
_createProgressRichText(richText) {
    this._nodeProgress.removeAllChildren();
    var widget = RichTextExtend.createWithContent(richText);
    widget.node.setAnchorPoint(new cc.Vec2(0.5, 0.5));
    this._nodeProgress.addChild(widget.node);
}
protected updateUI(index,data){
    this.updateInfo(data[0]);
}
updateInfo(data) {
    var customActTaskUnitData = data.actTaskUnitData;
    var activityUnitData = data.actUnitData;
    var reachReceiveCondition = data.reachReceiveCondition;
    var canReceive = data.canReceive;
    var hasLimit = data.hasLimit;
    var timeLimit = data.timeLimit;
    var hasReceive = data.hasReceive;
    var buttonTxt = customActTaskUnitData.getButtonTxt();
    var taskDes = customActTaskUnitData.getDescription();
    var progressTitle = customActTaskUnitData.getProgressTitle();
    var [value01, value02, onlyShowMax] = customActTaskUnitData.getProgressValue();
    var functionId = customActTaskUnitData.getFunctionId();
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
    this._commonButtonLargeNormal.node.active = (true);
    this._commonButtonLargeNormal.setEnabled(true);
    this._commonButtonLargeNormal.setString(buttonTxt);
    // this._commonButtonLargeNormal.switchToNormal();
    this._imageReceive.node.active = (false);
    if (canReceive) {
        this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_receive'));
    } else if (hasReceive) {
        this._commonButtonLargeNormal.setString(Lang.get('days7activity_btn_already_receive'));
        this._commonButtonLargeNormal.node.active = (false);
        this._imageReceive.node.active = (true);
    } else if (hasLimit || timeLimit) {
        this._commonButtonLargeNormal.setEnabled(false);
    } else {
        this._commonButtonLargeNormal.switchToHightLight();
    }
}
setCallBack(callback) {
    if (callback) {
        this._callback = callback;
    }
}


}