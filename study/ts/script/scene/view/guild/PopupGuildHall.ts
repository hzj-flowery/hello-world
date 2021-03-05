const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { GuildConst } from '../../../const/GuildConst';
import { SignalConst } from '../../../const/SignalConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import PopupBase from '../../../ui/PopupBase';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import GuildCheckApplicationNode from './GuildCheckApplicationNode';
import GuildHallBaseInfoNode from './GuildHallBaseInfoNode';
import GuildLogNode from './GuildLogNode';
import GuildMemberListNode from './GuildMemberListNode';
import GuildMemberListNodeTrain from './GuildMemberListNodeTrain';
import GuildRedPacketNode from './GuildRedPacketNode';
import GuildWageNode from './GuildWageNode';


@ccclass
export default class PopupGuildHall extends PopupBase {

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
    _selectTabIndex: number;
    _contentNodes: any[];
    _tabDatas: any;
    _signalGuildUserPositionChange: any;
    _signalRedPointUpdate: any;
    _firstIn: boolean;

    protected preloadResList = [
        { path: "prefab/guild/GuildHallBaseInfoNode", type: cc.Prefab },
        { path: "prefab/guild/GuildMemberListNodeTrain", type: cc.Prefab },
        { path: "prefab/guild/GuildMemberListNode", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildMemberInfo", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildAnnouncement", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildChangeName", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildCheckApplication", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildSendMail", type: cc.Prefab },
        { path: "prefab/guild/GuildCheckApplicationCell", type: cc.Prefab },
        { path: "prefab/guild/GuildCheckApplicationNode", type: cc.Prefab },
        { path: "prefab/guild/GuildLogNode", type: cc.Prefab },
        { path: "prefab/guild/GuildWageNode", type: cc.Prefab },
        { path: "prefab/guild/GuildRedPacketNode", type: cc.Prefab },
        { path: "prefab/guild/GuildTaskItemCell", type: cc.Prefab },
        { path: "prefab/guild/GuildMemberListCellTrain", type: cc.Prefab },
        { path: "prefab/guild/GuildMemberListCell", type: cc.Prefab },
        { path: "prefab/guild/GuildMyRedPacketItemCell", type: cc.Prefab },
        { path: "prefab/guild/GuildAllRedPacketItemNode", type: cc.Prefab },
        { path: "prefab/guild/GuildLogNode", type: cc.Prefab },
        { path: "prefab/guild/GuildLogTimeTitle", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildOpenRedPacket", type: cc.Prefab },
        { path: "prefab/guild/GuildCommonSnatchRedPacketNode", type: cc.Prefab },
        { path: "prefab/guild/GuildReceiveRecordItemCell", type: cc.Prefab },
        { path: "prefab/guild/PopupGuildGiveRedPacket", type: cc.Prefab },
        { path: "prefab/common/CommonEditBox", type: cc.Prefab },
    ]

    onCreate() {
        this._firstIn = true;
        this._selectTabIndex = -1;
        this._contentNodes = [];
        this._tabDatas = [];
        this._panelBg.setTitle(Lang.get('guild_title_hall'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
    }
    _isHavePermission() {
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var userPosition = userMemberData.getPosition();
        var isHave = GuildDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_6);
        return isHave;
    }
    _refreshTabs() {
        var tabIndex = this._selectTabIndex;
        var isShowCheckApplication = this._isHavePermission();
        this._tabDatas = [];
        this._tabDatas = [
            1,
            2,
            5,
            6,
            4
        ];

        var param = {
            callback: handler(this, this.onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: isShowCheckApplication && Lang.get('guild_hall_tab_titles') || Lang.get('guild_hall_tab_titles_2')
        };

        var data: Array<ResourceData> = [
            { path: "prefab/guild/GuildHallBaseInfoNode", type: cc.Prefab },
            { path: "prefab/guild/GuildMemberListNodeTrain", type: cc.Prefab },
            { path: "prefab/guild/GuildMemberListNode", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildMemberInfo", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildAnnouncement", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildChangeName", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildCheckApplication", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildSendMail", type: cc.Prefab },
            { path: "prefab/guild/GuildCheckApplicationCell", type: cc.Prefab },
            { path: "prefab/guild/GuildCheckApplicationNode", type: cc.Prefab },
            { path: "prefab/guild/GuildLogNode", type: cc.Prefab },
            { path: "prefab/guild/GuildWageNode", type: cc.Prefab },
            { path: "prefab/guild/GuildRedPacketNode", type: cc.Prefab },
            { path: "prefab/guild/GuildTaskItemCell", type: cc.Prefab },
            { path: "prefab/guild/GuildMemberListCellTrain", type: cc.Prefab },
            { path: "prefab/guild/GuildMemberListCell", type: cc.Prefab },
            { path: "prefab/guild/GuildMyRedPacketItemCell", type: cc.Prefab },
            { path: "prefab/guild/GuildAllRedPacketItemNode", type: cc.Prefab },
            { path: "prefab/guild/GuildLogNode", type: cc.Prefab },
            { path: "prefab/guild/GuildLogTimeTitle", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildOpenRedPacket", type: cc.Prefab },
            { path: "prefab/guild/GuildCommonSnatchRedPacketNode", type: cc.Prefab },
            { path: "prefab/guild/GuildReceiveRecordItemCell", type: cc.Prefab },
            { path: "prefab/guild/PopupGuildGiveRedPacket", type: cc.Prefab },
            { path: "prefab/common/CommonEditBox", type: cc.Prefab },
        ];
        ResourceLoader.loadResArrayWithType(data, (error, data) => {
            this._tabGroup.recreateTabs(param);
            if (this._firstIn == true) {
                this._firstIn = false;
                this._tabGroup.setTabIndex(0);
            }
            else {
                if (tabIndex == 0) {
                    this._tabGroup.setTabIndex(0);
                } else {
                    this._selectTabIndex = 0;
                    tabIndex = Math.min(this._tabDatas.length, tabIndex);
                    this._tabGroup.setTabIndex(tabIndex);
                }
            }
            this._refreshRedPoint();
        });

        // this._tabGroup.recreateTabs(param);
        // if (this._firstIn == true) {
        //     this._firstIn = false;
        //     this._tabGroup.setTabIndex(0);
        // }
        // else {
        //     if (tabIndex == 0) {
        //         this._tabGroup.setTabIndex(0);
        //     } else {
        //         this._selectTabIndex = 0;
        //         tabIndex = Math.min(this._tabDatas.length, tabIndex);
        //         this._tabGroup.setTabIndex(tabIndex);
        //     }
        // }
        // this._refreshRedPoint();


    }
    onEnter() {
        this._signalGuildUserPositionChange = G_SignalManager.add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(this, this._refreshTabs));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._refreshTabs();
    }
    onExit() {
        this._signalGuildUserPositionChange.remove();
        this._signalGuildUserPositionChange = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }
    onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        for (var k in this._contentNodes) {
            var node = this._contentNodes[k];
            if (node) {
                node.node.active = (false);
            }
        }
        this._tabGroup.setTabIndex(index);
        var curContent = this._getCurNodeContent();
        if (curContent) {
            curContent.updateView();
            curContent.node.active = (true);
        }
    }
    _getCurNodeContent() {
        var tabId = this._tabDatas[this._selectTabIndex];
        if (tabId == null) {
            tabId = 1;
        }
        var nodeContent = this._contentNodes[tabId];
        if (nodeContent == null) {
            console.log("点击分页" + tabId);
            if (tabId == 1) {
                var resource = cc.resources.get("prefab/guild/GuildHallBaseInfoNode");
                nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildHallBaseInfoNode);
            } else if (tabId == 2) {
                var open = FunctionCheck.funcIsShow(FunctionConst.FUNC_GUILD_TRAIN);
                if (open) {
                    var resource = cc.resources.get("prefab/guild/GuildMemberListNodeTrain");
                    nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildMemberListNodeTrain);
                } else {
                    var resource = cc.resources.get("prefab/guild/GuildMemberListNode");
                    nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildMemberListNode);
                }
            } else if (tabId == 3) {
                var resource = cc.resources.get("prefab/guild/GuildCheckApplicationNode");
                nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildCheckApplicationNode);
            } else if (tabId == 4) {
                var resource = cc.resources.get("prefab/guild/GuildLogNode");
                nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildLogNode);
            } else if (tabId == 5) {
                var resource = cc.resources.get("prefab/guild/GuildWageNode");
                nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildWageNode);
            } else if (tabId == 6) {
                var resource = cc.resources.get("prefab/guild/GuildRedPacketNode");
                nodeContent = (cc.instantiate(resource) as cc.Node).getComponent(GuildRedPacketNode);
            }
            this._nodeContent.addChild(nodeContent.node);
            this._contentNodes[tabId] = nodeContent;
        }
        return nodeContent;
    }
    _onClickClose() {
        this.close();
    }
    _refreshRedPoint() {
        var tabCount = this._tabGroup.getTabCount();
        for (var k = 0; k < tabCount; k += 1) {
            var tabId = this._tabDatas[k];
            var redPointShow = false;
            if (tabId == 2) {
                redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'checkApplicationRP');
            } else if (tabId == 6) {
                redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'redPacketRP');
            } else if (tabId == 1) {
                redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'guildTaskRP');
            }
            this._tabGroup.setRedPointByTabIndex(k + 1, redPointShow);
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId && funcId != FunctionConst.FUNC_ARMY_GROUP) {
            return;
        }
        this._refreshRedPoint();
    }

}