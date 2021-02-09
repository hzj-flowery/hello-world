const {ccclass, property} = cc._decorator;

import { HomelandConst } from '../../../const/HomelandConst';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonSweep from '../../../ui/component/CommonSweep';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { HomelandHelp } from '../homeland/HomelandHelp';
import PopupMineSweepCell from './PopupMineSweepCell';
import PopupMineSweepTotalCell from './PopupMineSweepTotalCell';


@ccclass
export default class PopupMineSweep extends PopupBase {

   @property({
       type: CommonSweep,
       visible: true
   })
   _sweepBG: CommonSweep = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnFinish: CommonButtonLevel0Highlight = null;
   
   private _reportList:any;
   private _count:number;
   private _scheduleHandler:any;
   private _isSweepFinish:boolean;
   public static SWEEP_TIME = 0.5;
   private _popupMineSweepCell:any;
   private _popupMineSweepTotalCell:any;

   protected preloadResList = [
       {path:Path.getPrefab("PopupMineSweepCell","mineCraft"),type:cc.Prefab},
       {path:Path.getPrefab("PopupMineSweepTotalCell","mineCraft"),type:cc.Prefab},
   ]

public setInitData(reportList:any):void{
    this._reportList = reportList;
    this._count = 0;
    this._scheduleHandler = null;
}
onCreate() {
    this._popupMineSweepCell = cc.resources.get(Path.getPrefab("PopupMineSweepCell","mineCraft"));
    this._popupMineSweepTotalCell = cc.resources.get(Path.getPrefab("PopupMineSweepTotalCell","mineCraft"));
    this._btnFinish.setString(Lang.get('mine_sweep_finish'));
    this._btnFinish.setVisible(false);
    this._btnFinish.addClickEventListenerEx(handler(this,this.onFinishClick))
    this._sweepBG.setCloseFunc(handler(this, this.onFinishClick));
    this._sweepBG.setTitle(Lang.get('mine_sweep_title'));
}
onEnter() {
    this._scheduleHandler = function(){
        this._update(PopupMineSweep.SWEEP_TIME);
    }.bind(this);
    this.schedule(this._scheduleHandler,PopupMineSweep.SWEEP_TIME);
}
onExit() {
    if (this._scheduleHandler != null) {
        this.unschedule(this._scheduleHandler);
        this._scheduleHandler = null;
    }
}
_update(f) {
    this._count = this._count + 1;
    if (this._count > this._reportList.length) {
        this._btnFinish.setVisible(true);
        this._isSweepFinish = true;
        this._isClickOtherClose = true;
        this._sweepBG.setCloseVisible(true);
        this._addTotalItem();
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20);
    } else {
        this._addItem();
    }
}
_addItem() {
    var data = this._reportList[this._count-1];
    var cell = (cc.instantiate(this._popupMineSweepCell) as cc.Node).getComponent(PopupMineSweepCell);
    cell.setInitData(data);
    this._sweepBG.pushItem(cell.node);
    this._sweepBG.scrollToBottom();
}
_addTotalItem() {
    var data = this._reportList[this._reportList.length-1];
    var cell = (cc.instantiate(this._popupMineSweepTotalCell) as cc.Node).getComponent(PopupMineSweepTotalCell);
    cell.setInitData(data);
    this._sweepBG.pushItem(cell.node);
    var totalSelfRed = 0;
    var totalTarRed = 0;
    var totalSelfInfame = 0;
    var totalTarInfame = 0;
    var myWin = 0;
    var TarWin = 0;
    for (var j in this._reportList) {
        var reportData = this._reportList[j];
        var star = reportData.getWin_type();
        if (star <= 0) {
            TarWin = TarWin + 1;
        } else {
            myWin = myWin + 1;
        }
        totalSelfRed = totalSelfRed + reportData.getSelf_dec_army();
        totalTarRed = totalTarRed + reportData.getTar_dec_army();
        totalSelfInfame = totalSelfInfame + reportData.getSelf_infamy_add();
        totalTarInfame = totalTarInfame + reportData.getTar_infamy_add();
    }
    cell.updateTotal(myWin, TarWin, data.isSelf_is_die(), data.isTar_is_die(), data.getSelf_army(), data.getTar_army(), totalSelfRed, totalTarRed, totalSelfInfame, totalTarInfame);
    this._sweepBG.scrollToBottom();
}
onFinishClick() {
    this.closeWithAction();
}

}