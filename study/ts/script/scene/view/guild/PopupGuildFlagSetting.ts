const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_ConfigLoader, G_Prompt, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonGuildFlag from '../../../ui/component/CommonGuildFlag';
import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { table } from '../../../utils/table';
import GuildFlagColorItemCell from './GuildFlagColorItemCell';
import { PopUpGuildFlagSettingHelper } from './PopupGuildFlagSettingHelper';



@ccclass
export default class PopupGuildFlagSetting extends PopupBase {

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _popBase: CommonNormalSmallPop = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonOk: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonGuildFlag,
        visible: true
    })
    _commonGuildFlag: CommonGuildFlag = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor7: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor8: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor9: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlagColor10: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _flagName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelTime: cc.Label = null;

    _flagItems: Array<any> = [];
    _selectIndex: number;
    public static readonly FLAG_NUM = 10;
    _signalGuildFlagChange: any;
    private _dataList: any[];

    onCreate() {
        this._popBase.setTitle(Lang.get('guild_flag_setting_title'));

        this._initFlagData();
        for (var i = 1; i <= PopupGuildFlagSetting.FLAG_NUM; i += 1) {
            var nodeFlagColor = this['_nodeFlagColor' + (i.toString())];
            var resource = cc.resources.get("prefab/guild/GuildFlagColorItemCell");
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(GuildFlagColorItemCell);
            cell.setIndex(i);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.setTag(i);
            cell.updateUI(i);
            // cell.setTouchEnabled(true);
            var size = cell.node.getContentSize();
            cell.node.setPosition(size.width * 0.5, size.height * 0.5);
            nodeFlagColor.addChild(cell.node);
            this._flagItems.push(cell);
        }
        this._buttonOk.setString(Lang.get('common_btn_name_confirm'));
        this._buttonOk.addClickEventListenerEx(handler(this, this._onClickButtonOK));
        var myGuild = G_UserData.getGuild().getMyGuild();
        // assert(myGuild, 'G_UserData:getGuild():getMyGuild() = nil');
        var icon = myGuild.getIcon();
        this._selectIndex = icon;
        this._selectColor(icon);
        this._updateFlagColor(icon);
    }
    onEnter() {
        this._signalGuildFlagChange = G_SignalManager.addOnce(SignalConst.EVENT_GUILD_FLAG_CHANGE, handler(this, this._onEventGuildFlagChange));
    }
    onExit() {
        this._signalGuildFlagChange.remove();
        this._signalGuildFlagChange = null;
    }
    _initFlagData() {
        var data = [];
        var length = G_ConfigLoader.getConfig('guild_true_flag').length();
        var openServerDay = G_UserData.getBase().getOpenServerDayNum();
        var myGuild = G_UserData.getGuild().getMyGuild();
        var guildIconList = myGuild.getIcon_list();
        var curTime = G_ServerTime.getTime();
        for (var i = 1; i != length; i++) {
            var configInfo = G_ConfigLoader.getConfig('guild_true_flag').get(i);
            if (configInfo) {
                var flagData = {} as any;
                if (i <= 10) {
                    flagData.isUnLock = true;
                    flagData.expireTime = 0;
                    flagData.cfg = configInfo;
                    table.insert(data, flagData);
                } else {
                    var flagData = {} as any;
                    var expireTime = guildIconList[configInfo.id];
                    if (expireTime && curTime < expireTime) {
                        flagData.isUnLock = true;
                        flagData.expireTime = expireTime;
                    } else {
                        flagData.isUnLock = false;
                        flagData.expireTime = 0;
                    }
                    flagData.cfg = configInfo;
                    table.insert(data, flagData);
                }
            }
        }
        this._dataList = data;
    }
    _onEventGuildFlagChange(event, rewards) {
        this.close();
        G_Prompt.showTip(Lang.get('guild_flag_setting_success_tip'));
    }
    _onClickClose() {
        this.close();
    }
    _onClickButtonOK() {
        var iconId = this._selectIndex;
        G_UserData.getGuild().c2sChangeGuildIcon(iconId);
    }
    _updateList() {
    }
    _onItemTouch(index) {
        this._selectIndex = index;
        this._selectColor(index);
        this._updateFlagColor(index);
    }
    _selectColor(index) {
        for (var k in this._flagItems) {
            var v = this._flagItems[k];
            if (parseInt(k) == (index - 1)) {
                v.setSelect(true);
            } else {
                v.setSelect(false);
            }
        }
    }
    _updateFlagColor(index) {
        var myGuild = G_UserData.getGuild().getMyGuild();
        // assert(myGuild, 'G_UserData:getGuild():getMyGuild() = nil');
        var name = myGuild.getName();
        var flagId = index;
        this._commonGuildFlag.updateUI(flagId, name);
        var flagData = this._dataList[flagId];
        if (flagData) {
            this._labelDes.string = (flagData.cfg.description);
            this._buttonOk.setEnabled(true);
            if (flagData.cfg.time_value == 0) {
                this._labelTime.string = (Lang.get('frame_forever'));
                this._labelTime.node.color = (Colors.SYSTEM_TARGET);
            } else if (flagData.isUnLock == false) {
                this._labelTime.string = (Lang.get('frame_time').format(flagData.cfg.time_value));
                this._labelTime.node.color = (Colors.SYSTEM_TARGET_RED);
                this._buttonOk.setEnabled(false);
            } else {
                var timeStr = PopUpGuildFlagSettingHelper.getExpireTimeString(flagData.expireTime)[0];
                this._labelTime.string = (timeStr);
                this._labelTime.node.color = (Colors.SYSTEM_TARGET_RED);
            }
            this._flagName.string = (flagData.cfg.name);
        }
    }

}