const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import GuildHelpList from './GuildHelpList';
import GuildRequestHelpNode from './GuildRequestHelpNode';




@ccclass
export default class GuildHelpView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _fullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _tabGroup: CommonTabGroupScrollVertical = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    _selectTabIndex: number;
    _contentNodes: any[];
    _signalCommonZeroNotice: any;
    _signalRedPointUpdate: any;
    _signalGuildKickNotice: any;

    onCreate() {
        this._selectTabIndex = -1;
        this._contentNodes = [];
        this._topbarBase.setImageTitle('txt_sys_com_juntuanyuanzhu');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GUILD);
        this._initTab();
    }
    onEnter() {
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalGuildKickNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(this, this._onEventGuildKickNotice));
        if (!G_UserData.getGuild().isInGuild()) {
            G_SceneManager.popScene();
            return;
        }
        this._refreshRedPoint();
        if (G_UserData.getGuild().isExpired() == true) {
            G_UserData.getGuild().pullData();
        }
    }
    onExit() {
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalGuildKickNotice.remove();
        this._signalGuildKickNotice = null;
    }
    _onEventCommonZeroNotice(eventName, hour) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        G_UserData.getGuild().pullData();
    }
    _refreshRedPoint() {
        var tabCount = this._tabGroup.getTabCount();
        for (var k = 1; k <= tabCount; k += 1) {
            var redPointShow = false;
            if (k == 1) {
                redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'myHelpRP');
            } else if (k == 2) {
                redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'giveHelpRP');
            }
            this._tabGroup.setRedPointByTabIndex(k, redPointShow);
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        if (funcId && funcId != FunctionConst.FUNC_ARMY_GROUP) {
            return;
        }
        this._refreshRedPoint();
    }
    _initTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('guild_help_tab_title_1'));
        tabNameList.push(Lang.get('guild_help_tab_title_2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._tabGroup.recreateTabs(param);
        this._tabGroup.setTabIndex(0);
    }
    _onTabSelect(index, sender) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        for (var k in this._contentNodes) {
            var node = this._contentNodes[k];
            node.node.active = (false);
        }
        var curContent = this._getCurNodeContent();
        if (curContent) {
            this._updateContent();
            curContent.updateView();
            curContent.node.active = (true);
        }
    }
    _getCurNodeContent() {
        var cell = this._contentNodes[this._selectTabIndex];
        if (cell == null) {
            if (this._selectTabIndex == 0) {
                var resource = cc.resources.get("prefab/guild/GuildRequestHelpNode");
                var node1 = cc.instantiate(resource) as cc.Node;
                cell = node1.getComponent(GuildRequestHelpNode) as GuildRequestHelpNode;
            } else if (this._selectTabIndex == 1) {
                var resource = cc.resources.get("prefab/guildHelp/GuildHelpList");
                var node1 = cc.instantiate(resource) as cc.Node;
                cell = node1.getComponent(GuildHelpList) as GuildHelpList;
            }
            this._nodeContent.addChild(cell.node);
            this._contentNodes[this._selectTabIndex] = cell;
        }
        return cell;
    }
    _updateContent() {
        this._fullScreen.setTitle(Lang.get('guild_help_tab_title_' + (this._selectTabIndex + 1)));
    }
    _onEventGuildKickNotice(event, uid) {
        if (uid == G_UserData.getBase().getId()) {
            UIPopupHelper.popupOkDialog(null, Lang.get('guild_kick_hint'), function () {
                G_SceneManager.popScene();
            }, Lang.get('common_btn_name_confirm'));
        }
    }

}