const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import PopupBase from '../../../ui/PopupBase';
import { GuildDungeonDataHelper } from '../../../utils/data/GuildDungeonDataHelper';
import { handler } from '../../../utils/handler';
import GuildDungeonEnemyNode from './GuildDungeonEnemyNode';
import GuildDungeonMemberNode from './GuildDungeonMemberNode';
import GuildDungeonPlaybackNode from './GuildDungeonPlaybackNode';


@ccclass
export default class PopupGuildDungeonRecord extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _tabGroup: CommonTabGroup = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    public static readonly TAB_ID_MEMBER_DATA = 1;
    public static readonly TAB_ID_ENEMY_DATA = 2;
    public static readonly TAB_ID_PLAYBACK = 3;
    _signalGuildDungeonRecordSyn: any;
    _signalGuildDungeonMonsterGet: any;
    _selectTabIndex: number;
    _contentNodes: any[];
    _tabDatas: any[];


    onCreate() {
        this._selectTabIndex = -1;
        this._contentNodes = [];
        this._tabDatas = [];
        this._panelBg.setTitle(Lang.get('guilddungeon_record_title'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
    }
    _refreshTabs() {
        var tabIndex = this._selectTabIndex;
        this._tabDatas = [
            PopupGuildDungeonRecord.TAB_ID_MEMBER_DATA,
            PopupGuildDungeonRecord.TAB_ID_PLAYBACK
        ];
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: Lang.get('guilddungeon_tab_names')
        };
        this._tabGroup.recreateTabs(param);
        tabIndex = Math.min(this._tabDatas.length, tabIndex);
        if (tabIndex == -1) {
            this._tabGroup.setTabIndex(0);
        }
        else {
            this._tabGroup.setTabIndex(tabIndex);
        }
    }
    onEnter() {
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        this._refreshTabs();
        this._refreshTotalPointData();
    }
    onExit() {
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
    }
    _onEventGuildDungeonRecordSyn(event) {
        this._refreshTotalPointData();
    }
    _onEventGuildDungeonMonsterGet(event) {
        this._refreshTotalPointData();
    }
    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        for (var k in this._contentNodes) {
            var node = this._contentNodes[k];
            node.node.active = (false);
        }
        var curContent = this._getCurNodeContent();
        if (curContent) {
            curContent.updateView();
            curContent.node.active = (true);
        }
    }
    _getCurNodeContent(): any {
        var tabId = this._tabDatas[this._selectTabIndex];
        var nodeContent = this._contentNodes[tabId];
        if (nodeContent == null) {
            if (tabId == PopupGuildDungeonRecord.TAB_ID_MEMBER_DATA) {
                let res = cc.resources.get("prefab/guildDungeon/GuildDungeonMemberNode");
                let node1 = cc.instantiate(res) as cc.Node;
                nodeContent = node1.getComponent(GuildDungeonMemberNode) as GuildDungeonMemberNode;
            } else if (tabId == PopupGuildDungeonRecord.TAB_ID_ENEMY_DATA) {
                let res = cc.resources.get("prefab/guildDungeon/GuildDungeonEnemyNode");
                let node1 = cc.instantiate(res) as cc.Node;
                nodeContent = node1.getComponent(GuildDungeonEnemyNode) as GuildDungeonEnemyNode;
            } else if (tabId == PopupGuildDungeonRecord.TAB_ID_PLAYBACK) {
                let res = cc.resources.get("prefab/guildDungeon/GuildDungeonPlaybackNode");
                let node1 = cc.instantiate(res) as cc.Node;
                nodeContent = node1.getComponent(GuildDungeonPlaybackNode) as GuildDungeonPlaybackNode;
            }
            this._nodeContent.addChild(nodeContent.node);
            this._contentNodes[tabId] = nodeContent;
        }
        return nodeContent;
    }
    _onClickClose() {
        this.close();
    }
    _refreshTotalPointData() {
        var remainCount = GuildDungeonDataHelper.getGuildDungeonRemainTotalFightCount();
        var rankData = GuildDungeonDataHelper.getMyGuildDungeonRankData();
        this._textPoint.string = ((rankData.getPoint().toString()));
        this._textCount.string = ((remainCount.toString()));
    }

}