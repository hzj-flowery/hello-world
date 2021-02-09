import ViewBase from "../../ViewBase";
import { Lang } from "../../../lang/Lang";
import { G_SignalManager, G_Prompt, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { GuildConst } from "../../../const/GuildConst";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCheckApplicationNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;
    _curCount: any;
    _maxCount: any;
    _guildApplicationList: any;
    _signalGuildGetApplication: any;
    _signalGuildCheckApplication: any;


    onCreate() {
        this._textTip.string = (Lang.get('guild_tip_no_application'));
        // this._listItemSource.setTemplate(GuildCheckApplicationCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalGuildGetApplication = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_APPLICATION, handler(this, this._updateInfo));
        this._signalGuildCheckApplication = G_SignalManager.add(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, handler(this, this._guildCheckApplicationSuccess));
    }
    onExit() {
        this._signalGuildGetApplication.remove();
        this._signalGuildGetApplication = null;
        this._signalGuildCheckApplication.remove();
        this._signalGuildCheckApplication = null;
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildApplication();
    }
    _updateInfo() {
        this._updateList();
        var myGuild = G_UserData.getGuild().getMyGuild();
        var level = G_UserData.getGuild().getMyGuildLevel();
        this._curCount = G_UserData.getGuild().getGuildMemberCount();
        this._maxCount = GuildDataHelper.getGuildMaxMember(level);
        this._textCount.string = (Lang.get('guild_txt_member_count', {
            count1: this._curCount,
            count2: this._maxCount
        }));
    }
    _updateList() {
        this._guildApplicationList = G_UserData.getGuild().getGuildApplicationListBySort();
        if (this._guildApplicationList.length == 0) {
            this._listItemSource.node.active = (false);
            this._textTip.node.active = (true);
        } else {
            this._textTip.node.active = (false);
            this._listItemSource.node.active = (true);
            // this._listItemSource.clearAll();
            // this._listItemSource.resize(this._guildApplicationList.length);
        }
    }
    _onItemUpdate(item, index) {
        if (this._guildApplicationList[index + 1]) {
            item.update(this._guildApplicationList[index + 1]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, type) {
        var data = this._guildApplicationList[index + 1];
        var id = data.getUid();
        if (type == GuildConst.GUILD_CHECK_APPLICATION_OP1) {
            if (this._curCount >= this._maxCount) {
                G_Prompt.showTip(Lang.get('guild_tip_member_count_max'));
                return;
            }
        }
        G_UserData.getGuild().c2sGuildCheckApplication(id, type);
    }
    _guildCheckApplicationSuccess(eventName, op, applicationId) {
        G_Prompt.showTip(Lang.get('guild_tip_application_op_' + (op).toString()));
        G_UserData.getGuild().deleteApplicationDataWithId(applicationId);
        this.updateView();
    }

}