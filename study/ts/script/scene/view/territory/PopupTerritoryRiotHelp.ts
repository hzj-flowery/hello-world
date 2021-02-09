const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { ReportParser } from '../../../fight/report/ReportParser';
import { Colors, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Util } from '../../../utils/Util';
import PopupTerritoryRiotHelpCell from './PopupTerritoryRiotHelpCell';
import { TerritoryHelper } from './TerritoryHelper';


@ccclass
export default class PopupTerritoryRiotHelp extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewItem: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProcess: cc.Node = null;

    _title: string;
    _textTitle: any;
    _labelMaxRank: any;
    _btnClose: any;
    _riotInfos: any[];
    _repressCount: any;
    _signalTerritoryForHelp: any;
    _signalTerritoryRiot: any;


    ctor() {
        this._title = Lang.get('lang_territory_riot_help_title');
        this._textTitle = null;
        this._btnClose = null;
        this._labelMaxRank = null;
        this._riotInfos = [];
        this._repressCount = G_UserData.getTerritory().getRepressCount();
        this._riotInfos = G_UserData.getTerritory().getFriendsRiotInfo();
    }
    onCreate() {
        this.ctor();
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._imageNoTimes.node.active = (false);
    }
    _updateListView() {
        var listView = this._listViewItem;
        // listView.clearAll();
        // listView.setTemplate(PopupTerritoryRiotHelpCell);
        // listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // listView.setCustomCallback(handler(this, this._onItemTouch));
        // listView.resize(this._riotInfos.length);
        if (this._riotInfos.length == 0) {
            this._imageNoTimes.node.active = (true);
        } else {
            this._imageNoTimes.node.active = (false);
        }

        this._listViewItem.content.height = 480;
        this._listViewItem.content.removeAllChildren();
        for (let i = 0; i < this._riotInfos.length; i++) {
            let cell = Util.getNode("prefab/territory/PopupTerritoryRiotHelpCell", PopupTerritoryRiotHelpCell) as PopupTerritoryRiotHelpCell;
            this._listViewItem.content.addChild(cell.node);
            cell.updateUI(i, this._riotInfos[i]);
            cell.setIdx(i);
            cell.setCustomCallback(this._onItemTouch);

            cell.node.x = 0;
            cell.node.y = (i + 1) * 201 * -1;
            this._listViewItem.content.height = Math.abs(cell.node.y) > 480 ? Math.abs(cell.node.y) : 480;
        }


        this._updateRepressRiotNum();
    }
    _onItemTouch(index, riotEvent) {
        //assert(riotEvent, 'PopupTerritoryRiotHelp:_onItemTouch, riotEvent is null');
        //dump(riotEvent);
        var eventId = riotEvent.event.info_id;
        var eventCfg = TerritoryHelper.getRiotInfo(eventId);
        if (LogicCheckHelper.enoughValue(eventCfg.consume_type, eventCfg.consume_value, eventCfg.consume_size) == false) {
            return;
        }
        var helpNumber = parseInt(TerritoryHelper.getTerritoryParameter('help_number'));
        var lessNumber = helpNumber - this._repressCount;
        if (lessNumber <= 0) {
            G_Prompt.showTip(Lang.get('lang_territory_error1'));
            return;
        }
        var messageTable = {
            territory_id: riotEvent.territory_id,
            event_id: riotEvent.event.id,
            friend_id: riotEvent.user_id,
            friend_uuid: riotEvent.uuid,
            friend_sid: riotEvent.sid
        };
        G_UserData.getTerritory().c2sTerritoryHelpRepressRiot(messageTable);
    }
    _startRefreshHandler() {
        this._endRefreshHandler();
        this.schedule(this._onRefreshTick, 3);
    }
    _endRefreshHandler() {
        this.unschedule(this._onRefreshTick);
    }
    _onRefreshTick() {
    }
    _onItemUpdate(item, index) {
        if (this._riotInfos[index + 1]) {
            item.updateUI(index, this._riotInfos[index + 1]);
        }
    }
    _onItemSelected(item, index) {
    }
    onEnter() {
        this._signalTerritoryForHelp = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GET_FORHELP, handler(this, this._onEventTerritoryForHelp));
        this._signalTerritoryRiot = G_SignalManager.add(SignalConst.EVENT_TERRITORY_HELP_REPRESS_RIOT, handler(this, this._onEventTerritoryRepressRiot));
        this._startRefreshHandler();
        this._onUpdateHelpInfo();
        cc.resources.load("prefab/territory/PopupTerritoryRiotHelpCell", (error, res) => {
            this._updateListView();
        });
    }
    onExit() {
        this._endRefreshHandler();
        this._signalTerritoryForHelp.remove();
        this._signalTerritoryForHelp = null;
        this._signalTerritoryRiot.remove();
        this._signalTerritoryRiot = null;
    }
    onBtnCancel() {
        this.close();
    }
    _onEventTerritoryUpdate(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updateListView();
    }
    _updateRepressRiotNum() {
        var helpNumber = parseInt(TerritoryHelper.getTerritoryParameter('help_number'));
        var lessNumber = helpNumber - this._repressCount;
        this._nodeProcess.removeAllChildren();
        var richTextColor1 = Colors.BRIGHT_BG_ONE;
        var richTextColor2 = Colors.BRIGHT_BG_ONE;
        var richText = Lang.get('lang_territory_riot_repress_count', {
            num: lessNumber,
            color1: Colors.colorToNumber(richTextColor1),
            color2: Colors.colorToNumber(richTextColor2),
            max: helpNumber
        });
        let richNode = RichTextExtend.createWithContent(richText);
        richNode.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeProcess.addChild(richNode.node);
        this._nodeProcess.active = (true);
    }
    _onEventTerritoryRepressRiot(id, message) {
        if (message.ret != 1) {
            return;
        }
        var battleReport = message['battle_report'];
        if (battleReport) {
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseTerritoryBattleData(message, 1);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        this._onUpdateHelpInfo();
        this._updateListView();
    }
    _onUpdateHelpInfo() {
        this._repressCount = G_UserData.getTerritory().getRepressCount();
        this._riotInfos = G_UserData.getTerritory().getFriendsRiotInfo();
    }
    _onEventTerritoryForHelp(id, message) {
        this._onUpdateHelpInfo();
        this._updateListView();
    }

}