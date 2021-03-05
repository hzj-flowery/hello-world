const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class PopupArenaAwardCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonButtonLevel2Highlight,
       visible: true
   })
   _btnGetAward: CommonButtonLevel2Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGetAward: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIcon1: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIcon2: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIcon3: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIcon4: CommonIconTemplate = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCondition: cc.Label = null;
   
   private _awardInfo:any;
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._btnGetAward.addClickEventListenerEx(handler(this, this._onButtonClick));
}
updateUI(index, cellValue) {
    this._imageGetAward.node.active = (false);
    this._btnGetAward.node.active = (false);
    this._textCondition.node.active = (false);
    if (cellValue.isReach == true && cellValue.isTaken == true) {
        this._imageGetAward.node.active = (true);
    } else {
        this._btnGetAward.node.active = (true);
        this._btnGetAward.setString(cellValue.isReach && Lang.get('arena_reward_btn_take') || Lang.get('arena_reward_btn_unreach'));
        this._btnGetAward.setEnabled(cellValue.isReach);
    }
    this._textCondition.node.active = (true);
    this._textCondition.string = (Lang.get('arena_reward_rank_condition', { rank: cellValue.cfg.rank_min }));
    var awardList:any = [];
    var awardInfo = cellValue.cfg;
    for (var i = 1;i<=3;i++) {
        if (awardInfo['award_type_' + i] > 0) {
            var award:any = {};
            award.type = awardInfo['award_type_' + i];
            award.value = awardInfo['award_value_' + i];
            award.size = awardInfo['award_size_' + i];
            awardList.push(award);
        }
    }
    var commonIcons = this._scrollView.children;
    for (var j in commonIcons) {
        var commIcon = commonIcons[j].getComponent(CommonIconTemplate);
        var award:any = awardList[j];
        if (award) {
            commIcon.unInitUI();
            commIcon.initUI(award.type, award.value, award.size);
            commIcon.node.active = (true);
        } else {
            commIcon.node.active = (true);
            commIcon.refreshToEmpty();
        }
    }
    this._awardInfo = cellValue;
}
_onButtonClick(sender) {
    cc.warn('PopupArenaAwardCell:_onButtonClick');
    var awardId = this._awardInfo.cfg.id;
    this.dispatchCustomCallback(awardId);
}


}