
import { ExploreConst } from '../../../const/ExploreConst';
import { SignalConst } from '../../../const/SignalConst';
import { ExploreEventData } from '../../../data/ExploreEventData';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { handler } from '../../../utils/handler';
import { Util } from '../../../utils/Util';
import { ExploreResCfg } from '../exploreMain/ExploreResCfg';
import EventAnswerNode from './EventAnswerNode';
import EventBoxNode from './EventBoxNode';
import EventHalfPriceNode from './EventHalfPriceNode';
import EventHeroNode from './EventHeroNode';
import EventRebelBossNode from './EventRebelBossNode';
import EventRebelNode from './EventRebelNode';
import ExploreEventCell from './ExploreEventCell';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupEventBase extends PopupBase {

    static TYPE_PANEL_TABLE: any = PopupEventBase.getTypePanelTable();

    private static getTypePanelTable() {
        var obj: any = {};
        obj[ExploreConst.EVENT_TYPE_ANSWER] = ["EventAnswerNode", EventAnswerNode];//答题
        obj[ExploreConst.EVENT_TYPE_HERO] = ["EventHeroNode", EventHeroNode]; //慕名而来
        obj[ExploreConst.EVENT_TYPE_HALP_PRICE] = ["EventHalfPriceNode", EventHalfPriceNode];//半价物资
        obj[ExploreConst.EVENT_TYPE_REBEL] = ["EventRebelNode", EventRebelNode];//洛阳之乱
        obj[ExploreConst.EVENT_TYPE_REBEL_BOSS] = ["EventRebelBossNode", EventRebelBossNode];//董卓之乱
        obj[ExploreConst.EVENT_TYPE_BOX] = ["EventBoxNode", EventBoxNode];//开宝箱
        return obj;
    }

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _nodeBG: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listEventIcon: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEventPanel: cc.Node = null;

    private _callback;
    private _eventType;
    private _icons: ExploreEventCell[];
    private _eventList: ExploreEventData[];
    private _openIndex;
    private _signalDoEvent;
    private _eventNodeScript: any;

    public preloadRes(callback: Function, eventType) {
        var rescfg: any = ExploreResCfg.getEventResArrs();
        this.preloadResList = rescfg[eventType[0]];
        super.preloadRes(callback)
    }

    setUp(callback, eventType) {
        this._callback = callback;
        this._eventType = eventType;
        this._openIndex = 0;

        this._icons = [];
        this._eventList = [];

        var events = G_UserData.getExplore().getUnFinishEvents();
        for (var i in events) {
            var v = events[i];
            if (this._eventType) {
                if (this._eventType == v.getEvent_type()) {
                    this._eventList.push(v);
                }
            } else {
                this._eventList.push(v);
            }
        }
        this._eventList.sort(function (a, b) {
            var aEndtime = a.getEndTime();
            var bEndtime = b.getEndTime();
            if (aEndtime > bEndtime) return -1;
            return aEndtime < bEndtime ? 1 : 0;
        });

        console.log(this._eventList);

        this._nodeBG.setTitle(Lang.get('explore_event_title'));
        // this._nodeBG.addCloseEventListener(function () {
        //     this.closeWithAction();
        // });
        var count = 0;
        for (i in this._eventList) {
            var v = this._eventList[i];
            var eventCellNode: ExploreEventCell = Util.getNode('prefab/exploreMap/ExploreEventCell', ExploreEventCell);
            eventCellNode.setUp(v, count, handler(this, this._onPanelClick));
            this._listEventIcon.addChild(eventCellNode.node);
            eventCellNode.node.setPosition(0, -40 - 80 * count);
            this._listEventIcon.height = Math.max(508, -eventCellNode.node.y + 40);

            
            // this._listEventIcon.pushBackCustomItem(eventCell);
            this._icons.push(eventCellNode);
            count++;
        }

        if (this._icons.length > 0) {
            this._openIndex = 0;
            this._openFirstEvent();
        }
        this._signalDoEvent = G_SignalManager.add(SignalConst.EVENT_EXPLORE_DO_EVENT, handler(this, this._onEventDoEvent));
    }
    
    onClose() {
        this._callback && this._callback(this._eventType);
        this.removeSignalEvent();
    }
    removeSignalEvent() {
        if (this._signalDoEvent) {
            this._signalDoEvent.remove();
            this._signalDoEvent = null;
        }
    }

    onDestroy() {
        this.removeSignalEvent();
    }
    //事件面板
    _openEventNode(eventData) {
        var eventType = eventData.getEvent_type();
        if (this._eventNodeScript) {
            this._eventNodeScript.node.destroy();
            this._eventNodeScript = null;
        }
        console.log(eventData);
        var prefabName: string = PopupEventBase.TYPE_PANEL_TABLE[eventType][0];
        var type = PopupEventBase.TYPE_PANEL_TABLE[eventType][1];
        var script = Util.getNode('prefab/exploreMap/' + prefabName, type);

        this._eventNodeScript = script;
        script.setUp(eventData);
        this._nodeEventPanel.addChild(this._eventNodeScript.node);
    }
    //点击事件
    _onPanelClick(pos) {
        for (var i in this._icons) {
            var v = this._icons[i];
            v.setChoose(false);
        }
        this._icons[pos].setChoose(true);
        this._openIndex = pos;
        var eventData = this._eventList[pos];
        this._openEventNode(eventData);
    }
    //收到处理event消息
    _onEventDoEvent(eventName, message) {
        // message = message[0];
        console.log('>> _onEventDoEvent', message);
        var eventData = G_UserData.getExplore().getEventById(message.id);
        var eventType = eventData.getEvent_type();
        if (eventType == ExploreConst.EVENT_TYPE_REBEL) {
            if (message['battle_report']) {
                console.log(message['battle_report']);
                var reportData = ReportParser.parse(message.battle_report);
                var battleData = BattleDataHelper.parseExploreRebelBattleData(message, this._eventNodeScript.getBackground());
                G_SceneManager.showScene('fight', reportData, battleData);
                if (reportData.getIsWin()) this._eventNodeScript.doEvent();
            }
        } else if (eventType == ExploreConst.EVENT_TYPE_REBEL_BOSS) {
            if (message['battle_report']) {
                console.log(message['battle_report']);
                var reportData = ReportParser.parse(message.battle_report);
                var battleData = BattleDataHelper.parseExploreBossBattleData(message, this._eventNodeScript.getBackground());
                G_SceneManager.showScene('fight', reportData, battleData);
                if (reportData.getIsWin()) this._eventNodeScript.doEvent();
            }
        } else if (eventType == ExploreConst.EVENT_TYPE_ANSWER) {
            this._eventNodeScript.doEvent(message);
        } else {
            var awards = message['awards'];
            if (awards) {
                G_Prompt.showAwards(awards);
                this._eventNodeScript.doEvent();
            }
        }
    }
    //打开最上面的一个事件
    _openFirstEvent() {
        for (var i in this._icons) {
            var v = this._icons[i];
            v.setChoose(false);
        }
        if (this._icons[0]) {
            this._icons[0].setChoose(true);
            this._openEventNode(this._eventList[0]);
        }
    }

}