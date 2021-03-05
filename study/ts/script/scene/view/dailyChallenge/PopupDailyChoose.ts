const { ccclass, property } = cc._decorator;

import CommonNormalLargePop2 from '../../../ui/component/CommonNormalLargePop2'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_ConfigLoader, G_SignalManager, G_SceneManager } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DailyDungeonData } from '../../../data/DailyDungeonData';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { DailyDungeonConst } from '../../../const/DailyDungeonConst';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import PopupDailyChooseCell from './PopupDailyChooseCell';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupDailyChoose extends PopupBase {

    @property({
        type: CommonNormalLargePop2,
        visible: true
    })
    _panelBase: CommonNormalLargePop2 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listChoose: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    chooseCell: cc.Prefab = null;

    _type: number;
    _maxId: number;
    _firstEnterId: number;
    _name: string;
    _data: DailyDungeonData;
    _idList: any[];
    _cellList: any[];
    _singalFirstrEnterDaily: any;
    _singalExecute: any;
    _signalCommonZeroNotice: any;
    _signalDailyDungeonEnter: any;

    public static path: string = 'dailyChallenge/PopupDailyChoose';

    ctor(data) {
        this._type = data.id;
        this._name = data.name;
        this._data = G_UserData.getDailyDungeonData();
        this._data.setNowType(this._type);
        this._maxId = this._data.getMaxIdByType(this._type);
        this._firstEnterId = this._data.getFirstEnter(this._type);
        this._idList = this._getStageIds();
        this._cellList = [];
        this._singalFirstrEnterDaily = null;
        this._singalExecute = null;
        this.node.name = ('PopupDailyChoose');
    }

    getCell1() {
        return this._listChoose.content.getChildByName("PopupDailyChooseCell1").getComponent(PopupDailyChooseCell);
    }
    onCreate() {
        this._panelBase.addCloseEventListener(handler(this, this._onCloseClick));
        if(this._name.length==2)
        {
           this._panelBase.setTitle(this._name[0]+" "+this._name[1]);
        }
        else
        {
            this._panelBase.setTitle(this._name);
        }
        var remainCount = this._data.getRemainCount(this._type);
        this._textCount.string = (remainCount);
    }
    onEnter() {
        this._singalFirstrEnterDaily = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_FIRSTENTER, handler(this, this._onEventFirstEnter));
        this._singalExecute = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_EXECUTE, handler(this, this._onEventExecute));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        this._signalDailyDungeonEnter = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_ENTER, handler(this, this._onEventDailyDungeonEnter));

        this._refreshCount();
        this._refreshChooseList();
        this._checkFirstEnter();

        var touchPanel = this.node.getChildByName('touchPanel').getComponent(cc.Button);
        UIHelper.addEventListener(this.node, touchPanel, 'PopupDailyChoose', '_onCloseClick');

        this.scheduleOnce(()=>{
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        },0.3);
    }
    onExit() {
        this._singalFirstrEnterDaily.remove();
        this._singalFirstrEnterDaily = null;
        this._singalExecute.remove();
        this._singalExecute = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
        this._signalDailyDungeonEnter.remove();
        this._signalDailyDungeonEnter = null;
    }
    _refreshCount() {
        var remainCount = this._data.getRemainCount(this._type);
        this._textCount.string = (remainCount);
    }
    _checkFirstEnter() {
        this._maxId = this._data.getMaxIdByType(this._type);
        var nextId = this._getNextId(this._maxId);
        if (!nextId) {
            return;
        }
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        var myLevel = G_UserData.getBase().getLevel();
        if (myLevel >= DailyDungeon.get(nextId).level && this._data.getFirstEnter(this._type) < nextId) {
            this._data.c2sFirstEnterDailyDungeon(nextId);
        }
    }
    _refreshChooseList() {
        var openIdx = 0;
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        for (var idx = 1; idx <= this._idList.length; idx++) {
            var val = this._idList[idx - 1];
            if (!this._cellList[idx - 1]) {
                var info = DailyDungeon.get(val);
                var cell = cc.instantiate(this.chooseCell).getComponent(PopupDailyChooseCell);
                cell.ctor(idx);
                cell.refreshData(info);
                this._listChoose.pushBackCustomItem(cell.node);
                this._cellList[idx - 1] = cell;
            } else {
                this._cellList[idx - 1].refreshData();
            }
            if (this._cellList[idx - 1].isOpen()) {
                openIdx = idx - 1;
            }
        }
        if (this._cellList.length - openIdx < 4) {
            //this._listChoose.jumpToRight();
        } else if (openIdx < 2) {
            //this._listChoose.jumpToLeft();
        } else {
            //this._listChoose.jumpToItem(openIdx, cc.v2(0.5, 0), cc.v2(0.5, 0));
        }
    }
    _onCloseClick() {
        this.closeWithAction();
    }
    _getStageIds() {
        var ids = [];
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        var DailyDungeonCount = DailyDungeon.length();
        for (var i = 1; i <= DailyDungeonCount; i++) {
            var info = DailyDungeon.indexOf(i - 1);
            if (info.type == this._type) {
                ids.push(info.id);
            }
        }
        ids.sort(function (a, b) {
            return a - b;
        }.bind(this));
        return ids;
    }
    _getNextId(id) {
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        for (var i = 0; i < this._idList.length; i++) {
            var val = this._idList[i];
            var info = DailyDungeon.get(val);
            if (info.pre_id == id) {
                return info.id;
            }
        }
    }
    _onEventFirstEnter(eventName, enterId) {
        for (let i in this._cellList) {
            var v = this._cellList[i];
            if (v.getDungeonId() == enterId) {
                v.playOpenEft();
                break;
            }
        }
    }
    _onEventExecute(eventName, message) {
        var fightId = message.id;
        var opType = message.op_type;
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        var configData = DailyDungeon.get(fightId);
        if (opType == DailyDungeonConst.OP_TYPE_SWEEP) {
            this._refreshCount();
            this._refreshChooseList();
            PopupGetRewards.showRewards(message.awards);
            return;
        }
        var reportData = ReportParser.parse(message.battle_report);
        var battleData = BattleDataHelper.parseChallengeDailyData(message, configData);
        G_SceneManager.showScene('fight', reportData, battleData);
    }
    _onEventCommonZeroNotice(event, hour) {
        G_UserData.getDailyDungeonData().pullData();
    }
    _onEventDailyDungeonEnter(event) {
        this._refreshCount();
        this._refreshChooseList();
    }
}
