const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ViewBase from '../../ViewBase';
import { G_SceneManager, G_UserData, G_SignalManager, G_ResolutionManager } from '../../../init';
import InstrumentConst from '../../../const/InstrumentConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { Slot } from '../../../utils/event/Slot';
import CommonInstrumentAvatar from '../../../ui/component/CommonInstrumentAvatar';
import { InstrumentUnitData } from '../../../data/InstrumentUnitData';
import InstrumentDetailBaseView from '../instrument/InstrumentDetailBaseView';
import TeamView from '../team/TeamView';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import UIHelper from '../../../utils/UIHelper';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import CommonPageViewEx from '../../../ui/component/CommonPageViewEx';

@ccclass
export default class InstrumentDetailView extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInstrumentDetailView: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelMid: cc.Node = null;

   @property({
       type: CommonPageViewEx,
       visible: true
   })
   _pageView: CommonPageViewEx = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _buttonUnload: CommonButtonLevel1Highlight = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _buttonReplace: CommonButtonLevel1Normal = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonLeft: cc.Button = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonRight: cc.Button = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
   _CommonInstrumentAvatar:cc.Prefab = null;

   @property(cc.Prefab)
   instrumentDetailBaseView:cc.Prefab = null;



   private _allInstrumentIds:any[];
   private _rangeType:number;
   private _signalInstrumentRemoveSuccess:Slot;
   private _selectedPos:number;
   private _maxCount:number;
   private _instrumentData:InstrumentUnitData;
   private _btnReplaceShowRP:boolean;
   private _pageViewSize:cc.Size;
   private _template:cc.Node;

    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._allInstrumentIds = [];

        var params = G_SceneManager.getViewArgs("instrumentDetail");
        var instrumentId = params[0];
        var rangeType = params[1];

        G_UserData.getInstrument().setCurInstrumentId(instrumentId);
        this._rangeType = rangeType || InstrumentConst.INSTRUMENT_RANGE_TYPE_1;

        this._topbarBase.setImageTitle('txt_sys_com_shenbing');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);

        UIHelper.addPageEvent(this.node, this._pageView, 'InstrumentDetailView', 'onPageViewEvent');

        //this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        //this._pageView.node.on(cc.Node.EventType.TOUCH_START, this.onPageTouch, this, true);
        //this._pageView.node.on("",this._onPageTouch,this);
        this._buttonUnload.setString(Lang.get('instrument_detail_btn_unload'));
        this._buttonReplace.setString(Lang.get('instrument_detail_btn_replace'));

        UIHelper.addEventListener(this.node,this._buttonLeft,'InstrumentDetailView','onButtonLeftClicked');
        UIHelper.addEventListener(this.node,this._buttonRight,'InstrumentDetailView','onButtonRightClicked');
        UIHelper.addEventListener(this.node,this._buttonReplace._button,'InstrumentDetailView','onButtonReplaceClicked');
        UIHelper.addEventListener(this.node,this._buttonUnload._button,'InstrumentDetailView','onButtonUnloadClicked');
    }

    onEnter(){

        this._signalInstrumentRemoveSuccess = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_CLEAR_SUCCESS, handler(this, this._instrumentRemoveSuccess));
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        if (this._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1) {
            this._allInstrumentIds = G_UserData.getInstrument().getRangeDataBySort();
        } else if (this._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_2) {
            var unit = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            var pos = unit.getPos();
            if (pos) {
                this._allInstrumentIds = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
            }
        }
        this._selectedPos = 1;
        //var curInstrumentId = G_UserData.getInstrument().getCurInstrumentId();
        for (var i=0; i<this._allInstrumentIds.length;i++) {
            var id = this._allInstrumentIds[i];
            if (id == instrumentId) {
                this._selectedPos = i+1;
            }
        }
        this._maxCount = this._allInstrumentIds.length;
        this._updatePageView();
        this._updateArrowBtn();
        this._updateInfo();
    }
    onExit(){
        this._signalInstrumentRemoveSuccess.remove();
        this._signalInstrumentRemoveSuccess = null;
    }
    onPageViewEvent(pageView, eventType, customEventData){
        if (eventType == cc.PageView.EventType.PAGE_TURNING && pageView == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            if (targetPos != this._selectedPos) {
                this._selectedPos = targetPos;
                var curInstrumentId = this._allInstrumentIds[this._selectedPos-1];
                G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
                this._updateArrowBtn();
                this._updateInfo();
            }
        }
    }
    _updatePageView() {
        this._pageViewSize = this._pageView.node.getContentSize();
        if(!this._template){
            this._template = this._createPageItemTemplate();
        }
        this._pageView.setTemplate(this._template);
        this._pageView.setCallback(handler(this, this.updatePageItem));
        this._pageView.removeAllPages();
        var instrumentCount = this._maxCount;
        this._pageView.resize(instrumentCount);
        //this._pageView.setCurrentPageIndex(this._selectedPos-1);
        this._pageView.scrollToPage(this._selectedPos-1,0);
    }
    // _createPageItem(width, height, i) {
    //     var instrumentId = this._allInstrumentIds[i];
    //     var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
    //     var baseId = unitData.getBase_id();
    //     var limitLevel = unitData.getLimit_level();
    //     var widget = new cc.Node();
    //     widget.setContentSize(width, height);
    //     var avatar = cc.instantiate(this._CommonInstrumentAvatar);
    //     widget.addChild(avatar);
    //     var commentAvatar = avatar.getComponent(CommonInstrumentAvatar);
    //     commentAvatar.showShadow(false);
    //     commentAvatar.updateUI(baseId, limitLevel);
    //     this._pageView.addPage(widget);
    // }
    updatePageItem(item, i){
        var allInstrumentIds = this._allInstrumentIds;
        if(i >= allInstrumentIds.length){
            return;
        }

        var instrumentId = allInstrumentIds[i];
        var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        if(unitData == null){
            return;
        }
        var baseId = unitData.getBase_id();
        var limitLevel = unitData.getLimit_level();

        var avatar = item.node.getChildByName('avatar').getComponent(CommonInstrumentAvatar);
        avatar.showShadow(false);
        avatar.updateUI(baseId, limitLevel);
    }
    _createPageItemTemplate() {
        var widget = new cc.Node;
        widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        var avatar = cc.instantiate(this._CommonInstrumentAvatar);
        widget.setAnchorPoint(0,0);
        var size = widget.getContentSize();
        avatar.setPosition(cc.v2(size.width * 0.5, size.height * 0.5));
        avatar.name = 'avatar';
        widget.addChild(avatar);
        widget.addComponent(ListViewCellBase);
        return widget
    }

    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._maxCount);
    }
    _updateInfo() {
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        this._instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        this._buttonUnload.setVisible(this._instrumentData.isInBattle());
        this._buttonReplace.setVisible(this._instrumentData.isInBattle());
        this._nodeInstrumentDetailView.removeAllChildren();
        var instrumentDetail = cc.instantiate(this.instrumentDetailBaseView);//new InstrumentDetailBaseView(this._instrumentData, this._rangeType);
        instrumentDetail.getComponent(InstrumentDetailBaseView).init(this._instrumentData,this._rangeType);
        this._nodeInstrumentDetailView.addChild(instrumentDetail);
        this._checkRedPoint();
    }
    onButtonLeftClicked(){
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curInstrumentId = this._allInstrumentIds[this._selectedPos-1];
        G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
    }
    onButtonRightClicked(){
        if (this._selectedPos >= this._maxCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curInstrumentId = this._allInstrumentIds[this._selectedPos-1];
        G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
    }
    onButtonReplaceClicked(){
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedPopupInstrumentReplace(this._btnReplaceShowRP);
        }
    }
    onButtonUnloadClicked(){
        var pos = this._instrumentData.getPos();
        G_UserData.getInstrument().c2sClearFightInstrument(pos);
    }
    _instrumentRemoveSuccess(){
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedInstrumentRemovePrompt(true);
        }
    }
    _checkRedPoint(){
        var pos = this._instrumentData.getPos();
        var slot = this._instrumentData.getSlot();
        if (pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var heroBaseId = heroUnitData.getBase_id();
            var param = {
                pos: pos,
                slot: slot,
                heroBaseId: heroBaseId
            };
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'slotRP', param);
            this._buttonReplace.showRedPoint(reach);
            this._btnReplaceShowRP = reach;
        }
    }

}
