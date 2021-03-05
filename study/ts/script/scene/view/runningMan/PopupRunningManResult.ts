import PopupBase from "../../../ui/PopupBase";
import PopupRunningManResultCell from "./PopupRunningManResultCell";
import { G_UserData } from "../../../init";
import { RunningManHelp } from "./RunningManHelp";
import { RunningManConst } from "../../../const/RunningManConst";
import { EffectGfxData, EffectGfxType } from "../../../manager/EffectGfxManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRunningManResult extends PopupBase {

   @property({ type: cc.Node, visible: true })
   _panelBase: cc.Node = null;

   @property({ type: cc.Label, visible: true })
   _raceNum: cc.Label = null;

   @property({ type: cc.Node, visible: true })
   _startNode: cc.Node = null;

   @property({ type: cc.Node, visible: true })
   _panelCover: cc.Node = null;

   @property({ type: cc.Node, visible: true })
   _commonContinue: cc.Node = null;

   @property({ type: cc.Prefab, visible: true })
   _runningManResultCellPrefab: cc.Prefab = null;

   protected preloadEffectList: EffectGfxData[] = [
      { type: EffectGfxType.SingleGfx, name: "smoving_saipao_jifenban" }
   ]
   private _runEndList: any[] = [];
   private _runningList: any[] = [];
   private _cells: PopupRunningManResultCell[];

   public init() {
      this._runningList = [];
      this._commonContinue.active = false;
      var lastPos = 0;
      if (this._runningManResultCellPrefab == null) {
         return;
      }
      this._cells = [];
      for (let i = 0; i < 5; i++) {
         var cell = cc.instantiate(this._runningManResultCellPrefab).getComponent(PopupRunningManResultCell);
         cell.init(i + 1);
         lastPos = lastPos - cell.getCellHeight();
         this._startNode.addChild(cell.node);
         cell.node.y = (lastPos);
         cell.node.active = false;
         cell.node.name = ('widgetCell' + (i + 1));
         this._cells.push(cell);
      }
      this.setNotCreateShade(true);
   }

   protected onTouchHandler() {
      if (this._commonContinue.active == true) {
         this.close();
      }
   }

   public onEnter() {
      this._runEndList = [];
      var openTimes = G_UserData.getRunningMan().getOpen_times();
      if (openTimes > 0) {
         var state = RunningManHelp.getRunningState();
         if (state == RunningManConst.RUNNING_STATE_PRE_START) {
            openTimes = openTimes - 1;
         }
         this._raceNum.string = (openTimes + '');
      }
   }

   public updateUI() {
      var runningList = RunningManHelp.getRunningFinishList(this._runEndList);
      if (runningList && runningList.length > this._runningList.length) {
         var newNum = runningList.length;
         var oldNum = this._runningList.length;
         this._runningList = runningList;
         this._playAnimation(oldNum, newNum);
      }
   }

   public onExit() {
   }

   public getHeroId(heroData) {
      if (heroData.isPlayer == 1) {
         return heroData.user.user_id;
      }
      return heroData.heroId;
   }

   public _playAnimation(startIndex, endIndex) {
      for (let i = startIndex; i < endIndex; i++) {
         var cellWidget = this._cells[i];
         if (cellWidget) {
            cellWidget.node.active = true;
            var runningHero = this._runningList[i];
            cellWidget.updateUI(this._runningList[i]);
            cellWidget.playAnimation();
            this._runEndList[this.getHeroId(runningHero)] = runningHero;
         }
      }
      if (endIndex == 5) {
         this._commonContinue.active = true;
      }
   }
}