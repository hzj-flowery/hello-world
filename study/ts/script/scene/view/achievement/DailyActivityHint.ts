const {ccclass, property} = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_ConfigLoader, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { SingleRaceDataHelper } from '../../../utils/data/SingleRaceDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { ArraySort, handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { CampRaceHelper } from '../campRace/CampRaceHelper';
import { CountryBossHelper } from '../countryboss/CountryBossHelper';
import { GuildAnswerHelper } from '../guildAnswer/GuildAnswerHelper';
import { GuildCrossWarHelper } from '../guildCrossWar/GuildCrossWarHelper';
import { WorldBossHelper } from '../worldBoss/WorldBossHelper';
import DailyActivityHintCell from './DailyActivityHintCell';


@ccclass
export default class DailyActivityHint extends ViewBase {

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listView: cc.ScrollView = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _richTextNode: cc.Node = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnGo: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonListViewLineItem,
       visible: true
   })
   _rankRewardListViewItem: CommonListViewLineItem = null;

   private _award1:any;
   private _award2:any;
   private _award3:any;
   private _curSelectCell:number = 1;
   private _curSelectPanelData:any;
   private _datas:Array<any>;
   private _cells:Array<DailyActivityHintCell>;
   private _functionsAwards:any;
   private _timeLimitActivityConfig:any;
   private _isInAction:boolean;
   private _signalSyncBoss:any;
   private _signalEnter:any;



   onLoad() {
    this._curSelectCell = 1;
    this._datas = [];
    this._cells = [];
    this._functionsAwards = {};
    super.onLoad();
}
onCreate() {
    this._timeLimitActivityConfig = G_ConfigLoader.getConfig(ConfigNameConst.TIME_LIMIT_ACTIVITY);
    this._btnGo.setString(Lang.get('common_btn_goto'));
    this._btnGo.addClickEventListenerEx(handler(this,this._onBtnGo))
    this._parseConfigData();
    this._initListView();
    
}

onEnter() {
    this._signalSyncBoss = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(this, this._refreshView));
    this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._refreshView));
    this._refreshView();
}
onExit() {
    this.clearRegisterClock();
    this._signalSyncBoss.remove();
    this._signalSyncBoss = null;
    this._signalEnter.remove();
    this._signalEnter = null;
}

