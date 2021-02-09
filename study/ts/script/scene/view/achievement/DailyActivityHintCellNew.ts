import CommonListItem from "../../../ui/component/CommonListItem";
import { G_ServerTime, Colors, G_UserData, G_ConfigLoader, G_SceneManager, G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import UIHelper from "../../../utils/UIHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { handler } from "../../../utils/handler";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { GuildDungeonDataHelper } from "../../../utils/data/GuildDungeonDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { SingleRaceDataHelper } from "../../../utils/data/SingleRaceDataHelper";

const { ccclass, property } = cc._decorator;


var nameConfig = {
    "军团BOSS": "icon_activity_guildboss2_txt",
    "三国战记": "icon_activity_threecountrybattle2_txt",
    "阵营竞技": "icon_activity_campbattle2_txt",
    "华容道": "icon_activity_runway2_txt",
    "军团战": "icon_activity_guildbattle3_txt",
    "军团试炼": "icon_activity_guildpve2_txt",
    "王者之战": "icon_activity_fight2_txt",
    "先秦皇陵": "icon_activity_qintomb2_txt",
    "跨服军团战": "icon_activity_guildbattle4_txt",
    "跨服个人竞技": "icon_activity_campbattle4_txt",
    "军团答题": "icon_activity_answer2_txt",
    "全服答题": "icon_activity_serveranswer2_txt",
    "暗度陈仓": "icon_activity_anduchengcang2_txt",
    "跨服BOSS": "icon_activity_crossguildboss2_txt"
}

var statusconfig = {
    [1]: "img_seal_jintian",
    [2]: "img_seal_jijiangkaiqi",
    [3]: "img_seal_jijiangkaiqi",
    [4]: "img_seal_mingtian",
    [5]: "img_seal_weikaiqi",
    [6]: "img_yiwancheng",
    [7]: "img_seal_yibaoming"
}

@ccclass
export default class DailyActivityHintCellNew extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgPhoto: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgName: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _openTimeDes: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _openTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _richTextNode: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _count: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgStatus: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnGo: CommonButtonLevel1Highlight = null;

    private _cellIndex: number;
    private _curSelectIndex: number;
    private _data: any;
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._resourceNode.on(cc.Node.EventType.TOUCH_END, this._onTouchBeganEvent, this);
        this._btnGo.setString(Lang.get('common_btn_goto'));
        this._btnGo.addClickEventListenerEx(handler(this, this._onBtnGo));
    }
    onExit(): void {
        if (this._paiMaiCountDownHandler)
            this.unschedule(this._paiMaiCountDownHandler);
        this._paiMaiCountDownHandler = null;
        if (this._singleRaceChampionHandler)
            this.unschedule(this._singleRaceChampionHandler);
        this._singleRaceChampionHandler = null;
    }
    private _onBtnGo(): void {

        if (this._data.function_id == FunctionConst.FUNC_GUILD_DUNGEON) {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (!isInGuild) {
                G_Prompt.showTip(Lang.get('guilddungeon_not_open_as_no_guild'));
                return;
            }
            if (!GuildDungeonDataHelper.hasGuildDungeonMonsterData()) {
                var stageOpenNum = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENNUM);
                G_Prompt.showTip(Lang.get('guilddungeon_not_open_as_member_num', { value: stageOpenNum }));
                return;
            }
        }
        else if (this._data.function_id == FunctionConst.FUNC_WORLD_BOSS) {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (!isInGuild) {
                G_Prompt.showTip(Lang.get('guildboss_not_open_as_no_guild'));
                return;
            }
            let isVote = G_UserData.getWorldBoss().isCanVote();
            if (isVote) {
                //报名
                G_UserData.getWorldBoss().c2sWorldBossVote();
                return;
            }
        }
        else if (this._data.function_id == FunctionConst.FUNC_CROSS_WORLD_BOSS) {
            let isInGuild = G_UserData.getGuild().isInGuild();
            if (!isInGuild) {
                G_Prompt.showTip(Lang.get('guildcrossboss_not_open_as_no_guild'));
                return;
            }
            let isVote = G_UserData.getCrossWorldBoss().isCanVote();
            if (isVote) {
                //报名
                G_UserData.getCrossWorldBoss().c2sCrossWorldBossVote();
                return;
            }
        }
        WayFuncDataHelper.gotoModuleByFuncId(this._data.function_id);
    }
    updateUI(cellindex, dataP) {
        this._cellIndex = cellindex;
        this._curSelectIndex = dataP[1];
        this._data = dataP[0];
        var date: any = G_ServerTime.getDateObject();
        var curTodayTime = date.hour * 3600 + date.min * 60 + date.sec;
        this._showRedPoint(this._data.function_id);

        //奖励
        // var richtext = RichTextExtend.createRichTextByFormatString2(this._data.description, Colors.DARK_BG_ONE, 20);
        // richtext.node.setAnchorPoint(cc.v2(0, 1));
        // richtext.maxWidth = 630;
        this._richTextNode.string = (this._data.reward_description);

        /**
         * 1 距离活动开启的时间大于30min 
         * 2 距离活动开启的时间小于30min  
         * 3 已开启活动
         * 4 明天开启的活动 
         * 5 后天及以后开启的活动	
         */
        var activityStatus: number = 5;

        this._count.string = "";


        this._openTime.string = "时间:";
        this._openTimeDes.node.x = 175;
        //时间描述
        if (this._data.isTodayOpen) {
            //今天开启的活动是否结束了
            if (this._data.isTodayEnd) {
                if (this._data.isTomorrowOpen) {
                    activityStatus = 4;
                    this._openTimeDes.string = (Lang.get('lang_time_limit_activity_today_end'));//今日活动结束
                } else {
                    this._openTimeDes.string = (this._data.start_des);
                    activityStatus = 5;
                }
            } else {
                if (this._data.isOpenIng) {
                    activityStatus = 3;
                    this._openTimeDes.string = (Lang.get('lang_time_limit_activity_ing'));
                } else {
                    var hour = Math.floor(this._data.startTime / 3600);
                    var min = Math.floor(this._data.startTime % 3600 / 60);
                    var timeStr: string = "";
                    if (hour < 10)
                        timeStr = "0" + hour;
                    else
                        timeStr = hour + "";
                    if (min < 10)
                        timeStr = timeStr + ":0" + min;
                    else
                        timeStr = timeStr + ":" + min;
                    this._openTimeDes.string = (Lang.get('lang_time_limit_activity_open_time', { time: timeStr }));
                    var curTime = G_ServerTime.getTime();
                    var curDayTime = G_ServerTime.getDateObject(curTime);
                    var curPastTime = curDayTime.getHours() * 60 * 60 + curDayTime.getMinutes() * 60 + curDayTime.getSeconds();
                    let diffTime = (this._data.startTime - curPastTime) / 60;//分钟
                    activityStatus = diffTime > 30 ? 1 : 2;
                }
            }
        } else {
            if (this._data.openServerTimeOpen > 0) {
                var openServerNum = G_UserData.getBase().getOpenServerDayNum();
                var leftDay = this._data.openServerTimeOpen - openServerNum;
                if (leftDay > 0) {
                    this._openTimeDes.string = (Lang.get('lang_time_limit_activity_open_server_time', { num: leftDay }));
                    activityStatus = leftDay == 1 ? 4 : 5;//明天或者后天开启
                } else {

                    this._openTimeDes.string = (this._data.start_des);
                }
            } else {

                this._openTimeDes.string = (this._data.start_des);
            }
        }
        var FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        var functionConfig = FunctionLevelConfig.get(this._data.function_id);
        //assert((functionConfig != null, 'functionConfig can not find');

        //活动名称
        this._imgName.node.addComponent(CommonUI).loadTexture(Path.getAchievementIcon(nameConfig[this._data.title]))
        var iconPath;
        if (this._data.icon && this._data.icon != '') {
            iconPath = Path.getLimitActivityIcon(this._data.icon);
        } else {
            iconPath = Path.getCommonIcon('main', functionConfig.icon);
        }
        var comm1 = this._imgPhoto.node.getComponent(CommonUI);
        if (!comm1) comm1 = this._imgPhoto.node.addComponent(CommonUI)
        comm1.loadTexture(iconPath);
        this.setHighlight(this._cellIndex == this._curSelectIndex);

        this._btnGo.node.active = false;
        this._imgStatus.node.active = false;
        var comm1 = this._imgStatus.node.getComponent(CommonUI);
        if (!comm1) comm1 = this._imgStatus.node.addComponent(CommonUI);

        if (this._data.function_id == FunctionConst.FUNC_GRAIN_CAR && this._data.isTodayOpen && !this._data.isOpenIng && !this._data.isTodayEnd) {
            //暗度成仓 捐献 优先显示
            activityStatus = 3;
            this._btnGo.setString("捐献");
        }
        else if (this._data.function_id == FunctionConst.FUNC_CAMP_RACE && this._data.isTodayOpen && !this._data.isOpenIng && !this._data.isTodayEnd) {
            //报名
            activityStatus = 3;
            this._btnGo.setString("报名");
            this._btnGo.showRedPoint(!G_UserData.getCampRaceData().isSignUp());
        }
        else {
            this._btnGo.setString(Lang.get('common_btn_goto'));
        }
        if (this._data.function_id != FunctionConst.FUNC_GUILD_DUNGEON || this._data.function_id != FunctionConst.FUNC_WORLD_BOSS)
            comm1.loadTexture(Path.getAchievementIcon(statusconfig[activityStatus]));
        switch (activityStatus) {
            case 1: this._imgStatus.node.active = true; break;
            case 2: this._imgStatus.node.active = true; break;
            case 3: this._btnGo.node.active = true; break;
            case 4: this._imgStatus.node.active = true; break;
            case 5: this._imgStatus.node.active = true; break;
        }

        //对于军团试炼特殊处理
        if (this._data.function_id == FunctionConst.FUNC_GUILD_DUNGEON) {
            var res = GuildDungeonDataHelper.isGuildDungenoInAttackTime();
            var inAttackTime = res[0];
            var startTime = res[1] as number;
            var endTime = res[2] as number;
            this._btnGo.showRedPoint(false);
            G_ServerTime.getTime();
            if (inAttackTime) {
                //在挑战阶段
                var count = GuildDungeonDataHelper.getGuildDungenoFightCount();
                if (count <= 0) {
                    //明天
                    comm1.loadTexture(Path.getAchievementIcon(statusconfig[6]));
                    this._imgStatus.node.active = true;
                    this._btnGo.node.active = false;
                    this._openTimeDes.string = this._data.description;
                    this._openTime.string = "拍卖倒计时:";
                    this.openPaiMaiCountDown();
                }
                else {
                    //还有机会 可以参与挑战
                    this._count.string = "剩余：" + count + "次";
                    this._btnGo.setString("挑战");
                    this._btnGo.node.active = true;
                    this._imgStatus.node.active = false;
                    this._btnGo.showRedPoint(GuildDungeonDataHelper.hasGuildDungeonMonsterData());
                }
            }
            else {
                //不在挑战阶段
                //明天
                //不在这个时间 
                comm1.loadTexture(Path.getAchievementIcon(statusconfig[activityStatus]));
                this._imgStatus.node.active = true;
                this._btnGo.node.active = false;
                this._openTimeDes.string = this._data.description;
            }

        }
        else if (this._data.function_id == FunctionConst.FUNC_WORLD_BOSS&&this._data.isTodayOpen&&!this._data.isTodayEnd&&!this._data.isOpenIng) {
            //军团boss
            let isCanVote = G_UserData.getWorldBoss().isCanVote();
            if (isCanVote) {
                this._btnGo.setString("报名");
                this._btnGo.node.active = true;
                this._imgStatus.node.active = false;
                this._btnGo.showRedPoint(true);
            }
            else if (G_UserData.getWorldBoss().isHasVote()) {
                //明天
                comm1.loadTexture(Path.getAchievementIcon(statusconfig[7]));
                this._imgStatus.node.active = true;
                this._btnGo.node.active = false;
            }
            else {
                comm1.loadTexture(Path.getAchievementIcon(statusconfig[activityStatus]));
            }
        }
        else if(this._data.function_id == FunctionConst.FUNC_CROSS_WORLD_BOSS&&this._data.isTodayOpen&&!this._data.isTodayEnd&&!this._data.isOpenIng)
        {
             //跨服boss
             let isCanVote = G_UserData.getCrossWorldBoss().isCanVote();
             if (isCanVote) {
                 this._btnGo.setString("报名");
                 this._btnGo.node.active = true;
                 this._imgStatus.node.active = false;
                 this._btnGo.showRedPoint(true);
             }
             else if (G_UserData.getCrossWorldBoss().isHasVote()) {
                 //明天
                 comm1.loadTexture(Path.getAchievementIcon(statusconfig[7]));
                 this._imgStatus.node.active = true;
                 this._btnGo.node.active = false;
             }
             else {
                 comm1.loadTexture(Path.getAchievementIcon(statusconfig[activityStatus]));
             }
        }
        else if (this._data.function_id == FunctionConst.FUNC_SINGLE_RACE) {
            var beginTime = SingleRaceDataHelper.getStartTime();
            var countDown = beginTime - G_ServerTime.getTime();
            var msStr = G_ServerTime.getLeftDHMSFormatEx(beginTime);
            if (countDown>0) {
                //等待开启
                this._openTimeDes.string = msStr;
            }
        }

    }

    private openPaiMaiCountDown(): void {
        if (this._paiMaiCountDownHandler)
            this.unschedule(this._paiMaiCountDownHandler);
        this._paiMaiCountDownHandler = handler(this, this.onPaiMaiCountDown);
        this.schedule(this._paiMaiCountDownHandler, 1);
        this.onPaiMaiCountDown();
    }
    private _paiMaiCountDownHandler: Function;
    private _singleRaceChampionHandler: Function;
    private _limitConfig:any;
    private onPaiMaiCountDown(): void {
        this._openTimeDes.node.x = 232;
        let t = G_ServerTime.getTime();
        if(!this._limitConfig)
        this._limitConfig = G_ConfigLoader.getConfig(ConfigNameConst.TIME_LIMIT_ACTIVITY);
        let finishTime = this._limitConfig.get(3)["finish_time"];
        let t1 = parseInt(finishTime) - G_ServerTime.secondsFromToday(t);
        let str = "";
        if (t1 < 0)
            str = "00:00:00";
        else
            str = G_ServerTime.getTimeStringHMS(t1);
        this._openTimeDes.string = str;
    }
    setHighlight(trueOrFalse) {
        if (trueOrFalse) {
            this._resourceNode.addComponent(CommonUI).loadTexture(Path.getAchievementIcon('img_com_board01_large_list02'));
        } else {
            this._resourceNode.addComponent(CommonUI).loadTexture(Path.getCommonRankUI('img_com_board01_large_list01'));
        }
    }
    _onTouchBeganEvent(touch: cc.Touch, event) {

        this.dispatchCustomCallback(this._cellIndex);
        this.setHighlight(true);
    }

    _showRedPoint(funcId) {
        var redImg = this._resourceNode.getChildByName('redPoint');
        if (!redImg) {
            redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
            redImg.name = ('redPoint');
            redImg.setPosition(30, this._resourceNode.getContentSize().height - 30);
            this._resourceNode.addChild(redImg);
        }
        if (funcId == FunctionConst.FUNC_CAMP_RACE) {
            var showCmpRaceRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
            redImg.active = (showCmpRaceRedPoint);
        } else {
            redImg.active = (false);
        }
    }


}