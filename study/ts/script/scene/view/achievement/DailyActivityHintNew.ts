
const {ccclass, property} = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { MessageIDConst } from '../../../const/MessageIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_ConfigLoader, G_SceneManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { SignalManager } from '../../../manager/SignalManager';
import { NetworkManager } from '../../../network/NetworkManager';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonUI from '../../../ui/component/CommonUI';
import PopupWorldBossVote from '../../../ui/PopupWorldBossVote';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { SingleRaceDataHelper } from '../../../utils/data/SingleRaceDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { assert } from '../../../utils/GlobleFunc';
import { ArraySort, handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { CampRaceHelper } from '../campRace/CampRaceHelper';
import { CountryBossHelper } from '../countryboss/CountryBossHelper';
import { CrossWorldBossHelperT } from '../crossWorldBoss/CrossWorldBossHelperT';
import GrainCarConfigHelper from '../grainCar/GrainCarConfigHelper';
import { GuildAnswerHelper } from '../guildAnswer/GuildAnswerHelper';
import { GuildCrossWarHelper } from '../guildCrossWar/GuildCrossWarHelper';
import { WorldBossHelper } from '../worldBoss/WorldBossHelper';
import DailyActivityHintCell from './DailyActivityHintCell';
import DailyActivityHintCellNew from './DailyActivityHintCellNew';



var nameConfig = {
    "军团BOSS":"icon_activity_guildboss2_txt",
    "三国战记":"icon_activity_threecountrybattle2_txt",
    "阵营竞技":"icon_activity_campbattle2_txt",
    "华容道":"icon_activity_runway2_txt",
    "军团战":"icon_activity_guildbattle3_txt",
    "军团试炼":"icon_activity_guildpve2_txt",
    "王者之战":"icon_activity_fight2_txt",
    "先秦皇陵":"icon_activity_qintomb2_txt",
    "跨服军团战":"icon_activity_guildbattle4_txt",
    "跨服个人竞技":"icon_activity_campbattle4_txt",
    "军团答题":"icon_activity_answer2_txt",
    "全服答题":"icon_activity_serveranswer2_txt",
    "暗度陈仓":"icon_activity_anduchengcang2_txt",
    "跨服BOSS":"icon_activity_crossguildboss2_txt"
}
var bgConfig = {
    "军团BOSS":"icon_activity_guildboss2",
    "三国战记":"icon_activity_threecountrybattle2",
    "阵营竞技":"icon_activity_campbattle2",
    "华容道":"icon_activity_runway2",
    "军团战":"icon_activity_guildbattle3",
    "军团试炼":"icon_activity_guildpve2",
    "王者之战":"icon_activity_fight2",
    "先秦皇陵":"icon_activity_qintomb2",
    "跨服军团战":"icon_activity_guildbattle4",
    "跨服个人竞技":"icon_activity_campbattle4",
    "军团答题":"icon_activity_answer2",
    "全服答题":"icon_activity_serveranswer2",
    "暗度陈仓":"icon_activity_anduchengcang2",
    "跨服BOSS":"icon_activity_crossguildboss2"
}

@ccclass
export default class DailyActivityHintNew extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgActivityBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelActivityName: cc.Label = null;

    

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

    @property({
        type: CommonListView,
        visible: true
    })
    _commonListView: CommonListView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _openTime1: cc.Label = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _DailyActivityHintCellNew: cc.Prefab = null;

   private _award1:any;
   private _award2:any;
   private _award3:any;
   private _curSelectCell:number = 1;
   private _curSelectPanelData:any;
   private _datas:Array<any>;
   private _functionsAwards:any;
   private _timeLimitActivityConfig:any;
   private _signalSyncBoss:any;
   private _signalEnter:any;
   private _signalWorldBossVote:any;
   private _signalCrossWorldBossVote:any;



   onLoad() {
    this._curSelectCell = 1;
    this._datas = [];
    this._functionsAwards = {};
    super.onLoad();
}
onCreate() {
    this._timeLimitActivityConfig = G_ConfigLoader.getConfig(ConfigNameConst.TIME_LIMIT_ACTIVITY);
    this._btnGo.setString(Lang.get('common_btn_goto'));
    this._btnGo.addClickEventListenerEx(handler(this,this._onBtnGo))
    this._parseConfigData();
    
    NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetSingleRacePkInfo] = true;
    NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetGuildDungeon] = true;
    G_UserData.getSingleRace().c2sGetSingleRacePkInfo();
    G_UserData.getGuildDungeon().c2sGetGuildDungeon();
}

