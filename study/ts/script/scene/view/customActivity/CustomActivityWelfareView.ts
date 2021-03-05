const {ccclass, property} = cc._decorator;

import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar'

import CommonTalkNode from '../../../ui/component/CommonTalkNode'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import { Colors } from '../../../init';
import { RichTextHelper } from '../../../utils/RichTextHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class CustomActivityWelfareView extends ViewBase {

   @property({
       type: cc.Label,
       visible: true
   })
   _textActTitle: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _textNode: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textActDes: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _countDownNode: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTimeTitle: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: CommonTalkNode,
       visible: true
   })
   _commonTalk: CommonTalkNode = null;

   @property({
       type: CommonStoryAvatar,
       visible: true
   })
   _commonStoryAvator: CommonStoryAvatar = null;
   
   private _customActUnitData:any;
   private _refreshHandler:any;

onCreate() {
    this._commonStoryAvator.updateUI(204);
    this._commonStoryAvator.node.setScale(0.6);
}
onEnter() {
    this._startRefreshHandler();
}
onExit() {
    this._endRefreshHandler();
}
_startRefreshHandler() {
    if (this._refreshHandler != null) {
        return;
    }
    this._refreshHandler = handler(this, this._onRefreshTick);
    this.schedule(this._refreshHandler, 1);
}
_endRefreshHandler() {
    if (this._refreshHandler != null) {
        this.unschedule(this._refreshHandler);
        this._refreshHandler = null;
    }
}
_onRefreshTick(dt) {
    var actUnitdata = this._customActUnitData;
    if (actUnitdata) {
        this._refreshActTime(actUnitdata);
    }
}
_refreshActTime(actUnitData) {
    var timeStr = '';
    if (actUnitData.isActInRunTime()) {
        timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
    } else {
        timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getAward_time());
    }
    this._textTime.string = (timeStr);
}
_refreshDes() {
    if (!this._customActUnitData) {
        return;
    }
    this._textActTitle.string = (this._customActUnitData.getSub_title());
    this._createProgressRichText(this._customActUnitData.getDesc());
}
refreshView(customActUnitData) {
    this._customActUnitData = customActUnitData;
    this._refreshDes();
    if (this._customActUnitData) {
        this._refreshActTime(this._customActUnitData);
    }
    this._commonTalk.setString(this._customActUnitData.getDetail(), 325, true, 325, 76, null, null, true);
}
_createProgressRichText(msg) {
    var richMsg = RichTextHelper.getRichMsgListForHashText(msg, Colors.BRIGHT_BG_RED, Colors.DARK_BG_TWO, 20);
    this._textNode.removeAllChildren();
    var widget = RichTextExtend.createWithContent(richMsg);
    widget.node.setAnchorPoint(new cc.Vec2(0, 1));
    // widget.ignoreContentAdaptWithSize(false);
    widget.maxWidth = 360;
    this._textNode.addChild(widget.node);
}
enterModule() {
    this._commonTalk.doAnim();
}


}