const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { GuildConst } from '../../../const/GuildConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildMemberListCell from './GuildMemberListCell';
import { GuildUIHelper } from './GuildUIHelper';
import PopupGuildAnnouncement from './PopupGuildAnnouncement';
import PopupGuildCheckApplication from './PopupGuildCheckApplication';
import PopupGuildMemberInfo from './PopupGuildMemberInfo';
import PopupGuildSendMail from './PopupGuildSendMail';


@ccclass
export default class GuildMemberListNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageRoot: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titlePanel6: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnQuit: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnDeclaration: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnApplyList: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnSendMail: CommonButtonLevel0Normal = null;
    _categorySortFlag = [];
    _signalGuildQueryMall: any;
    _signalKickSuccess: any;
    _signalRedPointUpdate: any;
    _signalPromoteSuccess: any;
    _signalGuildUserPositionChange: any;
    _signalMailOnSendMail: any;
    _guildMemberList: any[];
    _lastestSortCategory: any;


    onCreate() {
        // this._listItemSource.setTemplate(GuildMemberListCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        this._btnQuit.setString(Lang.get('guild_btn_quit_guild'));
        this._btnDeclaration.setString(Lang.get('guild_title_declaration'));
        this._btnApplyList.setString(Lang.get('guild_btn_check_application'));
        this._btnSendMail.setString(Lang.get('guild_btn_mail'));

        this._btnApplyList.addClickEventListenerEx(handler(this, this.onButtonApplyList));
        this._btnSendMail.addClickEventListenerEx(handler(this, this.onButtonSendMail));
        this._btnDeclaration.addClickEventListenerEx(handler(this, this.onButtonDeclaration));
        this._btnQuit.addClickEventListenerEx(handler(this, this.onButtonQuit));

        for (var i = 1; i < 7; i += 1) {
            var titlePanel = this['_titlePanel' + i];
            if (titlePanel) {
                this._categorySortFlag[i] = null;
                if (i == 4) {
                    this._categorySortFlag[i] = false;
                    titlePanel.getChildByName("Image").active = true;
                } else {
                    titlePanel.getChildByName("Image").active = false;
                }
                // titlePanel.setTag(i);
                // titlePanel.addClickEventListenerEx(handler(this, this._onButtonTitle));
            }
        }
    }
    onEnter() {
        this._signalGuildQueryMall = G_SignalManager.add(SignalConst.EVENT_GUILD_QUERY_MALL, handler(this, this._onEventGuildQueryMall));
        this._signalKickSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(this, this._onEventGuildKickNotice));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalGuildUserPositionChange = G_SignalManager.add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(this, this._onEventGuildUserPositionChange));
        this._signalPromoteSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(this, this._onEventGuildPromoteSuccess));
        this._signalMailOnSendMail = G_SignalManager.add(SignalConst.EVENT_MAIL_ON_SEND_MAIL, handler(this, this._onEventMailOnSendMail));
        this._refreshRedPoint();
        this._refreshBtnState();
    }
    onExit() {
        this._signalGuildUserPositionChange.remove();
        this._signalGuildUserPositionChange = null;
        this._signalGuildQueryMall.remove();
        this._signalGuildQueryMall = null;
        this._signalPromoteSuccess.remove();
        this._signalPromoteSuccess = null;
        this._signalKickSuccess.remove();
        this._signalKickSuccess = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalMailOnSendMail.remove();
        this._signalMailOnSendMail = null;

        this.unschedule(this.updateListCell);
    }
    _onEventGuildUserPositionChange(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._refreshBtnState();
    }
    _onEventGuildPromoteSuccess(eventName, uid, op) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this.updateView();
    }
    _onEventGuildKickNotice(eventName, uid) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        if (uid != G_UserData.getBase().getId()) {
            this.updateView();
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
    _onEventGuildQueryMall() {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onEventMailOnSendMail() {
        G_Prompt.showTip(Lang.get('mail_send_success_tips'));
    }
    updateView() {
        G_UserData.getGuild().c2sQueryGuildMall();
    }

    private recordIndex: number = 0;
    private count: number = 0;
    _updateList() {
        this._guildMemberList = GuildDataHelper.getGuildMemberListBySort(this._lastestSortCategory - 1, this._categorySortFlag[this._lastestSortCategory]);

        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 330;
        this.recordIndex = 0;
        this.count = 0;

        this.unschedule(this.updateListCell);

        this.schedule(this.updateListCell, 0.1);

    }

    updateListCell() {
        for (let i = this.recordIndex; i < this._guildMemberList.length; i++) {
            if (this._guildMemberList[i]) {
                var resource = cc.resources.get("prefab/guild/GuildMemberListCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(GuildMemberListCell) as GuildMemberListCell;
                cell.setCustomCallback(handler(this, this._onItemSelected));
                cell.setIdx(i);
                this._listItemSource.content.addChild(cell.node);
                cell.updateData(this._guildMemberList[i], i);
                cell.node.y = (i + 1) * -60;
                if (Math.abs(cell.node.y) >= 330) {
                    this._listItemSource.content.height = Math.abs(cell.node.y);
                }
            }
            this.count++;
            this.recordIndex++;
            if (this.count > 2) {
                break;
            }
        }
        if (this.recordIndex >= this._guildMemberList.length) {
            this._listItemSource.scrollToTop();
            this._refreshRedPoint();
            this.unschedule(this.updateListCell);
        }
    }

    _onItemUpdate(item, index) {
        if (this._guildMemberList[index + 1]) {
            item.update(this._guildMemberList[index + 1], index + 1);
        }
    }
    _onItemSelected(index) {
        var data = this._guildMemberList[index];
        if (data) {
            var isSelf = data.isSelf();
            if (isSelf) {
                return;
            }

            var popup: PopupGuildMemberInfo = Util.getNode('prefab/guild/PopupGuildMemberInfo', PopupGuildMemberInfo);
            popup.initData(data);
            popup.openWithAction();
        }
    }
    _onItemTouch(index) {
    }
    onButtonQuit(sender) {
        GuildUIHelper.quitGuild();
    }
    onButtonDeclaration(sender) {
        var lv = UserDataHelper.getParameter(ParameterIDConst.GUILD_DECLARATION_LV);
        if (G_UserData.getGuild().getMyGuildLevel() < lv) {
            G_Prompt.showTip(Lang.get('guild_publish_declare_tips', { value: lv }));
            return;
        }


        var popup: PopupGuildAnnouncement = Util.getNode('prefab/guild/PopupGuildAnnouncement', PopupGuildAnnouncement);
        popup.initData(handler(this, this._onSaveDeclaration));
        popup.setTitle(Lang.get('guild_title_declaration'));
        var content = UserDataHelper.getGuildDeclaration();
        popup.openWithAction();
        popup.setContent(content);
    }
    _onSaveDeclaration(content) {
        G_UserData.getGuild().c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_2);
    }
    onButtonApplyList(sender) {
        // var popup = new PopupGuildCheckApplication();
        // popup.openWithAction();
        var popup: PopupGuildCheckApplication = Util.getNode('prefab/guild/PopupGuildCheckApplication', PopupGuildCheckApplication);
        popup.openWithAction();
    }
    onButtonSendMail(sender) {
        // var PopupGuildSendMail = require('PopupGuildSendMail');
        // var popup = new PopupGuildSendMail();
        // popup.openWithAction();

        var popup: PopupGuildSendMail = Util.getNode('prefab/guild/PopupGuildSendMail', PopupGuildSendMail);
        popup.openWithAction();
    }
    onButtonTitle1() {
        if (this._categorySortFlag[1] == null) {
            this._categorySortFlag[1] = false;
        } else {
            this._categorySortFlag[1] = !this._categorySortFlag[1];
        }
        this._lastestSortCategory = 1;
        this._refreshOrderArrow();
        this._updateList();
    }
    onButtonTitle2() {
        if (this._categorySortFlag[2] == null) {
            this._categorySortFlag[2] = false;
        } else {
            this._categorySortFlag[2] = !this._categorySortFlag[2];
        }
        this._lastestSortCategory = 2;
        this._refreshOrderArrow();
        this._updateList();
    }
    onButtonTitle3() {
        if (this._categorySortFlag[3] == null) {
            this._categorySortFlag[3] = false;
        } else {
            this._categorySortFlag[3] = !this._categorySortFlag[3];
        }
        this._lastestSortCategory = 3;
        this._refreshOrderArrow();
        this._updateList();
    }
    onButtonTitle4() {
        if (this._categorySortFlag[4] == null) {
            this._categorySortFlag[4] = false;
        } else {
            this._categorySortFlag[4] = !this._categorySortFlag[4];
        }
        this._lastestSortCategory = 4;
        this._refreshOrderArrow();
        this._updateList();
    }
    onButtonTitle5() {
        if (this._categorySortFlag[5] == null) {
            this._categorySortFlag[5] = false;
        } else {
            this._categorySortFlag[5] = !this._categorySortFlag[5];
        }
        this._lastestSortCategory = 5;
        this._refreshOrderArrow();
        this._updateList();
    }
    onButtonTitle6() {
        if (this._categorySortFlag[6] == null) {
            this._categorySortFlag[6] = false;
        } else {
            this._categorySortFlag[6] = !this._categorySortFlag[6];
        }
        this._lastestSortCategory = 6;
        this._refreshOrderArrow();
        this._updateList();
    }



    _refreshOrderArrow() {
        for (var i = 1; i < 7; i += 1) {
            var titlePanel = this['_titlePanel' + i];
            if (titlePanel) {
                var image = (titlePanel as cc.Node).getChildByName("Image") as cc.Node;
                if (this._lastestSortCategory == i) {
                    image.active = (true);
                    image.scaleY = (this._categorySortFlag[i] ? -1 : 1);
                } else {
                    image.active = (false);
                }
            }
        }
    }
    _refreshRedPoint() {
        var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'checkApplicationRP');
        this._btnApplyList.showRedPoint(redPointShow);
    }
    _refreshBtnState() {
        var haveCheckApplyPermission = GuildDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_6);
        var canSendMail = GuildDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_11);
        var canSetAnnouncement = GuildDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_7);
        var canSetDeclaration = GuildDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_8);
        var canModifyGuildName = GuildDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_10);
        this._btnApplyList.node.active = (haveCheckApplyPermission);
        this._btnDeclaration.node.active = (canSetDeclaration);
        this._btnSendMail.node.active = (canSendMail);
    }

}