onEnter() {
    this._signalSyncBoss = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(this, this._refreshView));
    this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._refreshView));
    this._signalWorldBossVote = G_SignalManager.add(SignalConst.EVENT_WORLD_BOSS_VOTE_SUCCESS,handler(this,this._eventWorldBossSuccess));
    this._signalCrossWorldBossVote = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLD_BOSS_VOTE_SUCCESS,handler(this,this._eventCrossWorldBossSuccess));
    
    
    this.scheduleOnce(()=>{
        this._refreshView();
        this._initListView();
    })
    this.scheduleOnce(()=>{
        NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetSingleRacePkInfo] = null;
        NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetGuildDungeon] = null;
    },0.1);
    
}
onExit() {
    this.clearRegisterClock();
    this._signalSyncBoss.remove();
    this._signalSyncBoss = null;
    this._signalEnter.remove();
    this._signalEnter = null;
    this._signalWorldBossVote.remove();
    this._signalWorldBossVote = null;
    this._signalCrossWorldBossVote.remove();
    this._signalCrossWorldBossVote = null;
    NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetSingleRacePkInfo] = null;
    NetworkManager.FILTER_LIST_RET[MessageIDConst.ID_S2C_GetGuildDungeon] = null;
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
    }.bind(this);
    var invalidIds = getInvalidId();
    var indexs = this._timeLimitActivityConfig.index();
    for (var id in indexs) {
        var index = indexs[id];
        if (invalidIds[id] == true) {
            indexs[id] = null;
        }
    }
    return indexs;
}
_parseConfigData() {
    var crossBossShowDay = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_CROSS_WORLD_BOSS).day;
    var openServerNum = G_UserData.getBase().getOpenServerDayNum();
    var indexs = this._processConfigSpecial();
    for (let k in indexs) {
        var v = indexs[k];
        if(v==null)
        {
            continue;
        }
        var config = this._timeLimitActivityConfig.indexOf(v);
        var singleData:any = {};
        singleData.weeks = {};
        var weeks = config.start_week.split('|');
        for (k in weeks) {
            var v = weeks[k];
            var day = parseInt(v) || 1;
            singleData.weeks[day] = true;
        }
        var startTimes = config.start_time.split( '|');
        var overTimes = config.finish_time.split( '|');
        var times = [];
        for (k in startTimes) {
            var v = startTimes[k];
            var singleTime:any = {};
            singleTime.startTime = parseInt(v) || 0;
            singleTime.overTime = parseInt(overTimes[k]) || 0;
            table.insert(times, singleTime);
        }
        singleData.times = times;
        singleData.start_des = config.start_des;
        singleData.description = config.description;
        singleData.function_id = config.function_id;
        singleData.reward_description = config.reward_description;
        singleData.title = config.name;
        singleData.id = k;
        singleData.awards = [];
        singleData.icon = config.icon;
        var functionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(config.function_id);
        assert(functionLevelConfig != null, 'can not find function level config ' + config.function_id);
        singleData.openServerTimeOpen = parseInt(functionLevelConfig.day) || 0;
        for (var i = 1; i <= 4; i++) {
            if (config['reward_type' + i] && config['reward_type' + i] != 0) {
                var award:any = {};
                award.type = config['reward_type' + i];
                award.value = config['reward_value' + i];
                table.insert(singleData.awards, award);
            }
        }
        if (config.id == 1 && crossBossShowDay <= openServerNum && LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)[0]) {
        } else {
            var showDay = config.rule;
            if (showDay > 0) {
                if (openServerNum >= showDay) {
                    table.insert(this._datas, singleData);
                }
            } else {
                table.insert(this._datas, singleData);
            }
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
        } else if (functionId == FunctionConst.FUNC_GUILD_CROSS_WAR) {
            if (!this._functionsAwards[functionId]) {
                let awards = GuildCrossWarHelper.getLimitAwards();
                this._functionsAwards[functionId] = awards;
            }
            return this._functionsAwards[functionId];
        } else if (functionId == FunctionConst.FUNC_CROSS_WORLD_BOSS) {
            if (!this._functionsAwards[functionId]) {
                var bossInfo = CrossWorldBossHelperT.getBossInfo();
                let awards = {};
                if (bossInfo) {
                    awards = CrossWorldBossHelperT.getPreviewRewards();
                } else {
                    awards = CrossWorldBossHelperT.getAllBossPreviewRewards();
                }
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

        if(v.function_id==FunctionConst.FUNC_WORLD_BOSS)
        {
            let isInTime = G_UserData.getCrossWorldBoss().isTimeCanOpen();
            //有boss则表示今天开启
            //没有boss则表示不开启
            if(isInTime)
            {
                //此时跨服boss也可以开启
                //两者只能开启一个
                isTodayOpen = !G_UserData.getCrossWorldBoss().isHaveBoss();
            }
        }

        if(v.function_id==FunctionConst.FUNC_CROSS_WORLD_BOSS)
        {
            //必须服务端下发boss才可以
            isTodayOpen = G_UserData.getCrossWorldBoss().isHaveBoss();
        }

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


    //从小到大排序
    ArraySort(this._datas, function (a, b) {
        if (a.isTodayOpen == b.isTodayOpen) {
            //a和b 今天开启
            if (a.isTodayOpen) {
                //a今天开启
                if (a.isTodayEnd == b.isTodayEnd) {
                    //a和b都是今天结束
                    if(a.function_id==FunctionConst.FUNC_GRAIN_CAR&&!a.isOpenIng&&!a.isTodayEnd&&!b.isOpenIng)
                    {
                        //暗度陈仓
                        return true;
                    }
                    else if(b.function_id==FunctionConst.FUNC_GRAIN_CAR&&!b.isOpenIng&&!b.isTodayEnd&&!a.isOpenIng)
                    {
                        //暗度陈仓
                        return false;
                    }
                    if(a.function_id==FunctionConst.FUNC_CAMP_RACE&&!a.isOpenIng&&!a.isTodayEnd&&!b.isOpenIng)
                    {
                        //暗度陈仓
                        return true;
                    }
                    else if(b.function_id==FunctionConst.FUNC_CAMP_RACE&&!b.isOpenIng&&!b.isTodayEnd&&!a.isOpenIng)
                    {
                        //暗度陈仓
                        return false;
                    }
                    else if(a.function_id==FunctionConst.FUNC_WORLD_BOSS&& G_UserData.getWorldBoss().isCanVote())
                    {
                        //军团boss
                        return true;
                    }
                    else if(a.function_id==FunctionConst.FUNC_CROSS_WORLD_BOSS&&G_UserData.getCrossWorldBoss().isCanVote())
                    {
                        //跨服boss
                        return true;
                    }
                    else if(b.function_id==FunctionConst.FUNC_WORLD_BOSS&& G_UserData.getWorldBoss().isCanVote())
                    {
                        //军团boss
                        return false;
                    }
                    else if(b.function_id==FunctionConst.FUNC_CROSS_WORLD_BOSS&&G_UserData.getCrossWorldBoss().isCanVote())
                    {
                        //跨服boss
                        return false;
                    }
                    else if (a.startTime == b.startTime) {
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
        } 
        else {
            return (a.isTodayOpen == true);
        }
    });
    
}

/**
 * 暗度成仓是否开启
 */
private isAnDuChengCangOpen():boolean{
    if (!GrainCarConfigHelper.isInActivityTimeFromGenerate()) {
        return false;
    }
    if (G_UserData.getGuild().getMyGuildId() == 0) {
        return false;
    }
    if (G_UserData.getGrainCar().isActivityOver()) {
        return false;
    }
    if (G_UserData.getGrainCar().isEmergencyClose()) {
        return false;
    }
    return true;
}

clearRegisterClock() {
    for (var k in this._datas) {
        var _ = this._datas[k];
        G_ServiceManager.DeleteOneAlarmClock('DailyActivityHint_' + k);
    }
}
_initListView() {
    this._commonListView.scrollView.content.y = 520;
    this._commonListView.spawnCount = 6;
    this._commonListView.init(cc.instantiate(this._DailyActivityHintCellNew), handler(this, this._onDailyItemUpdate), handler(this, this._onSelcetPanel));
    this._commonListView.resize(this._datas.length);
    
    if (this._datas[0]) {
        this._showBtnGoRedPoint(this._datas[0].function_id);
    }
}
_onDailyItemUpdate(item: CommonListItem, index) {
    var data = this._datas[index];
    item.updateItem(index, data != null ? [data,this._curSelectCell-1] : null);
}
_onSelcetPanel(index, missonId) {
    var indexNew = index + 1;
    if (indexNew == this._curSelectCell) {
        return;
    }
    this._curSelectPanelData = this._datas[indexNew-1];
    this._curSelectCell = indexNew;

    var childRen = this._commonListView.scrollView.content.children;
    for(let i = 0;i<childRen.length;i++)
    {
          let cp = childRen[i].getComponent(DailyActivityHintCellNew);
          cp.setHighlight(false);
    }
    this.refreshPanel();
    if (this._curSelectPanelData) {
        this._showBtnGoRedPoint(this._curSelectPanelData.function_id);
    }
}
_updateAwards(rewards) {
    this._rankRewardListViewItem.updateUI_V(rewards, 1,4);
    // this._rankRewardListViewItem.setMaxItemSize(5);
    // this._rankRewardListViewItem.setListViewSize(580, 100);
    // this._rankRewardListViewItem.setItemsMargin(2);
}
refreshPanel() {
    var cellData = this._datas[this._curSelectCell-1];
    if (!cellData) {
        return;
    }
    var awards = this._getActivityAward(cellData);
    this._updateAwards(awards);
    this._labelActivityName.string = cellData.title;
    var comm2 =  this._imgActivityBg.node.getComponent(CommonUI);
    if(!comm2)
    {
        this._imgActivityBg.node.addComponent(CommonUI).loadTexture(Path.getAchievementIconBg(bgConfig[cellData.title]));
    }
    else
    {
        comm2.loadTexture(Path.getAchievementIconBg(bgConfig[cellData.title]));
    }
    var timeDes = cellData.start_des;
    if (cellData.isTodayOpen) {
        if (cellData.isTodayEnd) {
            if (cellData.isTomorrowOpen) {
                timeDes = (Lang.get('lang_time_limit_activity_today_end'));
            } else {
                timeDes = (cellData.start_des);
            }
        } else {
            if (cellData.isOpenIng) {
                timeDes = (Lang.get('lang_time_limit_activity_ing'));
            } else {
                var hour = Math.floor(cellData.startTime / 3600);
                var min = Math.floor(cellData.startTime % 3600 / 60);
                var timeStr: string = "";
                if (hour < 10)
                    timeStr = "0" + hour;
                else
                    timeStr = hour + "";
                if (min < 10)
                    timeStr = timeStr + ":0" + min;
                else
                    timeStr = timeStr + ":" + min;
                timeDes = (Lang.get('lang_time_limit_activity_open_time', { time: timeStr }));
            }
        }
    } else {
        if (cellData.openServerTimeOpen > 0) {
            var openServerNum = G_UserData.getBase().getOpenServerDayNum();
            var leftDay = cellData.openServerTimeOpen - openServerNum;
            if (leftDay > 0) {
                timeDes = (Lang.get('lang_time_limit_activity_open_server_time', { num: leftDay }));
            } else {
                timeDes = (cellData.start_des);
            }
        } else {
            
            timeDes = (cellData.start_des);
        }
    }

    this._openTime1.string =  timeDes;

}
_onBtnGo() {
    var cellData = this._datas[this._curSelectCell-1];
    if (!cellData) {
        return;
    }
    WayFuncDataHelper.gotoModuleByFuncId(cellData.function_id, "DailyActivityHint");
}

onReEnterModule() {
    this._refreshView();
}
_eventWorldBossSuccess():void{
    //弹窗 报名成功
    //-----------------
    G_SceneManager.openPopup(Path.getCommonPrefab("PopupWorldBossVote"),function(pop:PopupWorldBossVote){
        pop.setType(1);
        pop.openWithAction();
    });
    this._refreshView();
}
_eventCrossWorldBossSuccess():void{
    //弹窗 报名成功
    //-----------------
    G_SceneManager.openPopup(Path.getCommonPrefab("PopupWorldBossVote"),function(pop:PopupWorldBossVote){
        pop.setType(2);
        pop.openWithAction();
    });
    this._refreshView();
}
_refreshView() {
    this.refreshDataAndRegisterClock();
    this.refreshPanel();
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