const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_ConfigLoader, G_SceneManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { EffectGfxType } from '../../../manager/EffectGfxManager';
// import CommonChatMiniNode from '../chat/CommonChatMiniNode'
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { handler } from '../../../utils/handler';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import GuildWarCityNode from './GuildWarCityNode';


@ccclass
export default class GuildWarWorldMapView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCityParent: cc.Node = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _commonHelp: CommonHelpBig = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    _nodeCitys: any[];
    _signalGuildWarCityInfoGet;
    _signalGuildWarCityDeclareSyn;
    _signalGuildWarBattleInfoGet;
    _signalLoginSuccess;


    protected preloadEffectList = [
        {
            type: EffectGfxType.MovingGfx,
            name: "moving_shuangjian"
        }
    ];

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            var data: Array<ResourceData> = [
                {path: "prefab/guildwar/PopupGuildWarCityInfo", type: cc.Prefab},
                {path: "prefab/guildwar/GuildWarCityNode", type: cc.Prefab},
            ];
            ResourceLoader.loadResArrayWithType(data, handler(this, () => {
                callBack();
            }));
        }
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET, onMsgCallBack);
        G_UserData.getGuildWar().c2sGetGuildWarWorld();
        return msgReg;
    }
    onCreate() {
        this._nodeCitys = [];
        this._topbarBase.setImageTitle('txt_sys_com_guildwar');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._commonHelp.updateUI(FunctionConst.FUNC_GUILD_WAR);
        this._createCityNodes();
        this._commonChat.getPanelDanmu().active = false;
    }
    onEnter() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_GUILD_WAR_MAP);
        this._signalGuildWarCityInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET, handler(this, this._onEventGuildWarCityInfoGet));
        this._signalGuildWarCityDeclareSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN, handler(this, this._onEventGuildWarCityDeclareSyn));
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventLoginSuccess));
        this._startTimer();
        this._startRefreshCityTimer();
        this._refreshTimeView();
        this._refreshCityNodes();
    }
    onExit() {
        this._endTimer();
        this._endRefreshCityTimer();
        this._signalGuildWarCityInfoGet.remove();
        this._signalGuildWarCityInfoGet = null;
        this._signalGuildWarBattleInfoGet.remove();
        this._signalGuildWarBattleInfoGet = null;
        this._signalGuildWarCityDeclareSyn.remove();
        this._signalGuildWarCityDeclareSyn = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;
    }
    _onEventGuildWarBattleInfoGet(event, cityId) {
        G_SceneManager.showScene('guildwarbattle', cityId);
    }
    _onEventGuildWarCityInfoGet(event) {
        this._refreshCityNodes();
    }
    _onEventGuildWarCityDeclareSyn(event) {
        this._refreshCityNodes();
    }
    _onEventLoginSuccess() {
        G_UserData.getGuildWar().clearBattleData();
        G_UserData.getGuildWar().c2sGetGuildWarWorld();
    }
    _startTimer() {
        this.schedule(this._onRefreshTick, 1);
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick);
    }
    _startRefreshCityTimer() {
        var timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        var curTime = G_ServerTime.getTime();
        var time = curTime < timeData.startTime ? timeData.startTime : timeData.endTime;
        G_ServiceManager.registerOneAlarmClock('GuildWarWorldMapView_endtime', time, function () {
            this._refreshCityNodes();
            this._startRefreshCityTimer();
        }.bind(this));
    }
    _endRefreshCityTimer() {
        G_ServiceManager.DeleteOneAlarmClock('GuildWarWorldMapView_endtime');
    }
    _createCityNodes() {
        var GuildWarCity = G_ConfigLoader.getConfig('guild_war_city');
        var cityList = G_UserData.getGuildWar().getCityList();
        for (var k in cityList) {
            var v = cityList[k];
            var cityId = v.getCity_id();
            var config = GuildWarCity.get(cityId);
            // assert(config, 'guild_war_city can not find id ' + tostring(cityId));
            let res = cc.resources.get("prefab/guildwar/GuildWarCityNode");
            let node = cc.instantiate(res) as cc.Node;
            let cityNode = node.getComponent(GuildWarCityNode) as GuildWarCityNode;
            cityNode.initData(config);
            this._nodeCityParent.addChild(cityNode.node);
            this._nodeCitys.push(cityNode);
        }
    }
    _refreshCityNodes() {
        for (var k in this._nodeCitys) {
            var v = this._nodeCitys[k];
            v.updateUI();
        }
    }
    _onRefreshTick(dt) {
        this._refreshTimeView();
    }
    _refreshTimeView() {
        var timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        var curTime = G_ServerTime.getTime();
        if (curTime >= timeData.startTime && curTime < timeData.time1) {
            var txt = G_ServerTime.getLeftSecondsString(timeData.time1, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guildwar_prepare_downtime'));
            this._textTime.string = (txt);
        } else if (curTime >= timeData.time1 && curTime < timeData.endTime) {
            var txt = G_ServerTime.getLeftSecondsString(timeData.endTime, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guildwar_close_downtime'));
            this._textTime.string = (txt);
        } else {
            var txt = G_ServerTime.getLeftSecondsString(timeData.startTime, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guildwar_open_downtime'));
            this._textTime.string = (txt);
        }
    }

}