_processConfigSpecial () {
    var getInvalidId = function () {
        var invalidIds = {};
        if (CampRaceHelper.isReplacedBySingleRace() == true) {
            invalidIds[5] = true;
        } else {
            invalidIds[10] = true;
        }
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)[0];
        if (isOpen) {
            invalidIds[2] = true;
        } else {
            invalidIds[13] = true;
        }
        var bOpenToday = GuildCrossWarHelper.isTodayOpen();
        var [bQualification,_] = GuildCrossWarHelper.isGuildCrossWarEntry();
        if (!bOpenToday || !bQualification) {
            invalidIds[15] = true;
        } else {
            invalidIds[7] = true;
        }
        var newRunningManCfg = this._timeLimitActivityConfig.indexOf(17);
        var openServerDays = G_UserData.getBase().getOpenServerDayNum();
        if (openServerDays >= newRunningManCfg.rule) {
            invalidIds[6] = true;
        } else {
            invalidIds[17] = true;
        }
        var startTime = G_UserData.getRunningMan().getStart_time();
        if (startTime == 0) {
            invalidIds[6] = true;
            invalidIds[17] = true;
        }
        return invalidIds;
    };
    var invalidIds = getInvalidId();
    var indexs = this._timeLimitActivityConfig.index();
    for (let id in indexs) {
        var index = indexs[id];
        if (invalidIds[id] == true) {
            indexs[id] = null;
        }
    }
    return indexs;
}
_parseConfigData() {
    var indexs = this._processConfigSpecial();
    for (var k in indexs) {
        var v = indexs[k];
        if(v==null)
        {
            continue;
        }
        var config = this._timeLimitActivityConfig.indexOf(v);
        var singleData:any = {};
        singleData.weeks = {};
        var weeks = config.start_week.split('|');
        for (var j in weeks) {
            var v = weeks[j];
            var day = parseInt(v) || 1;
            singleData.weeks[day] = true;
        }
        //开启和结束时间
        var startTimes = config.start_time.split('|');
        var overTimes = config.finish_time.split('|');
        var times = [];
        for (var j in startTimes) {
            var v = startTimes[j];
            var singleTime:any = {};
            singleTime.startTime = parseInt(v) || 0;
            singleTime.overTime = parseInt(overTimes[j]) || 0;
            table.insert(times, singleTime);
        }
        singleData.times = times;
        singleData.start_des = config.start_des;
        singleData.description = config.description;
        singleData.function_id = config.function_id;
        singleData.title = config.name;
        singleData.id = parseInt(k);
        singleData.awards = [];
        singleData.icon = config.icon;
        var functionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(config.function_id);
      //assert((functionLevelConfig != null, 'can not find function level config ' + config.function_id);
        singleData.openServerTimeOpen = parseInt(functionLevelConfig.day) || 0;
        for (var i = 1; i <= 4; i++) {
            if (config['reward_type' + i]!=null && config['reward_type' + i] != 0) {
                var award:any = {};
                award.type = config['reward_type' + i];
                award.value = config['reward_value' + i];
                table.insert(singleData.awards, award);
            }
        }
        var showDay = config.rule;
        if (showDay > 0) {
            var openServerNum = G_UserData.getBase().getOpenServerDayNum();
            if (openServerNum >= showDay) {
                table.insert(this._datas, singleData);
            }
        } else {
            table.insert(this._datas, singleData);
        }
    }
}
_fixTime() {
    for (var k in this._datas) {
        var v = this._datas[k];
        if (v.function_id == FunctionConst.FUNC_COUNTRY_BOSS) {
            var [startTime, endTime] = G_UserData.getLimitTimeActivity().getStartAndEndTimeByFunctionId(FunctionConst.FUNC_COUNTRY_BOSS);
            var todayZeroTime = G_ServerTime.secondsFromZero();
            startTime = Math.ceil(startTime - todayZeroTime);
            endTime = Math.ceil(endTime - todayZeroTime);
            if (startTime && startTime > 0 && endTime && endTime > 0) {
                v.times = [{
                        startTime: startTime,
                        overTime: endTime
                    }];
            }
        }
    }
}
_getActivityAward(cellData) {
    var functionId = cellData.function_id;
    if (functionId == FunctionConst.FUNC_WORLD_BOSS) {
        if (!this._functionsAwards[functionId]) {
            this._functionsAwards[functionId] = WorldBossHelper.getPreviewRewards() || {};
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_GUILD_ANSWER) {
        if (!this._functionsAwards[functionId]) {
            var awards = GuildAnswerHelper.getPreviewRankRewards(G_UserData.getGuildAnswer().getRandomAward());
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_GUILD_DUNGEON) {
        if (!this._functionsAwards[functionId]) {
            let awards = UserDataHelper.getGuildDungeonPreviewRewards();
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_COUNTRY_BOSS) {
        if (!this._functionsAwards[functionId]) {
            var awards = CountryBossHelper.getPreviewRankRewards();
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_CAMP_RACE) {
        if (!this._functionsAwards[functionId]) {
            var awards = CampRaceHelper.getPreviewRankRewards();
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_GUILD_WAR) {
        if (!this._functionsAwards[functionId]) {
            let awards = GuildWarDataHelper.getGuildWarPreviewRewards();
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_SINGLE_RACE) {
        if (!this._functionsAwards[functionId]) {
            var awards = SingleRaceDataHelper.getPreviewRankRewards();
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else if (functionId == FunctionConst.FUNC_GUILD_SERVER_ANSWER) {
        if (!this._functionsAwards[functionId]) {
            var awards = GuildAnswerHelper.getPreviewRankRewards(G_UserData.getGuildServerAnswer().getRandomAward());
            this._functionsAwards[functionId] = awards;
        }
        return this._functionsAwards[functionId];
    } else {
        return cellData.awards;
    }
}
refreshDataAndRegisterClock() {
    this._fixTime();
    var date = G_ServerTime.getDateObject();
    var day = date.getDay();
    if (day == 0) {
        day = 7;
    }
    var tomorrowDay = day+1;
    if(tomorrowDay>7) 
    tomorrowDay = tomorrowDay % 7;

    var curTodayTime = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    var openServerNum = G_UserData.getBase().getOpenServerDayNum();
    var todayZeroTime = G_ServerTime.getTime() - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds();
    for (var k in this._datas) {
        var v = this._datas[k];
        var isTodayOpen = v.weeks[day];
        var isTomorrowOpen = v.weeks[tomorrowDay];
        v.isTodayOpen = isTodayOpen && v.openServerTimeOpen <= openServerNum;
        v.isTomorrowOpen = isTomorrowOpen && v.openServerTimeOpen <= openServerNum + 1;
        v.startTime = 0;
        v.overTime = 0;
        v.isTodayEnd = false;
        if (isTodayOpen) {
            var clockTime = 0;
            var curTimeIndex = null;
            var isOpenIng = false;
            for (var i in v.times) {
                var j = v.times[i];
                if (curTodayTime <= j.overTime) {
                    curTimeIndex = i;
                    if (curTodayTime < j.startTime) {
                        clockTime = todayZeroTime + j.startTime;
                    } else {
                        isOpenIng = true;
                        clockTime = todayZeroTime + (j.overTime + 1);
                    }
                    break;
                }
            }
            if (clockTime != 0) {
                G_ServiceManager.registerOneAlarmClock('DailyActivityHint_' + k, clockTime, function () {
                    if (this._datas) {
                        this._refreshView();
                    }
                });
            }
            if (curTimeIndex!=null) {
                v.startTime = v.times[curTimeIndex].startTime;
                v.overTime = v.times[curTimeIndex].overTime;
                v.isOpenIng = isOpenIng;
                v.isTodayEnd = false;
            } else {
                v.isOpenIng = isOpenIng;
                v.isTodayEnd = true;
            }
        } else {
            v.startTime = v.times[0].startTime;
            v.overTime = v.times[0].overTime;
        }
    }
    ArraySort(this._datas, function (a, b) {
        if (a.isTodayOpen == b.isTodayOpen) {
            if (a.isTodayOpen) {
                if (a.isTodayEnd == b.isTodayEnd) {
                    if (a.startTime == b.startTime) {
                        return parseInt(a.id) < parseInt(b.id);
                    } else {
                        return a.startTime < b.startTime;
                    }
                } else {
                    return a.isTodayEnd != true;
                }
            } else {
                if (a.isTomorrowOpen == b.isTomorrowOpen) {
                    if (a.startTime == b.startTime) {
                        return parseInt(a.id) < parseInt(b.id);
                    } else {
                        return a.startTime < b.startTime;
                    }
                } else {
                    return a.isTomorrowOpen == true;
                }
            }
        } else {
            return a.isTodayOpen == true;
        }
    });
}
clearRegisterClock() {
    for (var k in this._datas) {
        var _ = this._datas[k];
        G_ServiceManager.DeleteOneAlarmClock('DailyActivityHint_' + k);
    }
}
refreshCells() {
    this._curSelectCell = null;
    if (this._curSelectPanelData) {
        for (var k in this._datas) {
            var v = this._datas[k];
            if (v.id == this._curSelectPanelData.id) {
                this._curSelectCell = parseInt(k)+1;
                break;
            }
        }
    }
    if (this._curSelectCell) {
        // this._listView = this._listView.setBounceEnabled(false);
        // this._listView = this._listView.jumpToItem(this._curSelectCell - 1, cc.p(0, 0), cc.p(0, 0));
        // this._listView = this._listView.setBounceEnabled(true);
    } else {
        this._curSelectPanelData = this._datas[0];
        this._curSelectCell = 1;
    }
    this._isInAction = null;
    for (k in this._datas) {
        var v = this._datas[k];
        var cell = this._cells[k];
        cell.node.stopAllActions();
        cell.updateUI(v, this._curSelectCell);
    }
    if (this._curSelectPanelData) {
        this._showBtnGoRedPoint(this._curSelectPanelData.function_id);
    }
}
_initListView() {
    this._listView.content.width = 0;
    for (var k in this._datas) {
        var v = this._datas[k];
        var cell = (cc.instantiate(cc.resources.get(Path.getPrefab("DailyActivityHintCell","achievement"))) as cc.Node).getComponent(DailyActivityHintCell)
        cell.setInitData(parseInt(k)+1, handler(this, this._onSelcetPanel));
        this._listView.content.width = this._listView.content.width+cell.node.width;
        this._listView.content.addChild(cell.node);
        table.insert(this._cells, cell);
    }
    if (this._datas[0]) {
        this._showBtnGoRedPoint(this._datas[0].function_id);
    }
}
_onSelcetPanel(index) {
    if (this._isInAction) {
        return;
    }
    if (index == this._curSelectCell) {
        return;
    }
    this._curSelectPanelData = this._datas[index-1];
    this._isInAction = true;
    var oldCell = this._cells[this._curSelectCell-1];
    if (oldCell) {
        oldCell.playActionOut(0.15, false);
    }
    this._curSelectCell = index;
    var newCell = this._cells[this._curSelectCell-1];
    if (newCell) {
        newCell.playActionIn(0.15, function () {
            this._isInAction = null;
        }.bind(this));
    }
    this.refreshPanel();
    if (this._curSelectPanelData) {
        this._showBtnGoRedPoint(this._curSelectPanelData.function_id);
    }
}
_updateAwards(rewards) {
    this._rankRewardListViewItem.updateUI(rewards, 1);
    this._rankRewardListViewItem.setMaxItemSize(5);
    this._rankRewardListViewItem.setListViewSize(580, 100);
    this._rankRewardListViewItem.setItemsMargin(2);
}
refreshPanel() {
    var cellData = this._datas[this._curSelectCell-1];
    if (!cellData) {
        return;
    }
    this._richTextNode.removeAllChildren();
    var richtext = RichTextExtend.createRichTextByFormatString2(cellData.description, Colors.DARK_BG_ONE, 20);
    // richtext.ignoreContentAdaptWithSize(false);
    // richtext.setVerticalSpace(4);
    richtext.node.setAnchorPoint(cc.v2(0, 1));
    richtext.maxWidth = 630;
    this._richTextNode.addChild(richtext.node);
    var awards = this._getActivityAward(cellData);
    this._updateAwards(awards);
}
_onBtnGo() {
    var cellData = this._datas[this._curSelectCell-1];
    if (!cellData) {
        return;
    }
    WayFuncDataHelper.gotoModuleByFuncId(cellData.function_id);
}

onReEnterModule() {
    this._refreshView();
}
_refreshView() {
    this.scheduleOnce(this.refreshDataAndRegisterClock,1/60);
    this.scheduleOnce(this.refreshCells,2/60);
    this.scheduleOnce(this.refreshPanel,3/60);
}
_showBtnGoRedPoint(funcId) {
    var redImg = this._btnGo.node.getChildByName('RedPoint');
    if (!redImg) {
        redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
        redImg.name = ('RedPoint');
        redImg.setPosition(10, 10);
        this._btnGo.node.addChild(redImg);
    }
    if (funcId == FunctionConst.FUNC_CAMP_RACE) {
        var showCmpRaceRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
        redImg.active = (showCmpRaceRedPoint);
    } else {
        redImg.active = (false);
    }
}


}