const { ccclass, property } = cc._decorator;

import { ChatConst } from '../../../const/ChatConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { GuildConst } from '../../../const/GuildConst';
import { SignalConst } from '../../../const/SignalConst';
import { ChatPlayerData } from '../../../data/ChatPlayerData';
import { G_Prompt, G_SceneManager, G_SignalManager, G_TutorialManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { ChatCheck } from '../../../utils/logic/ChatCheck';
import { Util } from '../../../utils/Util';
import GuildListCell from './GuildListCell';
import PopupCreateGuild from './PopupCreateGuild';

@ccclass
export default class PopupGuildListView extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonCreate: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonApply: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonContact: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDeclaration: cc.Label = null;

    _selectIndex: any;
    _guildInfoList: [];
    _resize: boolean;
    _signalCreateSuccess: any;
    _signalApplySuccess: any;
    _signalGuildGetList: any;
    _inRequest: boolean;
    _data: any;
    _lastItem: GuildListCell;
    _firstItem: GuildListCell;
    _signalGuildGetUserGuild:any;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            cc.resources.load("prefab/guild/GuildListCell", cc.Prefab, (err, data) => {
                callBack();
            });
        }
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_GUILD_GET_LIST, onMsgCallBack);
        G_UserData.getGuild().c2sGetGuildList(1);
        return msgReg;
    }

    onCreate() {
        this.setNotCreateShade(false);
        this._selectIndex = null;
        this._guildInfoList = [];
        this._resize = false;
        this._panelBg.setTitle(Lang.get('guild_title_join'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._buttonApply.setString(Lang.get('guild_btn_apply'));
        this._buttonApply.setEnabled(false);
        this._buttonContact.setString(Lang.get('guild_btn_contact'));
        this._buttonCreate.setString(Lang.get('guild_btn_create_guild'));

    }
    onEnter() {
        this._signalCreateSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_CREATE_SUCCESS, handler(this, this._createSuccess));
        this._signalApplySuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_APPLY_SUCCESS, handler(this, this._applySuccess));
        this._signalGuildGetList = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_LIST, handler(this, this._onEventGuildGetList));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
        this._updateList();
        if (G_TutorialManager.isDoingStep(32)) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupGuildListView");
        }
        this._onItemSelected(0, this._firstItem);       //默认选中第一个
    }
    onExit() {
        this._signalCreateSuccess.remove();
        this._signalCreateSuccess = null;
        this._signalApplySuccess.remove();
        this._signalApplySuccess = null;
        this._signalGuildGetList.remove();
        this._signalGuildGetList = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
    }
    _onEventGuildGetList(event) {
        this._inRequest = false;
        this._updateList();
    }
    _updateList() {
        var oldListSize = this._guildInfoList.length;
        this._guildInfoList = G_UserData.getGuild().getGuildListData().getGuildListBySort();
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 479;
        for (let i = 0; i < this._guildInfoList.length; i++) {
            let cell = Util.getNode("prefab/guild/GuildListCell", GuildListCell) as GuildListCell;
            this._listItemSource.content.addChild(cell.node);
            cell.updateItem(i, this._guildInfoList[i])
            cell.setIdx(i);
            cell.setCustomCallback(handler(this, this._onItemSelected));
            cell.node.x = 0;
            cell.node.y = (i + 1) * -60;
            if (Math.abs(cell.node.y) > 479) {
                this._listItemSource.content.height = Math.abs(cell.node.y);
            }
            if (i == 0) {
                this._firstItem = cell;
            }
        }
        this._updateInfo(this._selectIndex);
    }
    _onItemUpdate(item, index, type) {
        if (index == 0) {
            this._firstItem = item;
        }
        if (this._guildInfoList[index]) {
            item.updateItem(index, this._guildInfoList[index], type);
            // item.updateData(this._guildInfoList[index], index, this._selectIndex);
            if (this._selectIndex == index) {
                // //logWarn(string.format('------------------------  %d true', index));
            }
        }
    }
    _onItemSelected(index, item) {
        if (item == null || this._selectIndex == index) {
            return;
        }
        if (this._lastItem) {
            // //logWarn(string.format('------------------------  %d false', this._selectIndex));
            this._lastItem.setSelected(false);
        }
        item.setSelected(true);
        // //logWarn(string.format('------------------------  %d true', index));
        this._selectIndex = index;
        this._lastItem = item;
        this._updateInfo(index);
    }
    _onItemTouch(index) {
    }
    _updateInfo(index) {
        this._data = this._guildInfoList[index];
        if (!this._data) {
            this._buttonApply.setEnabled(false);
            this._buttonContact.setEnabled(false);
            return;
        }
        this._buttonApply.setEnabled(true);
        this._buttonContact.setEnabled(true);
        var declaration = GuildDataHelper.getGuildDeclaration(this._data);
        this._textDeclaration.string = (declaration);
        var number = this._data.getMember_num();
        var hasApplication = this._data.isHas_application();
        var maxNumber = GuildDataHelper.getGuildMaxMember(this._data.getLevel());
        var isFull = number >= maxNumber;
        if (isFull && !hasApplication) {
            this._buttonApply.setEnabled(false);
        } else {
            var hasApplication = this._data.isHas_application();
            var btnString = hasApplication && Lang.get('guild_btn_cancel_apply') || Lang.get('guild_btn_apply');
            this._buttonApply.setString(btnString);
        }
    }
    onButtonApply() {

        var power = G_UserData.getBase().getPower();
        var fightData = this._data.getAuto_jion_power();
        if(fightData>power)
        {
            G_Prompt.showTip("战力不足，请继续努力哟");
            return;
        }

        var hasApplication = this._data.isHas_application();
        var op = hasApplication ? GuildConst.GUILD_APPLY_OP2 : GuildConst.GUILD_APPLY_OP1;
        if (op == GuildConst.GUILD_APPLY_OP1) {
            if (!GuildDataHelper.checkCanApplyJoinInGuild()) {
                return;
            }
        }
        var guildId = this._data.getId();
        G_UserData.getGuild().c2sGuildApplication(guildId, op);
    }
    onButtonContact() {
        if (!this._data) {
            return;
        }
        if (this._data.getLeader_base_id() != 0) {
            if (!ChatCheck.chatMsgSendCheck(ChatConst.CHANNEL_PRIVATE, true, true, null)) {
                return;
            }
            let chat = new ChatPlayerData()
            chat.setDataByGuildUnitData(this._data);
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT, [
                ChatConst.CHANNEL_PRIVATE,
                chat
            ]);
        }
    }
    onButtonCreate() {
        cc.resources.load("prefab/guild/PopupCreateGuild", cc.Prefab, handler(this, (error, resource) => {
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(PopupCreateGuild);
            cell.initData(handler(this, this._doCreateGuild))
            cell.openWithAction();
        }));
    }
    _doCreateGuild(guildName, icon) {
        G_UserData.getGuild().c2sCreateGuild(guildName);
    }
    _onClickClose() {
        this.close();
    }
    _applySuccess(eventName, guildId, op) {
        var hasApplication = true;
        if (op == GuildConst.GUILD_APPLY_OP1) {
            hasApplication = true;
            G_Prompt.showTip(Lang.get('guild_apply_success'));
        } else if (op == GuildConst.GUILD_APPLY_OP2) {
            hasApplication = false;
            G_Prompt.showTip(Lang.get('guild_unapply_success'));
        }
        if (this._data) {
            this._data.setHas_application(hasApplication);
        }
        if (this._selectIndex != null) {
            this._updateInfo(this._selectIndex);
        }
        this._refreshSelectItem();
    }

    _onEventGuildGetUserGuild(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        //自动进入
        this.close();
        G_SceneManager.showScene("guild");
    }

    _refreshSelectItem() {
        var selectItem = this._lastItem;
        if (selectItem && this._guildInfoList[this._selectIndex]) {
            selectItem.updateData(this._guildInfoList[this._selectIndex], this._selectIndex, this._selectIndex);
        }
    }
    _createSuccess() {
        this.close();
        G_SceneManager.showScene('guild');
        this.scheduleOnce(function () {
            G_Prompt.showTip(Lang.get('guild_tip_create_guild_success'));
        }, 0.1);
    }

}