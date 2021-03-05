const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData, Colors, G_ConfigLoader } from '../../../init';
import { DailyDungeonConst } from '../../../const/DailyDungeonConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { DailyDungeonCheck } from '../../../utils/logic/DailyDungeonCheck';
import { DropHelper } from '../../../utils/DropHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import { ConfigNameConst } from '../../../const/ConfigNameConst';

@ccclass
export default class PopupDailyChooseCell extends ListViewCellBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _nodeBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _reward: CommonResourceInfo = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textReward: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDetail: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDiff: cc.Sprite = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _btnFight: CommonButtonLevel1Normal = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _btnSweep: CommonButtonLevel1Normal = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLock: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeLock: cc.Node = null;


   _isOpen:boolean;
   _isEntered:boolean;
   _info:any;
   _drop:any;

    ctor(idx) {
        this._isOpen = false;
        this._isEntered = false;
        UIHelper.addEventListener(this.node, this._btnFight._button, 'PopupDailyChooseCell', '_fightClick');
        UIHelper.addEventListener(this.node, this._btnSweep._button, 'PopupDailyChooseCell', '_onSweepBtnClick');
        this.node.name = ('PopupDailyChooseCell' + idx);

        this._imageDiff.node.active = (false);
        this._textDetail.node.active = (false);
        this._btnFight.setTxtVisible(false);
        this._btnFight.setString(Lang.get('challenge_button'));
        this._btnSweep.setString(Lang.get('challenge_daily_sweep'));
    }
    onInit() {
        var size = this._nodeBG.node.getContentSize();
        this.node.setContentSize(size);
    }
    isEntered() {
        return G_UserData.getDailyDungeonData().isDungeonEntered(this._info.type, this._info.id);
    }
    refreshData(info?) {
        if (info) {
            this._info = info;
        }
        this._isEntered = G_UserData.getDailyDungeonData().isDungeonEntered(this._info.type, this._info.id);
        this._refreshCell();
        this._refreshTitleAndSword();
        this._refreshDrop();
    }
    _refreshTitleAndSword() {
        this._textTitle.string = (this._info.difficulty);
        var colorInfo = Colors.getDailyChooseColor(this._info.color);
        this._textTitle.node.color = (colorInfo.color);
        UIHelper.enableOutline(this._textTitle, colorInfo.outlineColor, 2);
        //var titleColor = this._info.color;
    }
    _refreshCell() {
        var bg = Path.getDailyChallengeIcon('img_difficulty0' + this._info.color);
        if (this._info.difficulty == '傲世') {
            bg = Path.getDailyChallengeIcon('img_difficulty07');
        } else if (this._info.difficulty == '至尊') {
            bg = Path.getDailyChallengeIcon('img_difficulty08');
        }
        UIHelper.loadTexture(this._nodeBG, bg);
        var myLevel = G_UserData.getBase().getLevel();
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        if (this._info.pre_id != 0 && this._info.pre_id > G_UserData.getDailyDungeonData().getMaxIdByType(this._info.type)) {
            this._isOpen = false;
            var preInfo = DailyDungeon.get(this._info.pre_id);
            var strDiff = preInfo.difficulty;
            this._btnFight.setEnabled(true);
            this._btnFight.setTouchEnabled(false);
            this._textReward.node.active = (false);
            this._reward.node.active = (false);
            this._textDetail.node.active = (true);
            this._textDetail.string = (Lang.get('challenge_open_pre', { str: strDiff }));
        } else if (myLevel < this._info.level) {
            this._isOpen = false;
            this._btnFight.setEnabled(true);
            this._btnFight.setTouchEnabled(false);
            this._textReward.node.active = (false);
            this._reward.node.active = (false);
            this._textDetail.node.active = (true);
            this._textDetail.string = (Lang.get('challenge_open_level', { count: this._info.level }));
        } else if (this._isEntered) {
            this._isOpen = true;
            this._btnFight.setEnabled(true);
            this._btnFight.setTouchEnabled(true);
            this._textReward.node.active = (true);
            this._reward.node.active = (true);
            this._textDetail.node.active = (false);
            this._showLock(false);
            this._btnFight.setTxtVisible(true);
        }
        var pass = this._info.id <= G_UserData.getDailyDungeonData().getMaxIdByType(this._info.type);
        var isSweepOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_DAILY_STAGE_SWEEP)[0];
        if (pass && isSweepOpen) {
            this._btnSweep.setVisible(true);
            this._btnFight.setVisible(false);
        } else {
            this._btnSweep.setVisible(false);
            this._btnFight.setVisible(true);
        }
    }
    _showLock(s) {
        this._imageLock.node.active = (s);
    }
    _refreshDrop() {
        var drop = DropHelper.getDailyDrop(this._info);
        this._reward.updateUI(drop.type, drop.value, drop.size);
        this._reward.setTextColorToDTypeColor();
        this._drop = drop;
    }
    isOpen() {
        return this._isOpen;
    }
    _fightClick(event, customEventData) {
        // var sender = event.target;
        // var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        // var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        // if (offsetX < 20 && offsetY < 20) {
            this._executeStage();
        //}
    }
    _onSweepBtnClick(event, customEventData) {
        // var sender = event.target;
        // var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        // var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        // if (offsetX < 20 && offsetY < 20) {
            this._executeSweep();
        //}
    }
    _executeStage() {
        var [bagFull] = LogicCheckHelper.isPackFull(this._drop.type, this._drop.value);
        if (bagFull) {
            return;
        }
        var [success, popFunc] = DailyDungeonCheck.isDailyDungeonCanFight(this._info.type, true);
        if (!success) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
        G_UserData.getDailyDungeonData().c2sExecuteDailyDungeon(this._info.id, DailyDungeonConst.OP_TYPE_CHALLENGE);
    }
    _executeSweep() {
        var [bagFull] = LogicCheckHelper.isPackFull(this._drop.type, this._drop.value);
        if (bagFull) {
            return;
        }
        var [success, popFunc] = DailyDungeonCheck.isDailyDungeonCanFight(this._info.type, true);
        if (!success) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
        G_UserData.getDailyDungeonData().c2sExecuteDailyDungeon(this._info.id, DailyDungeonConst.OP_TYPE_SWEEP);
    }
    playOpenEft() {
        this._imageLock.node.active = (false);
        this._btnFight.setTxtVisible(true);
        this.refreshData();
        var name = this.node.name;
        // this.scheduleOnce(function () {
        //     G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, name);
        // }, 0.5);
     }
    getDungeonId() {
        return this._info.id;
    }

}
