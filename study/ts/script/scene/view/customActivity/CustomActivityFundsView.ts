const {ccclass, property} = cc._decorator;

import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_EffectGfxMgr, G_GameAgent, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import CommonListView from '../../../ui/component/CommonListView';
import CommonUI from '../../../ui/component/CommonUI';
import { bit } from '../../../utils/bit';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import ViewBase from '../../ViewBase';
import { CustomActivityFundsHelper } from './CustomActivityFundsHelper';
import CustomActivityWeekFundsV2Cell from './CustomActivityWeekFundsV2Cell';


@ccclass
export default class CustomActivityFundsView extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeMonthFund: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBack: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTop: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textActivedDesc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textActivedCountDown: cc.Label = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnActive: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imagePurchased: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelCenter: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardNode1: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelDays1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGot1: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _awardIcon1: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch1: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelName1: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardNode2: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelDays2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGot2: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _awardIcon2: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode2: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch2: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelName2: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardNode3: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelDays3: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGot3: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _awardIcon3: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode3: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch3: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelName3: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardNode4: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelDays4: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGot4: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _awardIcon4: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode4: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch4: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelName4: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardNode5: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelDays5: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGot5: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _awardIcon5: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode5: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch5: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelName5: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeWeeKV2: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBackWeekV2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTopV2: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelCenterV2: cc.Node = null;

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listView: cc.ScrollView = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBottomV2: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCountDownV2: cc.Label = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnActiveV2: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imagePurchasedV2: cc.Sprite = null;

   @property({
    type: CommonListView,
    visible: true
})
_commonListView: CommonListView = null;
   

   private  _fundsType:number;
   private  _countDownTime:number;
   private  _fundsData:Array<any>;
   private  _curSelectDay:number;
   private  _actId:number;
   private  _questId:number;
   private  _fundsSignedData:Array<any>;
   private  _signedDay:number;
   private  _curFundsSigned:boolean;
   private  _weekV2CellList:any;
   private _listnerFundsRewards:any;
   private _curActivePay:number;
   private _curFundsGroup:any;
   private _cellMaxItemsNum:number;

   onLoad() {
    this._fundsType = 1101;
    this._countDownTime = 0;
    this._fundsData = [];
    this._curSelectDay = 1;
    this._actId = 0;
    this._questId = 0;
    this._fundsSignedData = [];
    this._signedDay = 0;
    this._curFundsSigned = false;
    this._weekV2CellList = {};
    super.onLoad();
}
onCreate() {
    this._btnActive.addClickEventListenerEx(handler(this,this._onActive));
    this._btnActiveV2.addClickEventListenerEx(handler(this,this._onActive));
}
onEnter() {
    this._btnActive.addClickEventListenerEx(handler(this,this._onActive));
    this._btnActiveV2.addClickEventListenerEx(handler(this,this._onActive));
    this._listnerFundsRewards = G_SignalManager.add(SignalConst.EVENT_FUNDS_REWARDS, handler(this, this._onFundsRewards));
    this.schedule(handler(this, this._update), 0.5);
}
onExit() {
    this._listnerFundsRewards.remove();
    this._listnerFundsRewards = null;
}
_onActive() {
    var payCfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(this._curActivePay);
    G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
}
_onFundsRewards(id, message) {
    if (this._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2) {
        this._updateListView();
    } else {
        this._initAwardCells();
    }
}
refreshView(customActUnitData) {
    this._imagePurchased.node.active = (false);
    this._imagePurchasedV2.node.active = (false);
    this._countDownTime = customActUnitData.getEnd_time();
    this._actId = customActUnitData.getAct_id();
    var questData = G_UserData.getCustomActivity().getActTaskUnitDataForFundsById(this._actId);
    if (questData != null) {
        var data = table.values(questData)[0];
        this._fundsType = data.getQuest_type();
        this._curActivePay = data.getParam2();
        this._curFundsGroup = data.getParam3();
        this._questId = table.keys(questData)[0];
        var curFundsSignedData = G_UserData.getCustomActivity().getActTaskDataById(this._actId, this._questId);
        var mask = table.nums(curFundsSignedData.valueMap_) >= 0 && curFundsSignedData.valueMap_[1] || 0;
        this._curFundsSigned = table.nums(curFundsSignedData.valueMap_) > 0;
        this._signedDay = Math.ceil(Math.abs(G_ServerTime.getLeftSeconds(curFundsSignedData.time2_)) / CustomActivityConst.FUNDS_ONEDAY_TIME);
        this._fundsSignedData = bit.tobits(mask);
        if (this._curFundsSigned) {
            this._countDownTime = curFundsSignedData.time2_ + (table.nums(G_UserData.getCustomActivity().getFundsByGroupId(this._curFundsGroup)) + 1) * CustomActivityConst.FUNDS_ONEDAY_TIME;
        }
        this._initData();
        this._initView();
        this._updateUI();
    }
}
_initData() {
    this._fundsData = G_UserData.getCustomActivity().getFundsByGroupId(this._curFundsGroup);
}
_initView() {
    var bVisible = this._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2;
    this._nodeMonthFund.active = (!bVisible);
    this._nodeWeeKV2.active = (bVisible);
}
_updateUI() {
    if (this._fundsData == null || this._fundsData.length <= 0) {
        return;
    }
    if (this._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2) {
        this._textDesc.string = (Lang.get('funds_actived_weekV2desc'));
        this._imageBackWeekV2.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(this._fundsData[0].background));
        // this._imageBackWeekV2.ignoreContentAdaptWithSize(true);
        this._initListBottomView();
        this._initListview();
    } else {
        this._initScrollTopView();
        this._initAwardCells();
    }
}
_initScrollview() {
    var template = null;
    if (this._fundsType == CustomActivityConst.FUNDS_TYPE_WEEK) {
        
        template =    cc.resources.get(Path.getPrefab("CustomActivityWeekFundsCell","customActivity")) ;
        this._cellMaxItemsNum = CustomActivityConst.FUNDS_WEEKITEMNUM_NORAML;
        this._textActivedDesc.string = (Lang.get('funds_actived_weekdesc'));
    } else if (this._fundsType == CustomActivityConst.FUNDS_TYPE_MONTH) {
        
        template =    cc.resources.get(Path.getPrefab("CustomActivityMonthFundsCell","customActivity")) ;
        this._cellMaxItemsNum = CustomActivityConst.FUNDS_MONTHITEMNUM;
        this._textActivedDesc.string = (Lang.get('funds_actived_monthdesc'));
    }
    this._commonListView.init(template, handler(this, this._onCellUpdate),handler(this, this._onCellSelected),handler(this, this._onItemTouch));
}
_createListData(index, value) {
    var cellData = value;
    cellData.isCurSelected = this._curSelectDay == index;
    cellData.isActived = this._curFundsSigned;
    cellData.canSignedDay = index <= this._signedDay;
    if (table.nums(this._fundsSignedData) > 0 && this._fundsSignedData[index-1] != null) {
        cellData.canGet = this._fundsSignedData[index-1];
    } else {
        cellData.canGet = this._curFundsSigned?0:3;
    }
    return cellData;
}
_initListview() {
    this._listView.content.removeAllChildren();
    for (var index = 1;index<= this._fundsData.length;index++) {
        var value = this._fundsData[index-1];
        
        var cell = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityWeekFundsV2Cell","customActivity"))) as cc.Node).getComponent(CustomActivityWeekFundsV2Cell) as CustomActivityWeekFundsV2Cell
        cell.setInitData(handler(this, this._rewardWeekV2));
        var cellData = this._createListData(index, value);
        cell.updateUI(cellData);
        cell.node.name = ('weekFundsV2Cell' + index);
        this._listView.content.addChild(cell.node);
    }
}
_updateListView() {
    for (var index=1;index<=this._fundsData.length;index++) {
        var value = this._fundsData[index-1];
        var cell = this._listView.content.getChildByName('weekFundsV2Cell' + index);
        if (cell != null) {
            var cellData = this._createListData(index, value);
            cell.getComponent(CustomActivityWeekFundsV2Cell).updateUI(cellData);
        }
    }
}
_initScrollOffsetY() {
    if (this._fundsType == CustomActivityConst.FUNDS_TYPE_MONTH) {
        return;
    }
    this._scrollView.y = (CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY);
    this._panelCenter.y = (CustomActivityConst.FUNDS_WEEK_PANELPOSITIONY);
    this._scrollView.setContentSize(cc.size(this._scrollView.getContentSize().width, CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY));
    this._panelCenter.setContentSize(cc.size(this._panelCenter.getContentSize().width, CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY));
}
_initScrollTopView() {
    var fundsType = this._fundsType%CustomActivityConst.FUNDS_TYPE_WEEK;
    var cfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(this._curActivePay);
    this._imagePurchased.node.active = (this._curFundsSigned);
    this._btnActive.node.active = (!this._curFundsSigned);
    this._btnActive.setString(Lang.get('funds_active', { rmb: cfg.rmb }));
    this._imageBack.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_BACKGROUND[fundsType]));
    // this._imageBack.ignoreContentAdaptWithSize(true);
}
_initListBottomView() {
    var fundsType = this._fundsType%CustomActivityConst.FUNDS_TYPE_WEEK + 1;
    var cfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(this._curActivePay);
    this._imagePurchasedV2.node.active = (this._curFundsSigned);
    this._btnActiveV2.node.active = (!this._curFundsSigned);
    this._btnActiveV2.setString(Lang.get('funds_active', { rmb: cfg.rmb }));
}
_initAwardCells() {
    if (this._fundsData == null || table.nums(this._fundsData) <= 0) {
        return;
    }
    var cellData = {};
    for (var index = 1; index <= 5; index++) {
        var itemData = this._fundsData[index-1];
        if (itemData != null) {
            itemData.isCurSelected = this._curSelectDay == index;
            itemData.isActived = this._curFundsSigned;
            itemData.canSignedDay = index <= this._signedDay;
            if (table.nums(this._fundsSignedData) > 0 && this._fundsSignedData[index-1] != null) {
                itemData.canGet = this._fundsSignedData[index-1];
            } else {
                // itemData.canGet = this._curFundsSigned && 0 || 3;
                itemData.canGet = this._curFundsSigned?0:3;
            }
            this._initOneCell(itemData, index);
        }
    }
}
_updateEffect(index, state) {
    var selectedFlash = this['_effectNode' + index].getChildByName('flash_effect' + index);
    if (selectedFlash == null) {
        var lightEffect =  G_EffectGfxMgr.createPlayGfx(this['_effectNode' + index],SeasonSportConst.SEASON_PET_SELECTEDEFFECT[0]);
        lightEffect.node.setAnchorPoint(0, 0);
        lightEffect.play();
        lightEffect.node.setScale(1.1);
        lightEffect.node.active = (state == 0);
        lightEffect.node.name = ('flash_effect' + index);
        // lightEffect.node.setPosition(this['_effectNode' + index].getContentSize().width * 0.5, this['_effectNode' + index].getContentSize().height * 0.5 + 1);
    } else {
        selectedFlash.active = (state == 0);
    }
}
_initOneCell(data, index) {
    if (data == null) {
        return;
    }
    this['_awardIcon' + index].unInitUI();
    this['_awardIcon' + index].initUI(data.reward_type_1, data.reward_value_1, data.reward_size_1);
    if (data.isActived && data.canSignedDay) {
        this._updateEffect(index, data.canGet);
        this['_awardIcon' + index].setIconMask(data.canGet == 1);
        this['_awardIcon' + index].setTouchEnabled(data.canGet == 1);
        this['_imgGot' + index].node.active = (data.canGet == 1);
        this['_labelDays' + index].node.active = (data.canGet == 0);
        (this['_panelTouch' + index] as cc.Node).active = (data.canGet == 0);
    } else {
        this._updateEffect(index, 1);
        this['_awardIcon' + index].setIconMask(false);
        this['_awardIcon' + index].setTouchEnabled(true);
        this['_imgGot' + index].node.active = (false);
        this['_labelDays' + index].node.active = (true);
        (this['_panelTouch' + index] as cc.Node).active = (false);
    }
    var param = this['_awardIcon' + index].getItemParams();
    this['_labelName' + index].string = (param.name);
    this['_labelName' + index].node.color = (param.icon_color);
    (this['_panelTouch' + index] as cc.Node).group = (data.day);
    // (this['_panelTouch' + index] as cc.Node).setEnabled(true);
    // (this['_panelTouch' + index] as cc.Node).setSwallowTouches(false);
    // (this['_panelTouch' + index] as cc.Node).setTouchEnabled(true);
    var btn = (this['_panelTouch' + index] as cc.Node).getComponent(cc.Button) as cc.Button;
    btn.clickEvents = [];
    var newE = new cc.Component.EventHandler();
    newE.component = "CustomActivityFundsView";
    newE.target = this.node;
    newE.handler = "onItemTouchOther";
    newE.customEventData = data.day;
    btn.clickEvents.push(newE);
    // (this['_panelTouch' + index] as cc.Node).on(cc.Node.EventType.TOUCH_END,this.onItemTouchOther.bind(this,data.day),this)
}

