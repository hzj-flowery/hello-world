const { ccclass, property } = cc._decorator;

import { GuildConst } from '../../../const/GuildConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelp from '../../../ui/component/CommonHelp';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildAllRedPacketItemCell from './GuildAllRedPacketItemCell';
import GuildAllRedPacketItemNode from './GuildAllRedPacketItemNode';
import GuildMyRedPacketItemCell from './GuildMyRedPacketItemCell';
import PopupGuildGiveRedPacket from './PopupGuildGiveRedPacket';

@ccclass
export default class GuildRedPacketNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource2: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRemainNum: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;
    _guildAllRedPacketList: any;
    _signalGuildRedPacketDelete: any;
    _signalGuildRedPacketOpenNotice: any;
    _signalGuildRedPacketSend: any;
    _signalGuildRedPacketGetList: any;
    _signalGuildGetUserGuild: any;
    _guildMyRedPacketList: any;


    onCreate() {
        this._commonHelp.updateLangName('HELP_GUILD_RED_PACKET');
        // this._listItemSource.setTemplate(GuildMyRedPacketItemCell);
        // this._listItemSource.setCallback(handler(this, this._onMyRedPacketItemUpdate), handler(this, this._onMyRedPacketItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onMyRedPacketItemTouch));
        // this._listItemSource2.setTemplate(GuildAllRedPacketItemCell);
        // this._listItemSource2.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource2.setCustomCallback(handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalGuildRedPacketDelete = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_DELETE, handler(this, this._onEventGuildRedPacketDelete));
        this._signalGuildRedPacketOpenNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, handler(this, this._onEventGuildRedPacketOpenNotice));
        this._signalGuildRedPacketSend = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_SEND, handler(this, this._onEventGuildRedPacketSend));
        this._signalGuildRedPacketGetList = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_GET_LIST, handler(this, this._onEventGuildRedPacketGetList));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
    }
    onExit() {
        this._signalGuildRedPacketDelete.remove();
        this._signalGuildRedPacketDelete = null;
        this._signalGuildRedPacketOpenNotice.remove();
        this._signalGuildRedPacketOpenNotice = null;
        this._signalGuildRedPacketSend.remove();
        this._signalGuildRedPacketSend = null;
        this._signalGuildRedPacketGetList.remove();
        this._signalGuildRedPacketGetList = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
    }
    updateView() {
        this._refreshCanSnatchRedPacketNum();
        G_UserData.getGuild().c2sGetGuildRedBagList(null);
    }

    private allRedRecordIndex = 0;
    private myRedRecordIndex = 0;
    private allRedCount = 0;
    private myRedCount = 0;
    _updateList() {
        this._guildAllRedPacketList = G_UserData.getGuild().getAllGuildRedPacketList();
        this._guildMyRedPacketList = G_UserData.getGuild().getMyRedPacketList();
        this.allRedRecordIndex = 0;
        this.myRedRecordIndex = 0;

        this._listItemSource2.content.removeAllChildren();
        this._listItemSource2.content.height = 0;
        this.unschedule(this.updateAllRedPacketList);
        this.schedule(this.updateAllRedPacketList, 0.1);

        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 0;
        this.unschedule(this.updateMyRedPacketList);
        this.schedule(this.updateMyRedPacketList, 0.1);

    }

    updateAllRedPacketList() {
        this.allRedCount = 0;
        for (let i = this.allRedRecordIndex; i < this._guildAllRedPacketList.length; i++) {
            if (this._guildAllRedPacketList[i]) {
                var resource = cc.resources.get("prefab/guild/GuildAllRedPacketItemNode");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(GuildAllRedPacketItemNode) as GuildAllRedPacketItemNode;
                this._listItemSource2.content.addChild(cell.node);
                cell.updateData(this._guildAllRedPacketList[i]);
                cell._index = i;
                cell.setCallBack(handler(this, this._onItemTouch));
                cell.node.x = (i % 3) * (168 + 44);
                cell.node.y = (Math.floor(i / 3) + 1) * -(210) - Math.floor(i / 3) * (30);
            }
            this.allRedRecordIndex++;
            this.allRedCount++;
            if (this.allRedCount > 2) {
                break;
            }
        }
        if (this.allRedRecordIndex >= this._guildAllRedPacketList.length) {
            this._listItemSource2.content.setContentSize(this._listItemSource2.content.getContentSize().width, this._listItemSource2.content.getContentSize().height + (210 + 30) * Math.ceil(this._guildAllRedPacketList.length / 3));
            this._listItemSource2.scrollToTop();
            this.unschedule(this.updateAllRedPacketList);
        }
    }

    updateMyRedPacketList() {
        this.myRedCount = 0;
        for (let i = this.myRedRecordIndex; i < this._guildMyRedPacketList.length; i++) {
            if (this._guildMyRedPacketList[i]) {
                var resource = cc.resources.get("prefab/guild/GuildMyRedPacketItemCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(GuildMyRedPacketItemCell) as GuildMyRedPacketItemCell;
                this._listItemSource.content.addChild(cell.node);
                cell.updateData(this._guildMyRedPacketList[i]);
                cell.setCustomCallback(handler(this, this._onMyRedPacketItemTouch));
                cell.setIdx(i);
                cell.node.y = (i + 1) * -108;
                this._listItemSource.content.setContentSize(this._listItemSource.content.getContentSize().width, this._listItemSource.content.getContentSize().height + 108);
            }
            this.myRedRecordIndex++;
            this.myRedCount++;
            if (this.myRedCount > 2) {
                break;
            }
        }
        if (this.myRedRecordIndex >= this._guildMyRedPacketList.length) {
            this._listItemSource2.content.height = (this.myRedRecordIndex) * 108;
            this._listItemSource2.scrollToTop();
            this.unschedule(this.updateMyRedPacketList);
        }
    }


    _onEventGuildRedPacketDelete(event, redPacketData) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onEventGuildRedPacketOpenNotice(event, redPacketData, openRedBagUserList) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onEventGuildRedPacketSend(event, redPacketData) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onEventGuildRedPacketGetList(event, redPacketDataList) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateList();
    }
    _onEventGuildGetUserGuild(event) {
        this._refreshCanSnatchRedPacketNum();
    }
    _onItemUpdate(item, index) {
        if (this._guildAllRedPacketList[index * GuildAllRedPacketItemCell.LINE_ITEM_NUM + 1]) {
            item.update(index, this._guildAllRedPacketList);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(lineIndex, index) {
        var data = this._guildAllRedPacketList[index];
        if (!data) {
            return;
        }
        this._clickRedPacket(data);
    }
    _onMyRedPacketItemUpdate(item, index) {
        if (this._guildMyRedPacketList[index]) {
            item.update(this._guildMyRedPacketList[index]);
        }
    }
    _onMyRedPacketItemSelected(item, index) {
    }
    _onMyRedPacketItemTouch(index) {
        var data = this._guildMyRedPacketList[index];
        if (!data) {
            return;
        }
        this._clickRedPacket(data);
    }
    _clickRedPacket(data) {
        var state = data.getRed_bag_state();
        var isMyRedPacket = data.isSelfRedPacket();
        if (state == GuildConst.GUILD_RED_PACKET_NO_SEND && isMyRedPacket) {
            let popup: PopupGuildGiveRedPacket = Util.getNode('prefab/guild/PopupGuildGiveRedPacket', PopupGuildGiveRedPacket);
            popup.initData(data);
            popup.setClickOtherClose(true);
            popup.openWithAction();
            // var popup = new PopupGuildGiveRedPacket(data);
            // popup.openWithAction();
        } else if (state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE) {
            var success = LogicCheckHelper.checkGuildCanSnatchRedPacket(null), popFunc;
            if (success) {
                G_UserData.getGuild().c2sOpenGuildRedBag(data.getId());
            }
        } else if (state == GuildConst.GUILD_RED_PACKET_RECEIVED) {
            G_UserData.getGuild().c2sSeeGuildRedBag(data.getId());
        }
    }
    _refreshCanSnatchRedPacketNum() {
        var canSnatchNum = GuildDataHelper.getCanSnatchRedPacketNum();
        this._textRemainNum.string = (Lang.get('guild_can_snatch_redpacket_num', { num: canSnatchNum }));
    }

}