private onItemTouchOther(sender,day:number):void{
    this._curSelectDay = day;
    this._sendProtocol(day);
    this._initAwardCells();
}
_onCellUpdate(cell, cellIndex) {
    if (this._fundsData == null || table.nums(this._fundsData) <= 0) {
        return;
    }
    var itemFirstIndex = this._cellMaxItemsNum * cellIndex + 1;
    var itemLastIndex = this._cellMaxItemsNum * (cellIndex + 1);
    var bFirstCell = cellIndex == 0 || false;
    var cellData = [];
    for (var index = itemFirstIndex; index <= itemLastIndex; index++) {
        var itemData = this._fundsData[index-1];
        if (itemData != null) {
            itemData.isCurSelected = this._curSelectDay == index;
            itemData.isActived = this._curFundsSigned;
            itemData.canSignedDay = index <= this._signedDay;
            if (table.nums(this._fundsSignedData) > 0 && this._fundsSignedData[index] != null) {
                itemData.canGet = this._fundsSignedData[index];
            } else {
                itemData.canGet = this._curFundsSigned && 0 || 3;
            }
            table.insert(cellData, itemData);
        }
    }
    cell.updateUI(cellData, this._fundsType, bFirstCell);
}
_onCellSelected(index, itemPos) {

}
//发送协议
_sendProtocol(day) {
    if (table.nums(this._fundsSignedData) > 0 && this._fundsSignedData[day] != null) {
        if (this._fundsSignedData[day] == 0) {
            G_UserData.getCustomActivity().c2sGetCustomActivityFundAward(this._actId, this._questId, day);
        }
    } else {
        if (this._curFundsSigned && day <= this._signedDay) {
            G_UserData.getCustomActivity().c2sGetCustomActivityFundAward(this._actId,this._questId, day);
        }
    }
}
_onItemTouch(index, itemPos) {
    var day = index+1;
    this._curSelectDay = parseInt(day);
    this._sendProtocol(day);
    this._initAwardCells();
}
_rewardWeekV2(day) {
    if (day == null) {
        return;
    }
    this._curSelectDay = parseInt(day);
    this._sendProtocol(parseInt(day));
    this._updateListView();
}
_updateScrollView() {
    if (this._fundsData == null || table.nums(this._fundsData) <= 0) {
        return;
    }
    // this._scrollList.updateListView(1, Math.ceil(table.nums(this._fundsData) / this._cellMaxItemsNum));
}
_update(dt) {
    if (this._countDownTime > 0) {
        if (this._curFundsSigned) {
            this._textActivedCountDown.string = (Lang.get('funds_actived_countdown') + G_ServerTime.getTimeStringDHM(this._countDownTime));
            this._textCountDownV2.string = (Lang.get('funds_actived_countdown') + G_ServerTime.getTimeStringDHM(this._countDownTime));
        } else {
            this._textActivedCountDown.string = (Lang.get('funds_active_countdown') + G_ServerTime.getTimeStringDHM(this._countDownTime));
            this._textCountDownV2.string = (Lang.get('funds_active_countdown') + G_ServerTime.getTimeStringDHM(this._countDownTime));
        }
    }
}


}